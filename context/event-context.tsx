import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { useTeam } from "@/context/team-context";
import { supabase } from "@/lib/supabase";
import { demoEvents } from "@/data/demo-data";
import type {
  EventResponse,
  EventResponseValue,
  EventResponseWithProfile,
  SaveTeamEventParams,
  TeamEvent,
  TeamEventInput,
  TeamEventType,
  TeamEventWithResponse,
  TeamMembershipWithProfile,
} from "@/types/team";
import { toIsoFromLocalInput } from "@/utils/event-dates";
import { hasRole } from "@/utils/roles";

type EventContextValue = {
  events: TeamEventWithResponse[];
  upcomingEvents: TeamEventWithResponse[];
  pastEvents: TeamEventWithResponse[];
  cancelledEvents: TeamEventWithResponse[];
  nextEvent: TeamEventWithResponse | null;
  isLoading: boolean;
  respondingEventId: string | null;
  savingEvent: boolean;
  errorMessage: string;
  successMessage: string;
  refreshEvents: () => Promise<void>;
  createEvent: (params: SaveTeamEventParams) => Promise<TeamEvent>;
  updateEvent: (params: SaveTeamEventParams) => Promise<TeamEvent>;
  cancelEvent: (eventId: string) => Promise<TeamEvent>;
  respondToEvent: (eventId: string, response: EventResponseValue, note?: string) => Promise<EventResponse>;
  clearEventResponse: (eventId: string) => Promise<void>;
  getEventResponsesWithProfiles: (event: TeamEventWithResponse) => EventResponseWithProfile[];
  clearMessages: () => void;
};

type EventRow = {
  id: string;
  team_id: string;
  created_by: string;
  event_type: TeamEventType;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  response_deadline: string | null;
  status: "scheduled" | "cancelled";
  created_at: string;
  updated_at: string;
  event_responses?: ResponseRow[] | null;
};

type ResponseRow = {
  id: string;
  event_id: string;
  user_id: string;
  response: EventResponseValue;
  note: string | null;
  responded_at: string;
  updated_at: string;
};

const EventContext = createContext<EventContextValue | undefined>(undefined);

function mapEvent(row: EventRow): TeamEvent {
  return {
    id: row.id,
    teamId: row.team_id,
    createdBy: row.created_by,
    eventType: row.event_type,
    title: row.title,
    description: row.description,
    location: row.location,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    responseDeadline: row.response_deadline,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapResponse(row: ResponseRow): EventResponse {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    response: row.response,
    note: row.note,
    respondedAt: row.responded_at,
    updatedAt: row.updated_at,
  };
}

function getEventErrorMessage(message: string) {
  if (message.includes("COACH_OR_ADMIN_REQUIRED")) {
    return "Nur Admins und Trainer dürfen Termine verwalten.";
  }
  if (message.includes("EVENT_NOT_FOUND")) {
    return "Termin nicht gefunden.";
  }
  if (message.includes("INVALID_TIME")) {
    return "Die Zeitangaben sind ungültig.";
  }
  if (message.includes("INVALID_TITLE")) {
    return "Der Titel muss zwischen 2 und 100 Zeichen lang sein.";
  }
  if (message.includes("INVALID_EVENT_TYPE")) {
    return "Diese Terminart ist ungültig.";
  }
  if (message.includes("INVALID_RESPONSE")) {
    return "Diese Rückmeldung ist ungültig.";
  }
  if (message.includes("RESPONSE_DEADLINE_PASSED")) {
    return "Die Rückmeldefrist ist abgelaufen.";
  }
  if (message.includes("RESPONSE_CLOSED")) {
    return "Die Rückmeldung ist geschlossen.";
  }
  if (message.includes("EVENT_CANCELLED")) {
    return "Dieser Termin ist abgesagt.";
  }
  if (message.includes("TEAM_REQUIRED")) {
    return "Du bist kein Mitglied dieses Teams.";
  }
  if (message.includes("AUTH_REQUIRED")) {
    return "Bitte melde dich erneut an.";
  }
  if (message.toLowerCase().includes("network")) {
    return "Netzwerkfehler. Bitte prüfe deine Verbindung.";
  }
  return "Die Aktion konnte nicht ausgeführt werden.";
}

function validateEventInput(input: TeamEventInput) {
  if (input.title.trim().length < 2) {
    throw new Error("Bitte gib einen Titel mit mindestens 2 Zeichen ein.");
  }

  if (!input.date.trim() || !input.startTime.trim()) {
    throw new Error("Bitte gib Datum und Startzeit ein.");
  }

  const startsAt = toIsoFromLocalInput(input.date, input.startTime);
  if (!startsAt) {
    throw new Error("Die Startzeit ist ungültig.");
  }

  const endsAt = input.endTime.trim()
    ? toIsoFromLocalInput(input.date, input.endTime)
    : null;
  if (input.endTime.trim() && !endsAt) {
    throw new Error("Die Endzeit ist ungültig.");
  }
  if (endsAt && new Date(endsAt) <= new Date(startsAt)) {
    throw new Error("Die Endzeit muss nach der Startzeit liegen.");
  }

  const responseDeadline = input.responseDeadlineDate.trim() || input.responseDeadlineTime.trim()
    ? toIsoFromLocalInput(input.responseDeadlineDate, input.responseDeadlineTime)
    : null;
  if ((input.responseDeadlineDate.trim() || input.responseDeadlineTime.trim()) && !responseDeadline) {
    throw new Error("Die Rückmeldefrist ist ungültig.");
  }

  return {
    startsAt,
    endsAt,
    responseDeadline,
  };
}

// Produktregel: Fehlt für ein aktuelles Teammitglied ein event_responses-Datensatz,
// gilt das Mitglied als "Zugesagt" (Standard-Zusage). Nur explizite maybe/declined-
// Antworten weichen davon ab. Antworten von Nutzer:innen, die kein aktuelles
// Teammitglied mehr sind, fließen weder in die Zählung noch in ownResponse ein.
function buildEventWithResponse(
  event: TeamEvent,
  responses: EventResponse[],
  currentUserId: string | null,
  teamMembers: TeamMembershipWithProfile[],
): TeamEventWithResponse {
  const responseByUserId = new Map<string, EventResponse>();
  responses.forEach((response) => {
    responseByUserId.set(response.userId, response);
  });

  let accepted = 0;
  let acceptedPlayers = 0;
  let acceptedCoaches = 0;
  let maybe = 0;
  let declined = 0;

  teamMembers.forEach((member) => {
    const explicitResponse = responseByUserId.get(member.userId);
    const effectiveResponse: EventResponseValue = explicitResponse?.response ?? "accepted";

    if (effectiveResponse === "accepted") {
      accepted += 1;
      if (hasRole(member, "player")) {
        acceptedPlayers += 1;
      }
      if (hasRole(member, "coach")) {
        acceptedCoaches += 1;
      }
    } else if (effectiveResponse === "maybe") {
      maybe += 1;
    } else if (effectiveResponse === "declined") {
      declined += 1;
    }
  });

  return {
    ...event,
    // ownResponse bleibt null, wenn kein expliziter Datensatz existiert. Die UI
    // interpretiert einen fehlenden ownResponse als effektive Zusage (siehe events.tsx).
    ownResponse: currentUserId ? responseByUserId.get(currentUserId) ?? null : null,
    responses,
    summary: {
      accepted,
      acceptedPlayers,
      acceptedCoaches,
      maybe,
      declined,
    },
  };
}

export function EventProvider({ children }: { children: ReactNode }) {
  const { isDemoMode, session } = useAuth();
  const { currentTeam, teamMembers } = useTeam();
  const [events, setEvents] = useState<TeamEventWithResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [respondingEventId, setRespondingEventId] = useState<string | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const refreshEvents = useCallback(async () => {
    if (isDemoMode) {
      const demoMappedEvents = demoEvents.map<TeamEventWithResponse>((event) => {
        const mappedEvent: TeamEvent = {
          id: event.id,
          teamId: "demo-team",
          createdBy: "demo",
          eventType: event.type === "team" ? "team_event" : event.type,
          title: event.title,
          description: null,
          location: event.location,
          startsAt: new Date(`${event.date}T${event.time}:00`).toISOString(),
          endsAt: null,
          responseDeadline: null,
          status: "scheduled",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return buildEventWithResponse(mappedEvent, [], null, []);
      });
      setEvents(demoMappedEvents);
      setIsLoading(false);
      return;
    }

    if (!supabase || !currentTeam || !session?.user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const { data, error } = await supabase
        .from("team_events")
        .select("id, team_id, created_by, event_type, title, description, location, starts_at, ends_at, response_deadline, status, created_at, updated_at, event_responses(id, event_id, user_id, response, note, responded_at, updated_at)")
        .eq("team_id", currentTeam.id)
        .order("starts_at", { ascending: true });

      if (error) {
        console.error("EVENTS_LOAD_ERROR", error);
        throw new Error("Termine konnten nicht geladen werden.");
      }

      const nextEvents = ((data ?? []) as unknown as EventRow[]).map((row) =>
        buildEventWithResponse(
          mapEvent(row),
          (row.event_responses ?? []).map(mapResponse),
          session.user.id,
          teamMembers,
        ),
      );
      setEvents(nextEvents);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Termine konnten nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  }, [currentTeam, isDemoMode, session?.user, teamMembers]);

  useEffect(() => {
    void refreshEvents();
  }, [refreshEvents]);

  const upcomingEvents = useMemo(
    () =>
      events.filter(
        (event) => event.status === "scheduled" && new Date(event.startsAt).getTime() >= Date.now(),
      ),
    [events],
  );
  const pastEvents = useMemo(
    () =>
      events.filter(
        (event) => event.status === "scheduled" && new Date(event.startsAt).getTime() < Date.now(),
      ),
    [events],
  );
  const cancelledEvents = useMemo(
    () => events.filter((event) => event.status === "cancelled"),
    [events],
  );

  const value = useMemo<EventContextValue>(
    () => ({
      events,
      upcomingEvents,
      pastEvents,
      cancelledEvents,
      nextEvent: upcomingEvents[0] ?? null,
      isLoading,
      respondingEventId,
      savingEvent,
      errorMessage,
      successMessage,
      refreshEvents,
      clearMessages: () => {
        setErrorMessage("");
        setSuccessMessage("");
      },
      createEvent: async ({ input, teamId }) => {
        if (!supabase || isDemoMode) {
          throw new Error("Supabase ist nicht konfiguriert.");
        }

        const { startsAt, endsAt, responseDeadline } = validateEventInput(input);
        setSavingEvent(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
          const { data, error } = await supabase.rpc("create_team_event", {
            input_description: input.description,
            input_ends_at: endsAt,
            input_event_type: input.eventType,
            input_location: input.location,
            input_response_deadline: responseDeadline,
            input_starts_at: startsAt,
            input_team_id: teamId,
            input_title: input.title,
          });
          if (error) {
            console.error("CREATE_EVENT_ERROR", error);
            throw new Error(getEventErrorMessage(error.message));
          }
          await refreshEvents();
          setSuccessMessage("Termin wurde erstellt.");
          return mapEvent(data as EventRow);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Termin konnte nicht erstellt werden.";
          setErrorMessage(message);
          throw new Error(message);
        } finally {
          setSavingEvent(false);
        }
      },
      updateEvent: async ({ eventId, input, teamId }) => {
        if (!supabase || isDemoMode || !eventId) {
          throw new Error("Termin konnte nicht aktualisiert werden.");
        }

        const { startsAt, endsAt, responseDeadline } = validateEventInput(input);
        setSavingEvent(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
          const { data, error } = await supabase.rpc("update_team_event", {
            input_description: input.description,
            input_ends_at: endsAt,
            input_event_id: eventId,
            input_event_type: input.eventType,
            input_location: input.location,
            input_response_deadline: responseDeadline,
            input_starts_at: startsAt,
            input_title: input.title,
          });
          if (error) {
            console.error("UPDATE_EVENT_ERROR", error);
            throw new Error(getEventErrorMessage(error.message));
          }
          await refreshEvents();
          setSuccessMessage("Änderungen gespeichert.");
          return mapEvent(data as EventRow);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Termin konnte nicht aktualisiert werden.";
          setErrorMessage(message);
          throw new Error(message);
        } finally {
          setSavingEvent(false);
          void teamId;
        }
      },
      cancelEvent: async (eventId) => {
        if (!supabase || isDemoMode) {
          throw new Error("Termin konnte nicht abgesagt werden.");
        }
        setSavingEvent(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
          const { data, error } = await supabase.rpc("cancel_team_event", {
            input_event_id: eventId,
          });
          if (error) {
            console.error("CANCEL_EVENT_ERROR", error);
            throw new Error(getEventErrorMessage(error.message));
          }
          await refreshEvents();
          setSuccessMessage("Termin wurde abgesagt.");
          return mapEvent(data as EventRow);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Termin konnte nicht abgesagt werden.";
          setErrorMessage(message);
          throw new Error(message);
        } finally {
          setSavingEvent(false);
        }
      },
      respondToEvent: async (eventId, response, note = "") => {
        if (!supabase || isDemoMode) {
          throw new Error("Antwort konnte nicht gespeichert werden.");
        }
        setRespondingEventId(eventId);
        setErrorMessage("");
        setSuccessMessage("");
        try {
          const { data, error } = await supabase.rpc("respond_to_team_event", {
            input_event_id: eventId,
            input_note: note,
            input_response: response,
          });
          if (error) {
            console.error("RESPOND_EVENT_ERROR", error);
            throw new Error(getEventErrorMessage(error.message));
          }
          await refreshEvents();
          setSuccessMessage("Rückmeldung gespeichert.");
          return mapResponse(data as ResponseRow);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Antwort konnte nicht gespeichert werden.";
          setErrorMessage(message);
          throw new Error(message);
        } finally {
          setRespondingEventId(null);
        }
      },
      clearEventResponse: async (eventId) => {
        if (!supabase || isDemoMode) {
          throw new Error("Antwort konnte nicht gelöscht werden.");
        }
        setRespondingEventId(eventId);
        setErrorMessage("");
        setSuccessMessage("");
        try {
          const { error } = await supabase.rpc("clear_team_event_response", {
            input_event_id: eventId,
          });
          if (error) {
            console.error("CLEAR_EVENT_RESPONSE_ERROR", error);
            throw new Error(getEventErrorMessage(error.message));
          }
          await refreshEvents();
          setSuccessMessage("Rückmeldung zurückgesetzt.");
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Antwort konnte nicht gelöscht werden.";
          setErrorMessage(message);
          throw new Error(message);
        } finally {
          setRespondingEventId(null);
        }
      },
      getEventResponsesWithProfiles: (event) =>
        // Antworten ehemaliger Mitglieder (keine aktuelle Mitgliedschaft mehr) werden
        // weder gezählt noch angezeigt.
        event.responses
          .map((response): EventResponseWithProfile | null => {
            const membership = teamMembers.find((member) => member.userId === response.userId);
            if (!membership) {
              return null;
            }
            return {
              ...response,
              profile: membership.profile,
              roles: membership.roles,
            };
          })
          .filter((entry): entry is EventResponseWithProfile => entry !== null),
    }),
    [
      cancelledEvents,
      errorMessage,
      events,
      isDemoMode,
      isLoading,
      pastEvents,
      refreshEvents,
      respondingEventId,
      savingEvent,
      successMessage,
      teamMembers,
      upcomingEvents,
    ],
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents muss innerhalb des EventProvider verwendet werden.");
  }
  return context;
}
