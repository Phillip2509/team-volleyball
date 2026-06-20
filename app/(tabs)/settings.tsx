import Constants from "expo-constants";
import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTeam } from "@/context/team-context";
import { useTheme } from "@/context/theme-context";
import { getTeamRoleLabel } from "@/utils/format";

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
  const { currentMembership, currentTeam, refreshMembers } = useTeam();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
        <Text style={[styles.cardTitle, { color: colors.text }]}>Datenschutz</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Platzhalter fuer spaetere Datenschutzinformationen.
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
