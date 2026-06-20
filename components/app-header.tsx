import { StyleSheet, Text, View } from "react-native";

import { fontSizes, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export function AppHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  const { colors } = useTheme();

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
});
