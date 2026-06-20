import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { ScreenContainer } from "@/components/screen-container";
import { SectionHeader } from "@/components/section-header";
import { StatusBadge } from "@/components/status-badge";
import { TeamMemberRow } from "@/components/team-member-row";
import { fontSizes, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTeam } from "@/context/team-context";
import { useTheme } from "@/context/theme-context";
import { demoDataNotice, demoTeam, demoTeamMembers } from "@/data/demo-data";
import type { TeamMembershipWithProfile } from "@/types/team";
import { formatDateTime, getTeamRoleLabel } from "@/utils/format";

export default function TeamScreen() {
  const { isDemoMode } = useAuth();
  const { colors } = useTheme();
  const { currentMembership, currentTeam, errorMessage, isMembersLoading, teamMembers } = useTeam();

  if (isDemoMode) {
    return (
      <ScreenContainer>
        <AppHeader
          eyebrow={demoDataNotice}
          title={demoTeam.name}
          subtitle={`${demoTeam.season} - neutrale Demo-Spieler fuer die erste UI-Basis.`}
        />
        <SectionHeader title="Teamuebersicht" caption="Lokale Mock-Spieler" />
        <Card>
          {demoTeamMembers.map((member) => (
            <TeamMemberRow key={member.id} member={member} />
          ))}
        </Card>
      </ScreenContainer>
    );
  }

  if (!currentTeam) {
    return (
      <ScreenContainer>
        <AppHeader title="Team" subtitle="Noch kein Team verbunden." />
        <EmptyState title="Kein Team" text="Erstelle ein Team oder tritt per Einladungscode bei." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader
        title={currentTeam.name}
        subtitle="Echte Teamdaten aus Supabase. Termine und Nachrichten sind noch nicht verbunden."
      />

      <View style={styles.grid}>
        <Card style={styles.statCard}>
          <Text style={[styles.label, { color: colors.mutedText }]}>Deine Rolle</Text>
          <StatusBadge status={getTeamRoleLabel(currentMembership?.role ?? "player")} />
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.label, { color: colors.mutedText }]}>Einladungscode</Text>
          <Text selectable style={[styles.code, { color: colors.text }]}>
            {currentTeam.joinCode}
          </Text>
        </Card>
      </View>

      <SectionHeader title="Mitglieder" caption={`${teamMembers.length} Personen im Team`} />
      {isMembersLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {errorMessage ? <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text> : null}
      <Card>
        {teamMembers.length === 0 ? (
          <Text style={[styles.body, { color: colors.mutedText }]}>
            Noch keine Mitglieder geladen.
          </Text>
        ) : (
          teamMembers.map((member) => <RealTeamMemberRow key={member.id} member={member} />)
        )}
      </Card>
    </ScreenContainer>
  );
}

function RealTeamMemberRow({ member }: { member: TeamMembershipWithProfile }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.memberRow, { borderBottomColor: colors.border }]}>
      <View style={styles.avatar}>
        <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
          {member.profile.displayName
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </Text>
      </View>
      <View style={styles.memberMain}>
        <Text style={[styles.memberName, { color: colors.text }]}>
          {member.profile.displayName}
        </Text>
        <Text style={[styles.memberMeta, { color: colors.mutedText }]}>
          Beigetreten: {formatDateTime(member.joinedAt)}
        </Text>
      </View>
      <StatusBadge status={getTeamRoleLabel(member.role)} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  code: {
    fontSize: fontSizes.xl,
    fontWeight: "900",
  },
  error: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  body: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
  },
  memberRow: {
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
  memberMain: {
    flex: 1,
    gap: 3,
  },
  memberName: {
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  memberMeta: {
    fontSize: fontSizes.sm,
  },
});
