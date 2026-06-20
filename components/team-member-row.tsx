import { StyleSheet, Text, View } from "react-native";

import { StatusBadge } from "@/components/status-badge";
import { fontSizes, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import type { TeamMember } from "@/types/models";

export function TeamMemberRow({ member }: { member: TeamMember }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.avatar}>
        <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
          {member.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </Text>
      </View>
      <View style={styles.main}>
        <Text style={[styles.name, { color: colors.text }]}>{member.name}</Text>
        <Text style={[styles.meta, { color: colors.mutedText }]}>
          {member.position} · {member.role}
        </Text>
      </View>
      <StatusBadge status={member.status} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#047E9B",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    fontSize: fontSizes.sm,
    fontWeight: "900",
  },
  main: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  meta: {
    fontSize: fontSizes.sm,
  },
});
