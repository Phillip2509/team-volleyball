import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/badge";
import { AttendanceControl } from "@/components/events/attendance-control";
import {
  foundationRadius,
  foundationSizes,
  foundationSpacing,
  foundationTypography,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import type { EventResponseValue, TeamEventWithResponse } from "@/types/team";
import {
  formatEventDateLabel,
  formatEventDeadline,
  formatEventTimeRange,
  getEventPresentationState,
} from "@/utils/event-dates";
import { getTeamEventTypeLabel } from "@/utils/format";

export function EventCard({
  event,
  nowMs,
  responsesEnabled,
  saving = false,
  errorMessage,
  successMessage,
  onRespond,
}: {
  event: TeamEventWithResponse;
  nowMs: number;
  responsesEnabled: boolean;
  saving?: boolean;
  errorMessage?: string;
  successMessage?: string;
  onRespond?: (response: EventResponseValue) => void;
}) {
  const { foundationColors } = useTheme();
  const presentationState = getEventPresentationState(event, nowMs);
  const isQuiet = presentationState === "past" || presentationState === "cancelled";
  const dateLabel = formatEventDateLabel(event.startsAt);
  const timeLabel = formatEventTimeRange(event.startsAt, event.endsAt);
  const deadlineLabel = event.responseDeadline
    ? formatEventDeadline(event.responseDeadline)
    : "";
  const canRespond = presentationState === "open" && responsesEnabled;
  const unavailableReason =
    presentationState === "cancelled"
      ? "Dieser Termin wurde abgesagt."
      : presentationState === "past"
        ? "Der Termin ist vorbei."
        : presentationState === "closed"
          ? "Rückmeldung geschlossen."
          : !responsesEnabled
            ? "Im Demo-Modus ist keine Rückmeldung möglich."
            : undefined;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isQuiet
            ? foundationColors.surfaceSubtle
            : foundationColors.surface,
          borderColor: foundationColors.border,
        },
      ]}
    >
      <View style={styles.badgeRow}>
        <Badge
          label={getTeamEventTypeLabel(event.eventType)}
          tone={isQuiet ? "neutral" : "accent"}
        />
        {presentationState === "cancelled" ? (
          <Badge icon="close-circle-outline" label="Abgesagt" tone="danger" />
        ) : presentationState === "past" ? (
          <Badge icon="time-outline" label="Vorbei" tone="neutral" />
        ) : presentationState === "closed" ? (
          <Badge icon="lock-closed-outline" label="Rückmeldung geschlossen" tone="warning" />
        ) : null}
      </View>

      <Text
        style={[
          styles.title,
          { color: isQuiet ? foundationColors.mutedText : foundationColors.text },
        ]}
      >
        {event.title}
      </Text>

      <View style={styles.metaGroup}>
        {dateLabel || timeLabel ? (
          <View style={styles.metaRow}>
            <Ionicons
              color={foundationColors.mutedText}
              name="calendar-outline"
              size={foundationSizes.inlineIcon}
            />
            <Text style={[styles.meta, styles.tabular, { color: foundationColors.mutedText }]}>
              {[dateLabel, timeLabel].filter(Boolean).join(" · ")}
            </Text>
          </View>
        ) : null}
        {event.location ? (
          <View style={styles.metaRow}>
            <Ionicons
              color={foundationColors.mutedText}
              name="location-outline"
              size={foundationSizes.inlineIcon}
            />
            <Text style={[styles.meta, { color: foundationColors.mutedText }]}>
              {event.location}
            </Text>
          </View>
        ) : null}
        {presentationState === "open" && deadlineLabel ? (
          <View style={styles.metaRow}>
            <Ionicons
              color={foundationColors.mutedText}
              name="hourglass-outline"
              size={foundationSizes.inlineIcon}
            />
            <Text style={[styles.meta, styles.tabular, { color: foundationColors.mutedText }]}>
              Rückmeldung bis {deadlineLabel} Uhr
            </Text>
          </View>
        ) : null}
      </View>

      <AttendanceControl
        canRespond={canRespond}
        errorMessage={errorMessage}
        eventTitle={event.title}
        onSelect={canRespond ? onRespond : undefined}
        saving={saving}
        successMessage={successMessage}
        unavailableReason={unavailableReason}
        value={event.ownResponse?.response ?? null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: foundationRadius.control,
    borderWidth: 1,
    gap: foundationSpacing.space2,
    padding: foundationSizes.cardPadding,
  },
  badgeRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: foundationSpacing.space2,
    justifyContent: "space-between",
  },
  title: {
    ...foundationTypography.cardTitle,
  },
  metaGroup: {
    gap: foundationSpacing.space1,
  },
  metaRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: foundationSpacing.space2,
  },
  meta: {
    ...foundationTypography.caption,
    flex: 1,
  },
  tabular: {
    fontVariant: ["tabular-nums"],
  },
});
