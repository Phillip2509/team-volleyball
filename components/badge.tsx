import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import {
  foundationRadius,
  foundationSizes,
  foundationSpacing,
  foundationTypography,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";
type BadgeIconName = keyof typeof Ionicons.glyphMap;

export function Badge({
  label,
  tone = "neutral",
  icon,
}: {
  label: string;
  tone?: BadgeTone;
  icon?: BadgeIconName;
}) {
  const { foundationColors, resolvedTheme } = useTheme();
  const toneColor =
    tone === "accent"
      ? resolvedTheme === "light"
        ? foundationColors.accentPressed
        : foundationColors.accent
      : tone === "success"
        ? foundationColors.success
        : tone === "warning"
          ? foundationColors.warning
          : tone === "danger"
            ? foundationColors.danger
            : foundationColors.mutedText;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor:
            tone === "accent" ? foundationColors.accentSoft : foundationColors.surfaceSubtle,
          borderColor: toneColor,
        },
      ]}
    >
      {icon ? <Ionicons color={toneColor} name={icon} size={foundationSizes.inlineIcon} /> : null}
      <Text style={[styles.label, { color: toneColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: foundationRadius.small,
    borderWidth: 1,
    flexDirection: "row",
    gap: foundationSpacing.space1,
    paddingHorizontal: foundationSpacing.space2,
    paddingVertical: foundationSpacing.space1,
  },
  label: {
    ...foundationTypography.caption,
  },
});
