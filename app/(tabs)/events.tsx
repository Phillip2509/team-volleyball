import { useEffect, useMemo, useState } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { DatePickerField } from "@/components/events/date-picker-field";
import { TimePickerField } from "@/components/events/time-picker-field";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { SectionHeader } from "@/components/section-header";
import { StatusBadge } from "@/components/status-badge";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useEvents } from "@/context/event-context";
import { useTeam } from "@/context/team-context";
import { useTheme } from "@/context/theme-context";
import { demoDataNotice } from "@/data/demo-data";
import type {
  EventResponseValue,
  EventResponseWithProfile,
  EventDeadlineMode,
  TeamEventInput,
  TeamEventType,
  TeamEventWithResponse,
  TeamMembershipWithProfile,
  TeamRole,
} from "@/types/team";
import {
  formatEventDateTime,
  formatEventTime,
  formatResponseTimestamp,
  getTodayInputDate,
  splitIsoToLocalInputs,
  toIsoFromLocalInput,
} from "@/utils/event-dates";
import {
  getEventResponseLabel,
  getTeamEventStatusLabel,
  getTeamEventTypeLabel,
  getTeamRoleLabel,
} from "@/utils/format";
import { hasRole } from "@/utils/roles";

type EventFormMode = "create" | "edit";
type ParticipantResponseGroup = EventResponseValue;

type ParticipantOverviewEntry = {
  displayName: string;
  key: string;
  note: string | null;
  respondedAt: string | null;
  response: EventResponseValue;
  roles: TeamRole[];
  updatedAt: string | null;
  userId: string;
};

const EVENT_TYPE_OPTIONS: TeamEventType[] = ["training", "match", "team_event"];
const RESPONSE_OPTIONS: EventResponseValue[] = ["accepted", "maybe", "declined"];
const PARTICIPANT_GROUPS: { key: ParticipantResponseGroup; title: string }[] = [
  { key: "accepted", title: "Zugesagt" },
  { key: "maybe", title: "Vielleicht" },
  { key: "declined", title: "Abgesagt" },
];
const ROLE_DISPLAY_ORDER: TeamRole[] = ["admin", "coach", "player"];

function getCurrentTimeMs() {
  return Date.now();
}

function getRolesLabel(roles: TeamRole[]): string {
  return [...roles]
    .sort((left, right) => ROLE_DISPLAY_ORDER.indexOf(left) - ROLE_DISPLAY_ORDER.indexOf(right))
    .map(getTeamRoleLabel)
    .join(" · ");
}

function createEmptyInput(): TeamEventInput {
  return {
    eventType: "training",
    title: "",
    description: "",
    location: "",
    date: getTodayInputDate(),
    startTime: "19:00",
    endTime: "",
    responseDeadlineDate: "",
    responseDeadlineTime: "",
  };
}

function createInputFromEvent(event: TeamEventWithResponse): TeamEventInput {
  const start = splitIsoToLocalInputs(event.startsAt);
  const end = splitIsoToLocalInputs(event.endsAt);
  const deadline = splitIsoToLocalInputs(event.responseDeadline);

  return {
    eventType: event.eventType,
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    date: start.date,
    startTime: start.time,
    endTime: end.time,
    responseDeadlineDate: deadline.date,
    responseDeadlineTime: deadline.time,
  };
}

function getDefaultDeadlineTime(startTime: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(startTime.trim());
  if (!match) {
    return "18:00";
  }

  const totalMinutes = Math.max(Number(match[1]) * 60 + Number(match[2]) - 60, 0);
  const hoursLabel = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutesLabel = String(totalMinutes % 60).padStart(2, "0");
  return `${hoursLabel}:${minutesLabel}`;
}

export default function EventsScreen() {
  const { isDemoMode } = useAuth();
  const { colors } = useTheme();
  const { currentMembership, currentTeam, teamMembers } = useTeam();
  const {
    cancelEvent,
    cancelledEvents,
    createEvents,
    errorMessage,
    getEventResponsesWithProfiles,
    isLoading,
    pastEvents,
    respondToEvent,
    respondingEventId,
    savingEvent,
    successMessage,
    upcomingEvents,
    updateEvent,
  } = useEvents();
  const [formMode, setFormMode] = useState<EventFormMode>("create");
  const [eventInput, setEventInput] = useState<TeamEventInput>(createEmptyInput);
  const [isMultipleCreate, setIsMultipleCreate] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([getTodayInputDate()]);
  const [deadlineMode, setDeadlineMode] = useState<EventDeadlineMode>("none");
  const [duplicateConflict, setDuplicateConflict] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TeamEventWithResponse | null>(null);
  const [formError, setFormError] = useState("");
  const [showEventForm, setShowEventForm] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<TeamEventWithResponse | null>(null);
  const [participantsTarget, setParticipantsTarget] = useState<TeamEventWithResponse | null>(null);
  const [renderTimeMs, setRenderTimeMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRenderTimeMs(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const canManageEvents = currentMembership
    ? hasRole(currentMembership, "admin") || hasRole(currentMembership, "coach")
    : false;

  function openCreateModal() {
    const initialInput = createEmptyInput();
    setFormMode("create");
    setEditingEvent(null);
    setEventInput(initialInput);
    setIsMultipleCreate(false);
    setSelectedDates([initialInput.date]);
    setDeadlineMode(
      currentTeam?.defaultResponseDeadlineEnabled && currentTeam.defaultResponseDeadlineTime
        ? "team_default"
        : "none",
    );
    setDuplicateConflict(false);
    setFormError("");
    setShowEventForm(true);
  }

  function openEditModal(event: TeamEventWithResponse) {
    setFormMode("edit");
    setEditingEvent(event);
    setEventInput(createInputFromEvent(event));
    setIsMultipleCreate(false);
    setSelectedDates([splitIsoToLocalInputs(event.startsAt).date]);
    setDeadlineMode(event.responseDeadline ? "custom" : "none");
    setDuplicateConflict(false);
    setFormError("");
    setShowEventForm(true);
  }

  async function saveEvent() {
    if (!currentTeam) {
      setFormError("Team fehlt.");
      return;
    }

    setFormError("");
    try {
      if (formMode === "create") {
        const startsAt = toIsoFromLocalInput(eventInput.date, eventInput.startTime);
        if (startsAt && new Date(startsAt).getTime() <= Date.now()) {
          throw new Error("Beim Erstellen muss der Terminstart in der Zukunft liegen.");
        }
        await createEvents({
          allowDuplicates: duplicateConflict,
          deadlineMode,
          input: eventInput,
          selectedDates: isMultipleCreate ? selectedDates : [eventInput.date],
          teamDefaultDeadlineTime: currentTeam.defaultResponseDeadlineTime,
          teamId: currentTeam.id,
        });
      } else if (editingEvent) {
        const hasResponseDeadlineInput =
          eventInput.responseDeadlineDate.trim() || eventInput.responseDeadlineTime.trim();
        const nextResponseDeadline = hasResponseDeadlineInput
          ? toIsoFromLocalInput(eventInput.responseDeadlineDate, eventInput.responseDeadlineTime)
          : null;
        if (nextResponseDeadline) {
          const nextDeadlineMs = new Date(nextResponseDeadline).getTime();
          const previousDeadlineMs = editingEvent.responseDeadline
            ? new Date(editingEvent.responseDeadline).getTime()
            : null;
          const isUnchangedDeadline = previousDeadlineMs !== null && previousDeadlineMs === nextDeadlineMs;
          if (!isUnchangedDeadline && nextDeadlineMs <= Date.now()) {
            throw new Error("Die Rückmeldefrist muss in der Zukunft liegen.");
          }
        }
        await updateEvent({
          eventId: editingEvent.id,
          input: eventInput,
          teamId: currentTeam.id,
        });
      }
      setShowEventForm(false);
      setDuplicateConflict(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : formMode === "create"
            ? "Termin konnte nicht erstellt werden."
            : "Termin konnte nicht aktualisiert werden.";
      if (message.includes("bereits einen geplanten Termin")) {
        setDuplicateConflict(true);
      }
      setFormError(message);
    }
  }

  async function confirmCancelEvent() {
    if (!cancelTarget) {
      return;
    }

    try {
      await cancelEvent(cancelTarget.id);
      setCancelTarget(null);
    } catch {
      setCancelTarget(null);
    }
  }

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
        eyebrow={isDemoMode ? demoDataNotice : "Echte Termine"}
        title="Termine"
        subtitle={
          isDemoMode
            ? "Lokale Demo-Ansicht."
            : "Teamtermine, Rückmeldungen und Teilnehmerübersicht."
        }
      />

      {canManageEvents ? (
        <PrimaryButton label="Termin hinzufügen" onPress={openCreateModal} />
      ) : null}

      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {errorMessage ? <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={[styles.success, { color: colors.success }]}>{successMessage}</Text> : null}

      <SectionHeader title="Kommende Termine" />
      {upcomingEvents.length === 0 ? (
        <EmptyState
          title="Noch kein Termin geplant"
          text={
            canManageEvents
              ? "Erstelle den ersten Termin für dein Team."
              : "Sobald ein Termin geplant ist, erscheint er hier."
          }
        />
      ) : (
        upcomingEvents.map((event) => (
          <TeamEventCard
            canManageEvents={canManageEvents}
            event={event}
            isResponding={respondingEventId === event.id}
            key={event.id}
            nowMs={renderTimeMs}
            onCancel={() => setCancelTarget(event)}
            onEdit={() => openEditModal(event)}
            onOpenParticipants={() => setParticipantsTarget(event)}
            onRespond={(response) => void handleRespond(event, response)}
          />
        ))
      )}

      <SectionHeader title="Vergangene Termine" />
      {pastEvents.length === 0 ? (
        <EmptyState title="Keine vergangenen Termine" text="Hier erscheinen abgeschlossene Termine." />
      ) : (
        pastEvents.map((event) => (
          <TeamEventCard
            canManageEvents={canManageEvents}
            event={event}
            isResponding={respondingEventId === event.id}
            key={event.id}
            nowMs={renderTimeMs}
            onCancel={() => setCancelTarget(event)}
            onEdit={() => openEditModal(event)}
            onOpenParticipants={() => setParticipantsTarget(event)}
            onRespond={(response) => void handleRespond(event, response)}
          />
        ))
      )}

      {cancelledEvents.length > 0 ? (
        <>
          <SectionHeader title="Abgesagte Termine" />
          {cancelledEvents.map((event) => (
            <TeamEventCard
              canManageEvents={false}
              event={event}
              isResponding={false}
              key={event.id}
              nowMs={renderTimeMs}
              onCancel={() => undefined}
              onEdit={() => undefined}
              onOpenParticipants={() => setParticipantsTarget(event)}
              onRespond={() => undefined}
            />
          ))}
        </>
      ) : null}

      <EventFormModal
        errorMessage={formError}
        input={eventInput}
        isMultipleCreate={isMultipleCreate}
        mode={formMode}
        onCancel={() => setShowEventForm(false)}
        onChange={setEventInput}
        onDeadlineModeChange={setDeadlineMode}
        onDuplicateConflictChange={setDuplicateConflict}
        onMultipleCreateChange={(value) => {
          setDuplicateConflict(false);
          if (value) {
            setIsMultipleCreate(true);
            setSelectedDates([eventInput.date]);
            if (deadlineMode === "custom") {
              setDeadlineMode(
                currentTeam?.defaultResponseDeadlineEnabled && currentTeam.defaultResponseDeadlineTime
                  ? "team_default"
                  : "none",
              );
            }
            return;
          }

          const nextDate = [...selectedDates].sort()[0] ?? eventInput.date;
          setIsMultipleCreate(false);
          setSelectedDates([nextDate]);
          setEventInput((currentInput) => ({ ...currentInput, date: nextDate }));
          if (deadlineMode === "custom") {
            setDeadlineMode("none");
          }
        }}
        onSave={() => void saveEvent()}
        onSelectedDatesChange={(values) => {
          setSelectedDates(values);
          if (values[0]) {
            setEventInput((currentInput) => ({ ...currentInput, date: values[0] }));
          }
          setDuplicateConflict(false);
        }}
        saving={savingEvent}
        selectedDates={selectedDates}
        deadlineMode={deadlineMode}
        duplicateConflict={duplicateConflict}
        teamDefaultDeadlineEnabled={Boolean(
          currentTeam?.defaultResponseDeadlineEnabled && currentTeam.defaultResponseDeadlineTime,
        )}
        teamDefaultDeadlineTime={currentTeam?.defaultResponseDeadlineTime ?? null}
        visible={showEventForm}
      />

      <ConfirmCancelModal
        event={cancelTarget}
        onCancel={() => setCancelTarget(null)}
        onConfirm={() => void confirmCancelEvent()}
        saving={savingEvent}
      />

      <ParticipantsModal
        canShowResponseTimestamps={canManageEvents}
        event={participantsTarget}
        onClose={() => setParticipantsTarget(null)}
        responses={participantsTarget ? getEventResponsesWithProfiles(participantsTarget) : []}
        teamMembers={teamMembers}
      />
    </ScreenContainer>
  );
}

// Basis ist ausschließlich die aktuelle Teammitgliedschaft: jede Person erscheint
// genau 1x mit ihrer effektiven Antwort (expliziter Datensatz, sonst Standard-Zusage).
function buildParticipantGroups(
  responses: EventResponseWithProfile[],
  teamMembers: TeamMembershipWithProfile[],
): Record<ParticipantResponseGroup, ParticipantOverviewEntry[]> {
  const responseByUserId = new Map<string, EventResponseWithProfile>();
  responses.forEach((response) => {
    responseByUserId.set(response.userId, response);
  });

  const entries = teamMembers.map<ParticipantOverviewEntry>((member) => {
    const explicitResponse = responseByUserId.get(member.userId);
    const effectiveResponse: EventResponseValue = explicitResponse?.response ?? "accepted";
    return {
      displayName: member.profile.displayName,
      key: explicitResponse?.id ?? `default-${member.userId}`,
      note: explicitResponse?.note ?? null,
      respondedAt: explicitResponse?.respondedAt ?? null,
      response: effectiveResponse,
      roles: member.roles,
      updatedAt: explicitResponse?.updatedAt ?? null,
      userId: member.userId,
    };
  });

  const sortByName = (left: ParticipantOverviewEntry, right: ParticipantOverviewEntry) =>
    left.displayName.localeCompare(right.displayName, "de");

  return {
    accepted: entries.filter((entry) => entry.response === "accepted").sort(sortByName),
    maybe: entries.filter((entry) => entry.response === "maybe").sort(sortByName),
    declined: entries.filter((entry) => entry.response === "declined").sort(sortByName),
  };
}

function TeamEventCard({
  canManageEvents,
  event,
  isResponding,
  nowMs,
  onCancel,
  onEdit,
  onOpenParticipants,
  onRespond,
}: {
  canManageEvents: boolean;
  event: TeamEventWithResponse;
  isResponding: boolean;
  nowMs: number;
  onCancel: () => void;
  onEdit: () => void;
  onOpenParticipants: () => void;
  onRespond: (response: EventResponseValue) => void;
}) {
  const { colors } = useTheme();
  const deadlinePassed = event.responseDeadline
    ? nowMs > new Date(event.responseDeadline).getTime()
    : false;
  const startPassed = !event.responseDeadline && nowMs >= new Date(event.startsAt).getTime();
  const responseClosed = deadlinePassed || startPassed;
  const canRespond = event.status === "scheduled" && !responseClosed;
  // Fehlender ownResponse-Datensatz gilt als effektive Zusage (Standard-Zusage).
  const effectiveOwnResponse: EventResponseValue = event.ownResponse?.response ?? "accepted";

  return (
    <Card style={event.status === "cancelled" ? styles.cancelledCard : undefined}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleColumn}>
          <Text style={[styles.type, { color: colors.primary }]}>
            {getTeamEventTypeLabel(event.eventType)}
          </Text>
          <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
        </View>
        <StatusBadge status={getTeamEventStatusLabel(event.status)} />
      </View>
      <Text style={[styles.meta, { color: colors.mutedText }]}>
        {formatEventDateTime(event.startsAt)}
        {event.endsAt ? ` bis ${formatEventTime(event.endsAt)}` : ""}
      </Text>
      {event.location ? (
        <Text style={[styles.meta, { color: colors.mutedText }]}>{event.location}</Text>
      ) : null}
      {event.description ? (
        <Text style={[styles.body, { color: colors.mutedText }]}>{event.description}</Text>
      ) : null}
      <ParticipantSummaryButton event={event} onPress={onOpenParticipants} />
      <Text style={[styles.meta, { color: colors.mutedText }]}>
        Deine Rückmeldung: {getEventResponseLabel(effectiveOwnResponse)}
      </Text>
      {deadlinePassed && event.status === "scheduled" ? (
        <Text style={[styles.error, { color: colors.warning }]}>Die Rückmeldefrist ist abgelaufen.</Text>
      ) : null}
      {startPassed && event.status === "scheduled" ? (
        <Text style={[styles.error, { color: colors.warning }]}>Rückmeldung geschlossen</Text>
      ) : null}
      {isResponding ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.actions}>
        {RESPONSE_OPTIONS.map((response) => {
          const isActive = effectiveOwnResponse === response;
          return (
            <Pressable
              disabled={!canRespond || isResponding}
              key={response}
              onPress={() => onRespond(response)}
              style={[
                styles.actionButton,
                {
                  backgroundColor: isActive ? colors.primary : colors.inputBackground,
                  borderColor: colors.border,
                },
                (!canRespond || isResponding) && styles.disabled,
              ]}
            >
              <Text style={[styles.actionText, { color: isActive ? colors.onPrimary : colors.text }]}>
                {getEventResponseLabel(response)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.actions}>
        {canManageEvents && event.status === "scheduled" ? (
          <>
            <PrimaryButton label="Bearbeiten" onPress={onEdit} variant="secondary" />
            <PrimaryButton label="Termin absagen" onPress={onCancel} variant="secondary" />
          </>
        ) : null}
      </View>
    </Card>
  );
}

function ParticipantSummaryButton({
  event,
  onPress,
}: {
  event: TeamEventWithResponse;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const items = [
    { color: colors.success, count: event.summary.accepted, label: "Gesamt", symbol: "+" },
    { color: colors.primary, count: event.summary.acceptedPlayers, label: "Spieler", symbol: "S" },
    { color: colors.primary, count: event.summary.acceptedCoaches, label: "Trainer", symbol: "T" },
  ];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.summaryButton,
        { backgroundColor: colors.inputBackground, borderColor: colors.border },
      ]}
    >
      <View style={styles.summaryHeader}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>Rückmeldungen</Text>
        <Text style={[styles.summaryHint, { color: colors.primary }]}>Teilnehmerübersicht öffnen</Text>
      </View>
      <View style={styles.summaryGrid}>
        {items.map((item) => (
          <View key={item.label} style={styles.summaryItem}>
            <Text style={[styles.summaryIcon, { color: item.color }]}>{item.symbol}</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{item.count}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

function EventFormModal({
  deadlineMode,
  duplicateConflict,
  errorMessage,
  input,
  isMultipleCreate,
  mode,
  onCancel,
  onChange,
  onDeadlineModeChange,
  onDuplicateConflictChange,
  onMultipleCreateChange,
  onSave,
  onSelectedDatesChange,
  saving,
  selectedDates,
  teamDefaultDeadlineEnabled,
  teamDefaultDeadlineTime,
  visible,
}: {
  deadlineMode: EventDeadlineMode;
  duplicateConflict: boolean;
  errorMessage: string;
  input: TeamEventInput;
  isMultipleCreate: boolean;
  mode: EventFormMode;
  onCancel: () => void;
  onChange: (input: TeamEventInput) => void;
  onDeadlineModeChange: (mode: EventDeadlineMode) => void;
  onDuplicateConflictChange: (value: boolean) => void;
  onMultipleCreateChange: (value: boolean) => void;
  onSave: () => void;
  onSelectedDatesChange: (values: string[]) => void;
  saving: boolean;
  selectedDates: string[];
  teamDefaultDeadlineEnabled: boolean;
  teamDefaultDeadlineTime: string | null;
  visible: boolean;
}) {
  const { colors } = useTheme();

  function updateField<K extends keyof TeamEventInput>(key: K, value: TeamEventInput[K]) {
    if (mode === "create") {
      onDuplicateConflictChange(false);
    }
    onChange({ ...input, [key]: value });
  }

  function activateCustomDeadline() {
    onDeadlineModeChange("custom");
    onChange({
      ...input,
      responseDeadlineDate: input.responseDeadlineDate || input.date || getTodayInputDate(),
      responseDeadlineTime: input.responseDeadlineTime || getDefaultDeadlineTime(input.startTime),
    });
  }

  function clearDeadline() {
    onDeadlineModeChange("none");
    onChange({
      ...input,
      responseDeadlineDate: "",
      responseDeadlineTime: "",
    });
  }

  const hasDeadline = deadlineMode === "custom" && Boolean(input.responseDeadlineDate || input.responseDeadlineTime);
  const sortedSelectedDates = [...selectedDates].sort();

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalBackdrop}
      >
        <SafeAreaView style={styles.modalSafeArea}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {mode === "create" ? "Termin hinzufügen" : "Termin bearbeiten"}
          </Text>
          <ScrollView
            contentContainerStyle={styles.modalFormScrollContent}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            style={styles.modalFormScroll}
          >
            <View style={styles.segment}>
              {EVENT_TYPE_OPTIONS.map((type) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: input.eventType === type }}
                  key={type}
                  onPress={() => updateField("eventType", type)}
                  style={[
                    styles.segmentButton,
                    {
                      backgroundColor: input.eventType === type ? colors.primary : colors.inputBackground,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.actionText, { color: input.eventType === type ? colors.onPrimary : colors.text }]}>
                    {getTeamEventTypeLabel(type)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <FormInput label="Titel" value={input.title} onChangeText={(value) => updateField("title", value)} />
            <FormInput
              label="Beschreibung optional"
              multiline
              value={input.description}
              onChangeText={(value) => updateField("description", value)}
            />
            <FormInput label="Ort optional" value={input.location} onChangeText={(value) => updateField("location", value)} />
            {mode === "create" ? (
              <View style={[styles.deadlineBox, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
                <View style={styles.deadlineHeader}>
                  <View style={styles.deadlineTextColumn}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Mehrere Termine erstellen</Text>
                    <Text style={[styles.deadlineHint, { color: colors.mutedText }]}>
                      Wähle bis zu 20 unabhängige Tage. Es wird keine Serie gespeichert.
                    </Text>
                  </View>
                  <PrimaryButton
                    label={isMultipleCreate ? "Einzeltermin" : "Mehrere Termine"}
                    onPress={() => onMultipleCreateChange(!isMultipleCreate)}
                    variant="secondary"
                  />
                </View>
                {isMultipleCreate ? (
                  <Text style={[styles.deadlineHint, { color: colors.mutedText }]}>
                    {sortedSelectedDates.length} Termine ausgewählt: {sortedSelectedDates.join(", ")}
                  </Text>
                ) : null}
              </View>
            ) : null}
            <View style={styles.twoColumns}>
              <DatePickerField
                helperText={
                  mode === "create"
                    ? isMultipleCreate
                      ? "Erneutes Tippen entfernt einen Tag. Maximal 20 Termine."
                      : "Vergangene Tage sind beim Erstellen deaktiviert."
                    : undefined
                }
                label="Datum"
                maxSelections={20}
                minDate={mode === "create" ? getTodayInputDate() : undefined}
                onChange={(value) => updateField("date", value)}
                onMultiChange={onSelectedDatesChange}
                selectionMode={mode === "create" && isMultipleCreate ? "multiple" : "single"}
                style={styles.twoColumnItem}
                value={input.date}
                values={selectedDates}
              />
              <TimePickerField
                fallbackTime="19:00"
                label="Startzeit"
                onChange={(value) => updateField("startTime", value)}
                style={styles.twoColumnItem}
                value={input.startTime}
              />
            </View>
            <View style={styles.twoColumns}>
              <TimePickerField
                allowClear
                emptyLabel="Keine Endzeit"
                fallbackTime={input.startTime || "20:30"}
                helperText="Die Endzeit ist optional und kann entfernt werden."
                label="Endzeit"
                onChange={(value) => updateField("endTime", value)}
                style={styles.twoColumnItem}
                value={input.endTime}
              />
            </View>
            <View style={[styles.deadlineBox, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
              <View style={styles.deadlineHeader}>
                <View style={styles.deadlineTextColumn}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Rückmeldefrist</Text>
                  <Text style={[styles.deadlineHint, { color: colors.mutedText }]}>
                    Danach sind keine Rückmeldungen mehr möglich.
                  </Text>
                </View>
              </View>
              {mode === "create" ? (
                <View style={styles.segment}>
                  <DeadlineModeButton
                    active={deadlineMode === "team_default"}
                    disabled={!teamDefaultDeadlineEnabled}
                    label="Teamstandard"
                    onPress={() => {
                      if (teamDefaultDeadlineEnabled) {
                        onDeadlineModeChange("team_default");
                      }
                    }}
                  />
                  <DeadlineModeButton
                    active={deadlineMode === "custom"}
                    disabled={isMultipleCreate}
                    label="Individuell"
                    onPress={activateCustomDeadline}
                  />
                  <DeadlineModeButton
                    active={deadlineMode === "none"}
                    label="Keine Frist"
                    onPress={clearDeadline}
                  />
                </View>
              ) : (
                <PrimaryButton
                  label={hasDeadline ? "Frist entfernen" : "Frist aktivieren"}
                  onPress={hasDeadline ? clearDeadline : activateCustomDeadline}
                  variant="secondary"
                />
              )}
              {mode === "create" && deadlineMode === "team_default" ? (
                <Text style={[styles.deadlineHint, { color: colors.mutedText }]}>
                  Rückmeldungen sind am Veranstaltungstag bis {teamDefaultDeadlineTime ?? "--:--"} Uhr möglich.
                </Text>
              ) : null}
              {mode === "create" && !teamDefaultDeadlineEnabled ? (
                <Text style={[styles.deadlineHint, { color: colors.mutedText }]}>
                  Es ist kein Teamstandard aktiv. Du kannst keine Frist oder bei Einzelterminen eine individuelle Frist wählen.
                </Text>
              ) : null}
              {mode === "create" && isMultipleCreate && deadlineMode !== "team_default" ? (
                <Text style={[styles.deadlineHint, { color: colors.mutedText }]}>
                  Individuelle Fristen kannst du nach der Erstellung in den einzelnen Terminen festlegen.
                </Text>
              ) : null}
              {hasDeadline ? (
                <View style={styles.twoColumns}>
                  <DatePickerField
                    label="Fristdatum"
                    onChange={(value) => updateField("responseDeadlineDate", value)}
                    style={styles.twoColumnItem}
                    value={input.responseDeadlineDate}
                  />
                  <TimePickerField
                    fallbackTime={getDefaultDeadlineTime(input.startTime)}
                    label="Fristzeit"
                    onChange={(value) => updateField("responseDeadlineTime", value)}
                    style={styles.twoColumnItem}
                    value={input.responseDeadlineTime}
                  />
                </View>
              ) : null}
            </View>
            {duplicateConflict ? (
              <Text style={[styles.error, { color: colors.warning }]}>
                Es gibt bereits einen geplanten Termin zu mindestens einem ausgewählten Zeitpunkt. Wenn das richtig ist, speichere erneut.
              </Text>
            ) : null}
            {errorMessage ? (
              <Text
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                style={[styles.error, { color: colors.danger }]}
              >
                {errorMessage}
              </Text>
            ) : null}
          </ScrollView>
          {saving ? <ActivityIndicator color={colors.primary} /> : null}
          <View style={styles.modalActions}>
            <PrimaryButton label="Abbrechen" onPress={onCancel} variant="secondary" />
            <PrimaryButton
              disabled={saving || (mode === "create" && isMultipleCreate && sortedSelectedDates.length < 1)}
              label={
                saving
                  ? "Speichert ..."
                  : duplicateConflict
                    ? "Trotzdem erstellen"
                    : mode === "create"
                      ? isMultipleCreate
                        ? `${sortedSelectedDates.length} Termine erstellen`
                        : "Termin erstellen"
                      : "Änderungen speichern"
              }
              onPress={onSave}
            />
          </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FormInput({
  label,
  multiline,
  onChangeText,
  style,
  value,
}: {
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        placeholderTextColor={colors.mutedText}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={value}
      />
    </View>
  );
}

function DeadlineModeButton({
  active,
  disabled,
  label,
  onPress,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled), selected: active }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.segmentButton,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: colors.border,
        },
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.actionText, { color: active ? colors.onPrimary : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ConfirmCancelModal({
  event,
  onCancel,
  onConfirm,
  saving,
}: {
  event: TeamEventWithResponse | null;
  onCancel: () => void;
  onConfirm: () => void;
  saving: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={Boolean(event)}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Termin absagen</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>
            Möchtest du „{event?.title}“ wirklich absagen? Der Termin bleibt sichtbar.
          </Text>
          {saving ? <ActivityIndicator color={colors.primary} /> : null}
          <View style={styles.modalActions}>
            <PrimaryButton label="Zurück" onPress={onCancel} variant="secondary" />
            <PrimaryButton disabled={saving} label="Termin absagen" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ParticipantsModal({
  canShowResponseTimestamps,
  event,
  onClose,
  responses,
  teamMembers,
}: {
  canShowResponseTimestamps: boolean;
  event: TeamEventWithResponse | null;
  onClose: () => void;
  responses: EventResponseWithProfile[];
  teamMembers: TeamMembershipWithProfile[];
}) {
  const { colors } = useTheme();
  const grouped = useMemo(
    () => buildParticipantGroups(responses, teamMembers),
    [responses, teamMembers],
  );

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={Boolean(event)}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Teilnehmerübersicht</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>{event?.title}</Text>
          <ScrollView contentContainerStyle={styles.participantScrollContent} style={styles.participantScroll}>
            {PARTICIPANT_GROUPS.map((group) => (
              <ParticipantGroup
                entries={grouped[group.key]}
                groupKey={group.key}
                key={group.key}
                showTimestamps={canShowResponseTimestamps}
                title={group.title}
              />
            ))}
          </ScrollView>
          <PrimaryButton label="Schließen" onPress={onClose} variant="secondary" />
        </View>
      </View>
    </Modal>
  );
}

function ParticipantGroup({
  entries,
  groupKey,
  showTimestamps,
  title,
}: {
  entries: ParticipantOverviewEntry[];
  groupKey: ParticipantResponseGroup;
  showTimestamps: boolean;
  title: string;
}) {
  const { colors } = useTheme();
  const groupColors: Record<ParticipantResponseGroup, string> = {
    accepted: colors.success,
    maybe: colors.warning,
    declined: colors.danger,
  };

  return (
    <View style={[styles.participantGroup, { borderColor: colors.border }]}>
      <View style={styles.participantGroupHeader}>
        <View style={[styles.participantGroupMarker, { backgroundColor: groupColors[groupKey] }]} />
        <Text style={[styles.participantGroupTitle, { color: colors.text }]}>
          {title} ({entries.length})
        </Text>
      </View>
      {entries.length === 0 ? (
        <Text style={[styles.emptyGroupText, { color: colors.mutedText }]}>Keine Einträge in dieser Gruppe.</Text>
      ) : (
        entries.map((entry) => (
          <View key={entry.key} style={[styles.participantRow, { borderColor: colors.border }]}>
            <View style={styles.participantNameRow}>
              <Text style={[styles.participantName, { color: colors.text }]}>{entry.displayName}</Text>
              <Text style={[styles.rolePill, { backgroundColor: colors.inputBackground, color: colors.mutedText }]}>
                {getRolesLabel(entry.roles)}
              </Text>
            </View>
            {entry.note ? (
              <Text style={[styles.participantNote, { color: colors.mutedText }]}>{entry.note}</Text>
            ) : null}
            {showTimestamps && entry.respondedAt ? (
              <Text style={[styles.participantTime, { color: colors.mutedText }]}>
                Rückmeldung: {formatResponseTimestamp(entry.updatedAt ?? entry.respondedAt)}
              </Text>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  cardTitleColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  type: {
    fontSize: fontSizes.xs,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  eventTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "900",
  },
  meta: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  body: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
  },
  error: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  success: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  summaryButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  summaryHint: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
  },
  summaryIcon: {
    fontSize: fontSizes.md,
    fontWeight: "900",
  },
  summaryItem: {
    alignItems: "center",
    flexBasis: "22%",
    flexGrow: 1,
    gap: 2,
    minWidth: 96,
  },
  summaryLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    textAlign: "center",
  },
  summaryTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "900",
  },
  summaryValue: {
    fontSize: fontSizes.xl,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.56,
  },
  cancelledCard: {
    opacity: 0.76,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.56)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    maxHeight: "92%",
    maxWidth: 640,
    padding: spacing.xl,
    width: "100%",
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "900",
  },
  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-end",
  },
  modalFormScroll: {
    flexShrink: 1,
  },
  modalFormScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  segment: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  segmentButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  modalSafeArea: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  deadlineBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  deadlineHeader: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  deadlineHint: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
  },
  deadlineTextColumn: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 180,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fontSizes.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  twoColumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  twoColumnItem: {
    flex: 1,
    minWidth: 140,
  },
  emptyGroupText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  participantGroup: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  participantGroupHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  participantGroupMarker: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  participantGroupTitle: {
    fontSize: fontSizes.md,
    fontWeight: "900",
  },
  participantName: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  participantNameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  participantNote: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  participantRow: {
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  participantScroll: {
    maxHeight: 520,
  },
  participantScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  participantTime: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  rolePill: {
    borderRadius: 999,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
});
