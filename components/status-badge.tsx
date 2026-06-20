import { StyleSheet, Text, View } from "react-native";

import { fontSizes, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import type { AttendanceResponse } from "@/types/models";
import { getAttendanceLabel } from "@/utils/format";

export function StatusBadge({ status }: { status: AttendanceResponse | string }) {
  const { colors } = useTheme();
  const tone =
    status === "yes" || status === "aktiv"
      ? "success"
      : status === "no" || status === "verletzt"
        ? "danger"
        : status === "maybe" || status === "pausiert"
          ? "warning"
          : "neutral";

  const background =
    tone === "success"
      ? colors.successSoft
      : tone === "danger"
        ? colors.dangerSoft
        : tone === "warning"
          ? colors.warningSoft
          : colors.inputBackground;
  const textColor =
    tone === "success"
      ? colors.success
      : tone === "danger"
        ? colors.danger
        : tone === "warning"
          ? colors.warning
          : colors.mutedText;

  const label =
    status === "yes" || status === "maybe" || status === "no" || status === "open"
      ? getAttendanceLabel(status)
      : status;

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  text: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
  },
});
