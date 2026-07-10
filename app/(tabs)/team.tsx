import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";

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
import { hasRole } from "@/utils/roles";

const ROLE_OPTIONS: TeamRole[] = ["player", "coach", "admin"];
const ROLE_DISPLAY_ORDER: TeamRole[] = ["admin", "coach", "player"];

function sortRolesForDisplay(roles: TeamRole[]): TeamRole[] {
  return [...roles].sort(
    (left, right) => ROLE_DISPLAY_ORDER.indexOf(left) - ROLE_DISPLAY_ORDER.indexOf(right),
  );
}

type PendingRoleChange = {
  member: TeamMembershipWithProfile;
  nextRoles: TeamRole[];
  toggledRole: TeamRole;
  isAdding: boolean;
};

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
    updateMemberRoles,
    updatingMemberId,
  } = useTeam();
  const [pendingRoleChange, setPendingRoleChange] = useState<PendingRoleChange | null>(null);
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const isCurrentUserAdmin = hasRole(currentMembership, "admin");

  if (isDemoMode) {
    return (
      <ScreenContainer>
        <AppHeader
          eyebrow={demoDataNotice}
          title={demoTeam.name}
          subtitle={`${demoTeam.season} - neutrale Demo-Spieler für die erste UI-Basis.`}
        />
        <SectionHeader title="Teamübersicht" caption="Lokale Mock-Spieler" />
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
              isUpdating={updatingMemberId === member.userId}
              key={member.id}
              member={member}
              onToggleRole={(role) => {
                const isActive = member.roles.includes(role);
                const nextRoles = isActive
                  ? member.roles.filter((existingRole) => existingRole !== role)
                  : [...member.roles, role];

                if (nextRoles.length === 0) {
                  return;
                }

                clearMessages();
                setModalErrorMessage("");
                setPendingRoleChange({
                  isAdding: !isActive,
                  member,
                  nextRoles,
                  toggledRole: role,
                });
              }}
            />
          ))
        )}
      </Card>

      <RoleChangeModal
        errorMessage={modalErrorMessage}
        isUpdating={Boolean(
          pendingRoleChange &&
            updatingMemberId === pendingRoleChange.member.userId,
        )}
        onCancel={() => {
          if (!updatingMemberId) {
            setPendingRoleChange(null);
            setModalErrorMessage("");
          }
        }}
        onConfirm={() => {
          if (!pendingRoleChange) {
            return;
          }

          const { member, nextRoles } = pendingRoleChange;
          setModalErrorMessage("");
          void updateMemberRoles(member.userId, nextRoles)
            .then(() => {
              setPendingRoleChange(null);
            })
            .catch((error: unknown) => {
              setModalErrorMessage(
                error instanceof Error
                  ? error.message
                  : "Die Rollen konnten nicht geändert werden.",
              );
            });
        }}
        pendingRoleChange={pendingRoleChange}
      />
    </ScreenContainer>
  );
}

function RoleChangeModal({
  errorMessage,
  isUpdating,
  onCancel,
  onConfirm,
  pendingRoleChange,
}: {
  errorMessage: string;
  isUpdating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  pendingRoleChange: PendingRoleChange | null;
}) {
  const { colors } = useTheme();

  const memberName = pendingRoleChange?.member.profile.displayName ?? "";
  const toggledRoleLabel = pendingRoleChange
    ? getTeamRoleLabel(pendingRoleChange.toggledRole)
    : "";
  const nextRolesLabel = pendingRoleChange
    ? sortRolesForDisplay(pendingRoleChange.nextRoles).map(getTeamRoleLabel).join(", ")
    : "";
  const actionLabel = pendingRoleChange?.isAdding ? "hinzugefügt" : "entfernt";

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={Boolean(pendingRoleChange)}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>Rollen ändern</Text>
          <Text style={[styles.modalBody, { color: colors.mutedText }]}>
            {memberName}: Rolle „{toggledRoleLabel}“ wird {actionLabel}. Neue Rollen: {nextRolesLabel}.
          </Text>
          {errorMessage ? (
            <Text style={[styles.modalError, { color: colors.danger }]}>
              {errorMessage}
            </Text>
          ) : null}
          {isUpdating ? <ActivityIndicator color={colors.primary} /> : null}
          <View style={styles.modalActions}>
            <Pressable
              disabled={isUpdating}
              onPress={onCancel}
              style={[
                styles.modalButton,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
                isUpdating && styles.disabled,
              ]}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                Abbrechen
              </Text>
            </Pressable>
            <Pressable
              disabled={isUpdating}
              onPress={onConfirm}
              style={[
                styles.modalButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
                isUpdating && styles.disabled,
              ]}
            >
              <Text style={[styles.modalButtonText, { color: colors.onPrimary }]}>
                {isUpdating ? "Wird geändert ..." : "Bestätigen"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function RealTeamMemberRow({
  canManageRoles,
  isUpdating,
  member,
  onToggleRole,
}: {
  canManageRoles: boolean;
  isUpdating: boolean;
  member: TeamMembershipWithProfile;
  onToggleRole: (role: TeamRole) => void;
}) {
  const { colors } = useTheme();
  const rolesLabel = sortRolesForDisplay(member.roles).map(getTeamRoleLabel).join(" · ");

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
        <StatusBadge status={rolesLabel} />
      </View>
      {canManageRoles ? (
        <View style={styles.rolePanel}>
          <Text style={[styles.roleHint, { color: colors.mutedText }]}>Rollen bearbeiten</Text>
          <View style={styles.roleActions}>
            {ROLE_OPTIONS.map((role) => {
              const isActive = member.roles.includes(role);
              const wouldRemoveLastRole = isActive && member.roles.length <= 1;
              const isDisabled = isUpdating || wouldRemoveLastRole;
              return (
                <Pressable
                  disabled={isDisabled}
                  key={role}
                  onPress={() => onToggleRole(role)}
                  style={[
                    styles.roleButton,
                    {
                      backgroundColor: isActive ? colors.primary : colors.inputBackground,
                      borderColor: colors.border,
                    },
                    isDisabled && styles.disabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      { color: isActive ? colors.onPrimary : colors.text },
                    ]}
                  >
                    {getTeamRoleLabel(role)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.56)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 460,
    padding: spacing.xl,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    width: "100%",
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "900",
  },
  modalBody: {
    fontSize: fontSizes.md,
    lineHeight: 23,
  },
  modalError: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-end",
  },
  modalButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
});
