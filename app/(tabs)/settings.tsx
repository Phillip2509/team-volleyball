import Constants from "expo-constants";
import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { TimePickerField } from "@/components/events/time-picker-field";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTeam } from "@/context/team-context";
import { useTheme } from "@/context/theme-context";
import { getTeamRoleLabel } from "@/utils/format";
import { hasRole } from "@/utils/roles";

export default function SettingsScreen() {
  const { colors, preference, setPreference, systemTheme } = useTheme();
  const {
    isDemoMode,
    leaveDemoMode,
    profile,
    reloadProfile,
    session,
    signOut,
    updateProfile,
    user,
  } = useAuth();
  const { currentMembership, currentTeam, refreshMembers, updateTeamDefaultResponseDeadline } = useTeam();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [deadlineDraft, setDeadlineDraft] = useState({
    enabled: false,
    teamId: "",
    time: "16:00",
  });
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);

  if ((currentTeam?.id ?? "") !== deadlineDraft.teamId) {
    setDeadlineDraft({
      enabled: Boolean(currentTeam?.defaultResponseDeadlineEnabled),
      teamId: currentTeam?.id ?? "",
      time: currentTeam?.defaultResponseDeadlineTime ?? "16:00",
    });
  }

  const canManageTeamSettings =
    currentMembership ? hasRole(currentMembership, "admin") || hasRole(currentMembership, "coach") : false;

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      Alert.alert(
        "Abmeldung fehlgeschlagen",
        error instanceof Error ? error.message : "Bitte versuche es erneut.",
      );
    }
  }

  async function saveProfile() {
    setStatusMessage("");
    setIsSavingProfile(true);
    try {
      await updateProfile(displayName);
      await reloadProfile();
      await refreshMembers();
      setStatusMessage("Profil wurde gespeichert.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Profil konnte nicht gespeichert werden.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function saveDefaultDeadline() {
    setStatusMessage("");
    setIsSavingDeadline(true);
    try {
      await updateTeamDefaultResponseDeadline(
        deadlineDraft.enabled,
        deadlineDraft.enabled ? deadlineDraft.time : null,
      );
      setStatusMessage("Standard-Rückmeldefrist wurde gespeichert.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Standard-Rückmeldefrist konnte nicht gespeichert werden.",
      );
    } finally {
      setIsSavingDeadline(false);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader
        title="Einstellungen"
        subtitle="Darstellung, Profil, Team und App-Informationen."
      />

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Theme</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          System aktuell: {systemTheme === "dark" ? "Dunkel" : "Hell"}
        </Text>
        <View style={styles.segment}>
          {(["system", "light", "dark"] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => void setPreference(option)}
              style={[
                styles.segmentButton,
                {
                  backgroundColor:
                    preference === option ? colors.primary : colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: preference === option ? colors.onPrimary : colors.text },
                ]}
              >
                {option === "system" ? "System" : option === "light" ? "Hell" : "Dunkel"}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Profil</Text>
        {isDemoMode ? (
          <Text style={[styles.body, { color: colors.mutedText }]}>
            Demo-Modus: Es werden keine Supabase-Profildaten gespeichert.
          </Text>
        ) : (
          <>
            <InfoRow label="E-Mail" value={user?.email ?? "Unbekannt"} />
            <Text style={[styles.label, { color: colors.text }]}>Anzeigename</Text>
            <TextInput
              editable={!isSavingProfile}
              onChangeText={setDisplayName}
              placeholder="Anzeigename"
              placeholderTextColor={colors.mutedText}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={displayName}
            />
            <PrimaryButton
              disabled={isSavingProfile}
              label={isSavingProfile ? "Profil wird gespeichert ..." : "Anzeigenamen speichern"}
              onPress={saveProfile}
            />
          </>
        )}
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Team</Text>
        {currentTeam ? (
          <>
            <InfoRow label="Aktuelles Team" value={currentTeam.name} />
            <InfoRow label="Rolle" value={getTeamRoleLabel(currentMembership?.role ?? "player")} />
            <InfoRow label="Einladungscode" value={currentTeam.joinCode} />
          </>
        ) : (
          <Text style={[styles.body, { color: colors.mutedText }]}>
            {isDemoMode ? "Lokale Demo-Teamdaten." : "Noch kein Team verbunden."}
          </Text>
        )}
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Standard-Rückmeldefrist</Text>
        {currentTeam ? (
          <>
            <Text style={[styles.body, { color: colors.mutedText }]}>
              {deadlineDraft.enabled
                ? `Rückmeldungen sind am Veranstaltungstag bis ${deadlineDraft.time} Uhr möglich.`
                : "Es wird keine automatische Rückmeldefrist gesetzt. Individuelle Fristen kannst du beim Erstellen oder Bearbeiten eines Termins festlegen."}
            </Text>
            {canManageTeamSettings ? (
              <>
                <View style={styles.segment}>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: deadlineDraft.enabled }}
                    onPress={() =>
                      setDeadlineDraft((currentDraft) => ({
                        ...currentDraft,
                        enabled: !currentDraft.enabled,
                      }))
                    }
                    style={[
                      styles.segmentButton,
                      {
                        backgroundColor: deadlineDraft.enabled ? colors.primary : colors.inputBackground,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { color: deadlineDraft.enabled ? colors.onPrimary : colors.text },
                      ]}
                    >
                      Am Veranstaltungstag
                    </Text>
                  </Pressable>
                </View>
                {deadlineDraft.enabled ? (
                  <TimePickerField
                    fallbackTime="16:00"
                    label="Uhrzeit"
                    onChange={(value) =>
                      setDeadlineDraft((currentDraft) => ({ ...currentDraft, time: value }))
                    }
                    value={deadlineDraft.time}
                  />
                ) : null}
                <PrimaryButton
                  disabled={isSavingDeadline}
                  label={isSavingDeadline ? "Wird gespeichert ..." : "Standard speichern"}
                  onPress={() => void saveDefaultDeadline()}
                />
              </>
            ) : (
              <Text style={[styles.body, { color: colors.mutedText }]}>
                Nur Admins und Trainer können diese Team-Einstellung ändern.
              </Text>
            )}
          </>
        ) : (
          <Text style={[styles.body, { color: colors.mutedText }]}>Noch kein Team verbunden.</Text>
        )}
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Datenschutz</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Platzhalter für spätere Datenschutzinformationen.
        </Text>
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>App-Informationen</Text>
        <InfoRow label="App" value="Team Volleyball" />
        <InfoRow label="Version" value={Constants.expoConfig?.version ?? "1.0.0"} />
        <InfoRow label="Plattform" value={Platform.OS} />
      </Card>

      {statusMessage ? (
        <Text style={[styles.statusMessage, { color: colors.mutedText }]}>{statusMessage}</Text>
      ) : null}

      {session ? (
        <PrimaryButton label="Abmelden" onPress={() => void handleSignOut()} variant="secondary" />
      ) : null}
      {isDemoMode ? (
        <PrimaryButton label="Demo-Modus verlassen" onPress={leaveDemoMode} variant="secondary" />
      ) : null}
    </ScreenContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedText }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  body: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fontSizes.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  segment: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  segmentButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  segmentText: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
    textAlign: "center",
  },
  infoRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  infoLabel: {
    fontSize: fontSizes.sm,
  },
  infoValue: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  statusMessage: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
