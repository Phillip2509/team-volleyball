import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";

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
import type { TeamMembershipWithProfile, TeamRole } from "@/types/team";
import { formatDateTime, getTeamRoleLabel } from "@/utils/format";

const ROLE_OPTIONS: TeamRole[] = ["player", "coach", "admin"];

export default function TeamScreen() {
  const { isDemoMode } = useAuth();
  const { colors } = useTheme();
  const {
    clearMessages,
    currentMembership,
    currentTeam,
    errorMessage,
    isMembersLoading,
    successMessage,
    teamMembers,
    updateMemberRole,
    updatingMemberId,
  } = useTeam();
  const isCurrentUserAdmin = currentMembership?.role === "admin";

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
      {successMessage ? (
        <Text style={[styles.success, { color: colors.success }]}>{successMessage}</Text>
      ) : null}
      <Card>
        {teamMembers.length === 0 ? (
          <Text style={[styles.body, { color: colors.mutedText }]}>
            Noch keine Mitglieder geladen.
          </Text>
        ) : (
          teamMembers.map((member) => (
            <RealTeamMemberRow
              canManageRoles={isCurrentUserAdmin}
              currentUserId={currentMembership?.userId ?? ""}
              isUpdating={updatingMemberId === member.userId}
              key={member.id}
              member={member}
              onChangeRole={(nextRole) => {
                clearMessages();
                const oldRole = getTeamRoleLabel(member.role);
                const newRole = getTeamRoleLabel(nextRole);
                Alert.alert(
                  "Rolle aendern",
                  `${member.profile.displayName} wird von ${oldRole} zu ${newRole} geaendert.`,
                  [
                    { text: "Abbrechen", style: "cancel" },
                    {
                      text: "Aendern",
                      onPress: () => {
                        void updateMemberRole({
                          role: nextRole,
                          teamId: member.teamId,
                          userId: member.userId,
                        }).catch((error) => {
                          Alert.alert(
                            "Rolle konnte nicht geaendert werden",
                            error instanceof Error
                              ? error.message
                              : "Die Rolle konnte nicht geaendert werden.",
                          );
                        });
                      },
                    },
                  ],
                );
              }}
            />
          ))
        )}
      </Card>
    </ScreenContainer>
  );
}

function RealTeamMemberRow({
  canManageRoles,
  currentUserId,
  isUpdating,
  member,
  onChangeRole,
}: {
  canManageRoles: boolean;
  currentUserId: string;
  isUpdating: boolean;
  member: TeamMembershipWithProfile;
  onChangeRole: (role: TeamRole) => void;
}) {
  const { colors } = useTheme();
  const isOwnMembership = member.userId === currentUserId;
  const canChangeThisRole = canManageRoles && !isOwnMembership;

  return (
    <View style={[styles.memberBlock, { borderBottomColor: colors.border }]}>
      <View style={styles.memberRow}>
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
      {canManageRoles ? (
        <View style={styles.rolePanel}>
          {isOwnMembership ? (
            <Text style={[styles.roleHint, { color: colors.mutedText }]}>
              Deine eigene Rolle kann hier nicht geaendert werden.
            </Text>
          ) : (
            <>
              <Text style={[styles.roleHint, { color: colors.mutedText }]}>Rolle aendern</Text>
              <View style={styles.roleActions}>
                {ROLE_OPTIONS.map((role) => {
                  const isCurrentRole = member.role === role;
                  return (
                    <Pressable
                      disabled={!canChangeThisRole || isCurrentRole || isUpdating}
                      key={role}
                      onPress={() => onChangeRole(role)}
                      style={[
                        styles.roleButton,
                        {
                          backgroundColor: isCurrentRole
                            ? colors.primary
                            : colors.inputBackground,
                          borderColor: colors.border,
                        },
                        (!canChangeThisRole || isCurrentRole || isUpdating) && styles.disabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          { color: isCurrentRole ? colors.onPrimary : colors.text },
                        ]}
                      >
                        {isUpdating && !isCurrentRole ? "..." : getTeamRoleLabel(role)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>
      ) : null}
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
  success: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  body: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
  },
  memberBlock: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
  },
  memberRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
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
  rolePanel: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  roleHint: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
  },
  roleActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  roleButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  roleButtonText: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.62,
  },
});
