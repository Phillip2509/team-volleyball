import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { fontSizes, foundationSpacing, foundationTypography, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export function AppHeader({
  eyebrow,
  title,
  subtitle,
  variant = "default",
  rightAction,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  variant?: "default" | "greeting";
  rightAction?: ReactNode;
}) {
  const { colors, foundationColors } = useTheme();

  if (variant === "greeting") {
    return (
      <View style={styles.greetingHeader}>
        <View style={styles.greetingCopy}>
          {eyebrow ? (
            <Text style={[styles.eyebrow, { color: foundationColors.accent }]}>{eyebrow}</Text>
          ) : null}
          <Text style={[styles.greetingTitle, { color: foundationColors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.greetingSubtitle, { color: foundationColors.mutedText }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
      </View>
    );
  }

  return (
    <View style={styles.header}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
      ) : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  eyebrow: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: fontSizes.md,
    lineHeight: 23,
  },
  greetingHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: foundationSpacing.space3,
    justifyContent: "space-between",
    paddingTop: foundationSpacing.space2,
  },
  greetingCopy: {
    flex: 1,
    gap: foundationSpacing.space1,
    minWidth: 0,
  },
  greetingTitle: {
    ...foundationTypography.greeting,
  },
  greetingSubtitle: {
    ...foundationTypography.body,
  },
  rightAction: {
    flexShrink: 0,
  },
});
