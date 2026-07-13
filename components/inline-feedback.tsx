import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  foundationRadius,
  foundationSizes,
  foundationSpacing,
  foundationTypography,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export type InlineFeedbackTone = "info" | "success" | "warning" | "error";

const feedbackIcons = {
  info: "information-circle-outline",
  success: "checkmark-circle-outline",
  warning: "warning-outline",
  error: "alert-circle-outline",
} as const;

export function InlineFeedback({
  message,
  tone = "info",
  actionLabel,
  onAction,
}: {
  message: string;
  tone?: InlineFeedbackTone;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { foundationColors } = useTheme();
  const toneColor =
    tone === "success"
      ? foundationColors.success
      : tone === "warning"
        ? foundationColors.warning
        : tone === "error"
          ? foundationColors.danger
          : foundationColors.accent;

  return (
    <View
      accessibilityLiveRegion={tone === "error" ? "assertive" : "polite"}
      accessibilityRole={tone === "error" ? "alert" : undefined}
      style={[
        styles.container,
        {
          backgroundColor: foundationColors.surfaceSubtle,
          borderColor: toneColor,
        },
      ]}
    >
      <View style={styles.messageRow}>
        <Ionicons
          color={toneColor}
          name={feedbackIcons[tone]}
          size={foundationSizes.controlIcon}
        />
        <Text style={[styles.message, { color: foundationColors.text }]}>{message}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={[styles.actionLabel, { color: toneColor }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 3,
    borderRadius: foundationRadius.small,
    gap: foundationSpacing.space2,
    paddingHorizontal: foundationSpacing.space3,
    paddingVertical: foundationSpacing.space2,
  },
  messageRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: foundationSpacing.space2,
  },
  message: {
    ...foundationTypography.label,
    flex: 1,
  },
  action: {
    alignItems: "center",
    alignSelf: "flex-start",
    justifyContent: "center",
    minHeight: foundationSizes.minimumTouchTarget,
    paddingHorizontal: foundationSpacing.space2,
  },
  actionLabel: {
    ...foundationTypography.label,
  },
  pressed: {
    opacity: 0.7,
  },
});
