import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { SectionHeader } from "@/components/section-header";
import { StatusBadge } from "@/components/status-badge";
import { fontSizes, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useEvents } from "@/context/event-context";
import { useTeam } from "@/context/team-context";
import { useTheme } from "@/context/theme-context";
import { demoAnnouncements, demoDataNotice, demoEvents, demoTeamMembers } from "@/data/demo-data";
import type { EventResponseValue, TeamEventWithResponse } from "@/types/team";
import { formatEventDateTime } from "@/utils/event-dates";
import { getEventResponseLabel, getTeamEventTypeLabel, getTeamRoleLabel } from "@/utils/format";

function getCurrentTimeMs() {
  return Date.now();
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { isDemoMode } = useAuth();
  const { currentMembership, currentTeam, teamMembers } = useTeam();
  const {
    errorMessage: eventErrorMessage,
    nextEvent: realNextEvent,
    respondToEvent,
    respondingEventId,
    successMessage: eventSuccessMessage,
  } = useEvents();
  const router = useRouter();
  const nextEvent = demoEvents[0];
  const activeMembers = demoTeamMembers.filter((member) => member.status === "aktiv").length;
  const latestAnnouncement = demoAnnouncements[0];
  const [renderTimeMs, setRenderTimeMs] = useState(() => Date.now());
  const canManageEvents =
    currentMembership?.role === "admin" || currentMembership?.role === "coach";
  const nextEventDeadlinePassed = realNextEvent?.responseDeadline
    ? renderTimeMs > new Date(realNextEvent.responseDeadline).getTime()
    : false;
  const nextEventStartPassed = realNextEvent && !realNextEvent.responseDeadline
    ? renderTimeMs >= new Date(realNextEvent.startsAt).getTime()
    : false;
  const nextEventResponseClosed = Boolean(nextEventDeadlinePassed || nextEventStartPassed);
  const canRespondToNextEvent =
    Boolean(realNextEvent) && realNextEvent?.status === "scheduled" && !nextEventResponseClosed;

  useEffect(() => {
    const interval = setInterval(() => {
      setRenderTimeMs(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleRespond(event: TeamEventWithResponse, response: EventResponseValue) {
    try {
      await respondToEvent(event.id, response);
    } catch {
      const currentTimeMs = getCurrentTimeMs();
      setRenderTimeMs((previousTimeMs) => Math.max(previousTimeMs, currentTimeMs));
    }
  }

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow={isDemoMode ? demoDataNotice : "Echte Teamdaten aktiv"}
        title={currentTeam ? currentTeam.name : "Bereit für den nächsten Satz?"}
        subtitle={
          currentTeam
            ? "Team, Mitglieder und Termine kommen aus Supabase. Nachrichten sind noch Demo-Bereiche."
            : "Eine moderne Basis für Termine, Zusagen, Teamübersicht und Mannschaftskommunikation."
        }
      />

      {isDemoMode ? (
        <EventCard event={nextEvent} />
      ) : realNextEvent ? (
        <Card>
          <Text style={[styles.type, { color: colors.primary }]}>Nächster Termin</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{realNextEvent.title}</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>
            {getTeamEventTypeLabel(realNextEvent.eventType)} · {formatEventDateTime(realNextEvent.startsAt)}
          </Text>
          {realNextEvent.location ? (
            <Text style={[styles.body, { color: colors.mutedText }]}>{realNextEvent.location}</Text>
          ) : null}
          <Text style={[styles.body, { color: colors.mutedText }]}>
            Deine Rückmeldung: {getEventResponseLabel(realNextEvent.ownResponse?.response ?? "accepted")}
          </Text>
          <View style={styles.actions}>
            <PrimaryButton
              disabled={!canRespondToNextEvent || respondingEventId === realNextEvent.id}
              label="Zusagen"
              onPress={() => void handleRespond(realNextEvent, "accepted")}
              variant="secondary"
            />
            <PrimaryButton
              disabled={!canRespondToNextEvent || respondingEventId === realNextEvent.id}
              label="Vielleicht"
              onPress={() => void handleRespond(realNextEvent, "maybe")}
              variant="secondary"
            />
            <PrimaryButton
              disabled={!canRespondToNextEvent || respondingEventId === realNextEvent.id}
              label="Absagen"
              onPress={() => void handleRespond(realNextEvent, "declined")}
              variant="secondary"
            />
          </View>
          {nextEventResponseClosed ? (
            <Text style={[styles.error, { color: colors.warning }]}>Rückmeldung geschlossen</Text>
          ) : null}
        </Card>
      ) : (
        <EmptyState
          title="Noch kein Termin geplant"
          text={
            canManageEvents
              ? "Du kannst auf der Termine-Seite den ersten Termin hinzufügen."
              : "Sobald ein Termin geplant ist, erscheint er hier."
          }
        />
      )}
      {eventErrorMessage ? (
        <Text style={[styles.error, { color: colors.danger }]}>{eventErrorMessage}</Text>
      ) : null}
      {eventSuccessMessage ? (
        <Text style={[styles.success, { color: colors.success }]}>{eventSuccessMessage}</Text>
      ) : null}

      <View style={styles.grid}>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {isDemoMode ? "8/12" : realNextEvent?.summary.accepted ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>Zugesagt</Text>
          <StatusBadge status="yes" />
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {currentTeam ? teamMembers.length : activeMembers}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>
            {currentTeam ? "Mitglieder" : "Aktive im Team"}
          </Text>
          <StatusBadge status={currentMembership ? getTeamRoleLabel(currentMembership.role) : "aktiv"} />
        </Card>
      </View>

      <SectionHeader title="Letzte Mitteilung" caption="Lokale Demo-Nachricht" />
      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{latestAnnouncement.title}</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>{latestAnnouncement.body}</Text>
      </Card>

      <SectionHeader title="Schnellaktionen" />
      <View style={styles.actions}>
        <PrimaryButton label="Rückmeldungen öffnen" onPress={() => router.push("/events")} variant="secondary" />
        <PrimaryButton label="Termine anzeigen" onPress={() => router.push("/events")} variant="secondary" />
        <PrimaryButton label="Team öffnen" onPress={() => router.push("/team")} variant="secondary" />
      </View>
      <Text style={[styles.note, { color: colors.mutedText }]}>
        Nachrichten bleiben vorerst Demo- oder Empty-State-Bereiche.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    gap: spacing.sm,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: fontSizes.sm,
  },
  type: {
    fontSize: fontSizes.xs,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  body: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  error: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  success: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
  },
  note: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
  },
});
