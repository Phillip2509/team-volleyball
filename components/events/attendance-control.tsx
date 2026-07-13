import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { InlineFeedback } from "@/components/inline-feedback";
import {
  foundationRadius,
  foundationSizes,
  foundationSpacing,
  foundationTypography,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import type { EventResponseValue } from "@/types/team";

const responseOptions = [
  { value: "accepted", label: "Zusagen", icon: "checkmark-circle-outline" },
  { value: "maybe", label: "Vielleicht", icon: "help-circle-outline" },
  { value: "declined", label: "Absagen", icon: "close-circle-outline" },
] as const;

function getResponseLabel(value: EventResponseValue | null) {
  if (value === null) {
    return "Standardmäßig zugesagt · noch nicht bestätigt";
  }
  if (value === "accepted") {
    return "Zugesagt";
  }
  if (value === "maybe") {
    return "Vielleicht";
  }
  return "Abgesagt";
}

export function AttendanceControl({
  eventTitle,
  value,
  canRespond,
  unavailableReason,
  saving = false,
  errorMessage,
  successMessage,
  onSelect,
}: {
  eventTitle: string;
  value: EventResponseValue | null;
  canRespond: boolean;
  unavailableReason?: string;
  saving?: boolean;
  errorMessage?: string;
  successMessage?: string;
  onSelect?: (response: EventResponseValue) => void;
}) {
  const { foundationColors } = useTheme();
  const { fontScale } = useWindowDimensions();
  const stackActions = fontScale >= 1.3;
  const effectiveValue = value ?? "accepted";

  return (
    <View accessibilityState={{ busy: saving }} style={styles.container}>
      <View style={styles.statusRow}>
        <Ionicons
          color={foundationColors.mutedText}
          name={value === null ? "information-circle-outline" : "person-circle-outline"}
          size={foundationSizes.inlineIcon}
        />
        <Text style={[styles.statusText, { color: foundationColors.mutedText }]}>
          {getResponseLabel(value)}
        </Text>
      </View>

      {canRespond && onSelect ? (
        <View style={[styles.actions, stackActions && styles.stackedActions]}>
          {responseOptions.map((option) => {
            const selected = effectiveValue === option.value;
            const optionColor =
              option.value === "accepted"
                ? foundationColors.success
                : option.value === "maybe"
                  ? foundationColors.warning
                  : foundationColors.danger;

            return (
              <Pressable
                accessibilityLabel={`${option.label} für ${eventTitle}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: saving, selected }}
                disabled={saving}
                key={option.value}
                onPress={() => onSelect(option.value)}
                style={({ pressed }) => [
                  styles.option,
                  stackActions && styles.stackedOption,
                  {
                    backgroundColor: selected
                      ? foundationColors.surfaceSubtle
                      : foundationColors.surface,
                    borderColor: selected ? optionColor : foundationColors.border,
                  },
                  pressed && !saving && { backgroundColor: foundationColors.surfaceSubtle },
                ]}
              >
                <Ionicons
                  color={selected ? optionColor : foundationColors.mutedText}
                  name={selected ? "checkmark-circle" : option.icon}
                  size={foundationSizes.controlIcon}
                />
                <Text
                  numberOfLines={stackActions ? undefined : 1}
                  style={[
                    styles.optionLabel,
                    { color: selected ? optionColor : foundationColors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : unavailableReason ? (
        <Text style={[styles.unavailable, { color: foundationColors.mutedText }]}>
          {unavailableReason}
        </Text>
      ) : null}

      {saving ? (
        <View accessibilityLiveRegion="polite" style={styles.progressRow}>
          <ActivityIndicator color={foundationColors.accent} size="small" />
          <Text style={[styles.progressText, { color: foundationColors.mutedText }]}>
            Rückmeldung wird gespeichert …
          </Text>
        </View>
      ) : null}
      {errorMessage ? <InlineFeedback message={errorMessage} tone="error" /> : null}
      {successMessage ? <InlineFeedback message={successMessage} tone="success" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: foundationSpacing.space2,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: foundationSpacing.space1,
  },
  statusText: {
    ...foundationTypography.caption,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: foundationSpacing.space2,
  },
  stackedActions: {
    flexDirection: "column",
  },
  option: {
    alignItems: "center",
    borderRadius: foundationRadius.control,
    borderWidth: 1,
    flex: 1,
    gap: foundationSpacing.space1,
    justifyContent: "center",
    minHeight: foundationSizes.minimumTouchTarget,
    minWidth: 0,
    paddingHorizontal: foundationSpacing.space1,
    paddingVertical: foundationSpacing.space1,
  },
  stackedOption: {
    flexDirection: "row",
    flexGrow: 0,
    paddingHorizontal: foundationSpacing.space3,
  },
  optionLabel: {
    ...foundationTypography.caption,
    textAlign: "center",
  },
  unavailable: {
    ...foundationTypography.caption,
  },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: foundationSpacing.space2,
  },
  progressText: {
    ...foundationTypography.caption,
    flex: 1,
  },
});
