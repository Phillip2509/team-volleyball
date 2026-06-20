import { StyleSheet, Text, View } from "react-native";

import { fontSizes, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export function SectionHeader({
  title,
  caption,
}: {
  title: string;
  caption?: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {caption ? (
        <Text style={[styles.caption, { color: colors.mutedText }]}>{caption}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  caption: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
