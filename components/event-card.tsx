import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { StatusBadge } from "@/components/status-badge";
import { fontSizes, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import type { TeamEvent } from "@/types/models";
import { formatDate, getEventTypeLabel } from "@/utils/format";

export function EventCard({ event }: { event: TeamEvent }) {
  const { colors } = useTheme();

  return (
    <Card>
      <View style={styles.topRow}>
        <View style={styles.titleColumn}>
          <Text style={[styles.type, { color: colors.primary }]}>
            {getEventTypeLabel(event.type)}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>
        </View>
        <StatusBadge status={event.attendance} />
      </View>
      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: colors.mutedText }]}>
          {formatDate(event.date)} um {event.time}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedText }]}>{event.location}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  titleColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  type: {
    fontSize: fontSizes.xs,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  metaRow: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  meta: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
