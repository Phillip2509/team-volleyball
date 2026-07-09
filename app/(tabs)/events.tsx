import { useMemo, useState } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
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
} from "@/utils/event-dates";
import {
  getEventResponseLabel,
  getTeamEventStatusLabel,
  getTeamEventTypeLabel,
  getTeamRoleLabel,
} from "@/utils/format";

type EventFormMode = "create" | "edit";
type ParticipantResponseGroup = EventResponseValue | "open";

type ParticipantOverviewEntry = {
  displayName: string;
  key: string;
  note: string | null;
  respondedAt: string | null;
  response: EventResponseValue | null;
  role: TeamRole;
  updatedAt: string | null;
  userId: string;
};

const EVENT_TYPE_OPTIONS: TeamEventType[] = ["training", "match", "team_event"];
const RESPONSE_OPTIONS: EventResponseValue[] = ["accepted", "maybe", "declined"];
const PARTICIPANT_GROUPS: { key: ParticipantResponseGroup; title: string }[] = [
  { key: "accepted", title: "Zugesagt" },
  { key: "maybe", title: "Vielleicht" },
  { key: "declined", title: "Abgesagt" },
  { key: "open", title: "Keine Antwort" },
];

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

export default function EventsScreen() {
  const { isDemoMode } = useAuth();
  const { colors } = useTheme();
  const { currentMembership, currentTeam, teamMembers } = useTeam();
  const {
    cancelEvent,
    cancelledEvents,
    clearEventResponse,
    createEvent,
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
  const [editingEvent, setEditingEvent] = useState<TeamEventWithResponse | null>(null);
  const [formError, setFormError] = useState("");
  const [showEventForm, setShowEventForm] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<TeamEventWithResponse | null>(null);
  const [participantsTarget, setParticipantsTarget] = useState<TeamEventWithResponse | null>(null);
  const [renderTimeMs] = useState(() => Date.now());

  const canManageEvents =
    currentMembership?.role === "admin" || currentMembership?.role === "coach";

  function openCreateModal() {
    setFormMode("create");
    setEditingEvent(null);
    setEventInput(createEmptyInput());
    setFormError("");
    setShowEventForm(true);
  }

  function openEditModal(event: TeamEventWithResponse) {
    setFormMode("edit");
    setEditingEvent(event);
    setEventInput(createInputFromEvent(event));
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
        await createEvent({ input: eventInput, teamId: currentTeam.id });
      } else if (editingEvent) {
        await updateEvent({
          eventId: editingEvent.id,
          input: eventInput,
          teamId: currentTeam.id,
        });
      }
      setShowEventForm(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : formMode === "create"
            ? "Termin konnte nicht erstellt werden."
            : "Termin konnte nicht aktualisiert werden.",
      );
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
            onClearResponse={() => void clearEventResponse(event.id)}
            onEdit={() => openEditModal(event)}
            onOpenParticipants={() => setParticipantsTarget(event)}
            onRespond={(response) => void respondToEvent(event.id, response)}
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
            onClearResponse={() => void clearEventResponse(event.id)}
            onEdit={() => openEditModal(event)}
            onOpenParticipants={() => setParticipantsTarget(event)}
            onRespond={(response) => void respondToEvent(event.id, response)}
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
              onClearResponse={() => undefined}
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
        mode={formMode}
        onCancel={() => setShowEventForm(false)}
        onChange={setEventInput}
        onSave={() => void saveEvent()}
        saving={savingEvent}
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

function buildParticipantGroups(
  responses: EventResponseWithProfile[],
  teamMembers: TeamMembershipWithProfile[],
): Record<ParticipantResponseGroup, ParticipantOverviewEntry[]> {
  const responsesByUserId = new Map<string, EventResponseWithProfile>();

  responses.forEach((response) => {
    if (!responsesByUserId.has(response.userId)) {
      responsesByUserId.set(response.userId, response);
    }
  });

  const entriesFromResponses = Array.from(responsesByUserId.values()).map<ParticipantOverviewEntry>((response) => {
    const membership = teamMembers.find((member) => member.userId === response.userId);
    return {
      displayName: membership?.profile.displayName ?? response.profile.displayName,
      key: response.id,
      note: response.note,
      respondedAt: response.respondedAt,
      response: response.response,
      role: membership?.role ?? response.role,
      updatedAt: response.updatedAt,
      userId: response.userId,
    };
  });

  const sortByName = (left: ParticipantOverviewEntry, right: ParticipantOverviewEntry) =>
    left.displayName.localeCompare(right.displayName, "de");

  return {
    accepted: entriesFromResponses.filter((entry) => entry.response === "accepted").sort(sortByName),
    maybe: entriesFromResponses.filter((entry) => entry.response === "maybe").sort(sortByName),
    declined: entriesFromResponses.filter((entry) => entry.response === "declined").sort(sortByName),
    open: teamMembers
      .filter((member) => !responsesByUserId.has(member.userId))
      .map<ParticipantOverviewEntry>((member) => ({
        displayName: member.profile.displayName,
        key: `open-${member.userId}`,
        note: null,
        respondedAt: null,
        response: null,
        role: member.role,
        updatedAt: null,
        userId: member.userId,
      }))
      .sort(sortByName),
  };
}

function TeamEventCard({
  canManageEvents,
  event,
  isResponding,
  nowMs,
  onCancel,
  onClearResponse,
  onEdit,
  onOpenParticipants,
  onRespond,
}: {
  canManageEvents: boolean;
  event: TeamEventWithResponse;
  isResponding: boolean;
  nowMs: number;
  onCancel: () => void;
  onClearResponse: () => void;
  onEdit: () => void;
  onOpenParticipants: () => void;
  onRespond: (response: EventResponseValue) => void;
}) {
  const { colors } = useTheme();
  const deadlinePassed = event.responseDeadline
    ? nowMs > new Date(event.responseDeadline).getTime()
    : false;
  const canRespond = event.status === "scheduled" && !deadlinePassed;

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
        Deine Rückmeldung: {getEventResponseLabel(event.ownResponse?.response ?? null)}
      </Text>
      {deadlinePassed && event.status === "scheduled" ? (
        <Text style={[styles.error, { color: colors.warning }]}>Die Rückmeldefrist ist abgelaufen.</Text>
      ) : null}
      {isResponding ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.actions}>
        {RESPONSE_OPTIONS.map((response) => {
          const isActive = event.ownResponse?.response === response;
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
        <Pressable
          disabled={!canRespond || !event.ownResponse || isResponding}
          onPress={onClearResponse}
          style={[
            styles.actionButton,
            { backgroundColor: colors.inputBackground, borderColor: colors.border },
            (!canRespond || !event.ownResponse || isResponding) && styles.disabled,
          ]}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>Zurücksetzen</Text>
        </Pressable>
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
    { color: colors.success, count: event.summary.accepted, label: "Zugesagt", symbol: "+" },
    { color: colors.warning, count: event.summary.maybe, label: "Vielleicht", symbol: "?" },
    { color: colors.danger, count: event.summary.declined, label: "Abgesagt", symbol: "-" },
    { color: colors.mutedText, count: event.summary.open, label: "Keine Antwort", symbol: "..." },
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
  errorMessage,
  input,
  mode,
  onCancel,
  onChange,
  onSave,
  saving,
  visible,
}: {
  errorMessage: string;
  input: TeamEventInput;
  mode: EventFormMode;
  onCancel: () => void;
  onChange: (input: TeamEventInput) => void;
  onSave: () => void;
  saving: boolean;
  visible: boolean;
}) {
  const { colors } = useTheme();

  function updateField<K extends keyof TeamEventInput>(key: K, value: TeamEventInput[K]) {
    onChange({ ...input, [key]: value });
  }

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalBackdrop}
      >
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
            <View style={styles.twoColumns}>
              <FormInput
                label="Datum"
                style={styles.twoColumnItem}
                value={input.date}
                onChangeText={(value) => updateField("date", value)}
              />
              <FormInput
                label="Startzeit"
                style={styles.twoColumnItem}
                value={input.startTime}
                onChangeText={(value) => updateField("startTime", value)}
              />
            </View>
            <View style={styles.twoColumns}>
              <FormInput
                label="Endzeit optional"
                style={styles.twoColumnItem}
                value={input.endTime}
                onChangeText={(value) => updateField("endTime", value)}
              />
              <FormInput
                label="Fristzeit optional"
                style={styles.twoColumnItem}
                value={input.responseDeadlineTime}
                onChangeText={(value) => updateField("responseDeadlineTime", value)}
              />
            </View>
            <FormInput
              label="Rückmeldefrist Datum optional"
              value={input.responseDeadlineDate}
              onChangeText={(value) => updateField("responseDeadlineDate", value)}
            />
            {errorMessage ? <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text> : null}
          </ScrollView>
          {saving ? <ActivityIndicator color={colors.primary} /> : null}
          <View style={styles.modalActions}>
            <PrimaryButton label="Abbrechen" onPress={onCancel} variant="secondary" />
            <PrimaryButton
              disabled={saving}
              label={saving ? "Speichert ..." : mode === "create" ? "Termin erstellen" : "Änderungen speichern"}
              onPress={onSave}
            />
          </View>
        </View>
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
    open: colors.mutedText,
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
                {getTeamRoleLabel(entry.role)}
              </Text>
            </View>
            {entry.note ? (
              <Text style={[styles.participantNote, { color: colors.mutedText }]}>{entry.note}</Text>
            ) : null}
            {showTimestamps && entry.response ? (
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
