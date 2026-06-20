import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
} from "@/types/team";
import {
  formatEventDateTime,
  formatEventTime,
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

const EVENT_TYPE_OPTIONS: TeamEventType[] = ["training", "match", "team_event"];
const RESPONSE_OPTIONS: EventResponseValue[] = ["accepted", "maybe", "declined"];

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
  const { currentMembership, currentTeam } = useTeam();
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
        event={participantsTarget}
        onClose={() => setParticipantsTarget(null)}
        responses={participantsTarget ? getEventResponsesWithProfiles(participantsTarget) : []}
      />
    </ScreenContainer>
  );
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
      <View style={styles.summaryRow}>
        <StatusBadge status={`Zusagen: ${event.summary.accepted}`} />
        <StatusBadge status={`Vielleicht: ${event.summary.maybe}`} />
        <StatusBadge status={`Absagen: ${event.summary.declined}`} />
        <StatusBadge status={`Offen: ${event.summary.open}`} />
      </View>
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
        <PrimaryButton label="Teilnehmerübersicht" onPress={onOpenParticipants} variant="secondary" />
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
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {mode === "create" ? "Termin hinzufügen" : "Termin bearbeiten"}
          </Text>
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
            <FormInput label="Datum" value={input.date} onChangeText={(value) => updateField("date", value)} />
            <FormInput label="Startzeit" value={input.startTime} onChangeText={(value) => updateField("startTime", value)} />
          </View>
          <View style={styles.twoColumns}>
            <FormInput label="Endzeit optional" value={input.endTime} onChangeText={(value) => updateField("endTime", value)} />
            <FormInput
              label="Fristzeit optional"
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
      </View>
    </Modal>
  );
}

function FormInput({
  label,
  multiline,
  onChangeText,
  value,
}: {
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
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
  event,
  onClose,
  responses,
}: {
  event: TeamEventWithResponse | null;
  onClose: () => void;
  responses: EventResponseWithProfile[];
}) {
  const { colors } = useTheme();
  const grouped = useMemo(
    () => ({
      accepted: responses.filter((response) => response.response === "accepted"),
      maybe: responses.filter((response) => response.response === "maybe"),
      declined: responses.filter((response) => response.response === "declined"),
    }),
    [responses],
  );

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={Boolean(event)}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Teilnehmerübersicht</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>{event?.title}</Text>
          <ParticipantGroup title="Zugesagt" responses={grouped.accepted} />
          <ParticipantGroup title="Vielleicht" responses={grouped.maybe} />
          <ParticipantGroup title="Abgesagt" responses={grouped.declined} />
          <Text style={[styles.body, { color: colors.mutedText }]}>
            Keine Antwort: {event?.summary.open ?? 0}
          </Text>
          <PrimaryButton label="Schließen" onPress={onClose} variant="secondary" />
        </View>
      </View>
    </Modal>
  );
}

function ParticipantGroup({
  responses,
  title,
}: {
  responses: EventResponseWithProfile[];
  title: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.participantGroup}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{title}</Text>
      {responses.length === 0 ? (
        <Text style={[styles.meta, { color: colors.mutedText }]}>Keine Einträge</Text>
      ) : (
        responses.map((response) => (
          <Text key={response.id} style={[styles.meta, { color: colors.mutedText }]}>
            {response.profile.displayName} · {getTeamRoleLabel(response.role)}
            {response.note ? ` · ${response.note}` : ""}
          </Text>
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
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
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
  participantGroup: {
    gap: spacing.xs,
  },
});
