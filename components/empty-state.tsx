import { StyleSheet, Text, View } from "react-native";

import { fontSizes, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export function EmptyState({ title, text }: { title: string; text: string }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.primarySoft, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.text, { color: colors.mutedText }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  text: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
