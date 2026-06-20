import Constants from "expo-constants";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

export default function SettingsScreen() {
  const { colors, preference, setPreference, systemTheme } = useTheme();
  const { isDemoMode, leaveDemoMode, session, signOut } = useAuth();

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

  return (
    <ScreenContainer>
      <AppHeader
        title="Einstellungen"
        subtitle="Darstellung, Profil-Platzhalter und App-Informationen."
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
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Profilfelder werden angelegt, sobald Team- und Rollenlogik mit Supabase verbunden wird.
        </Text>
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Datenschutz</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Platzhalter fuer spaetere Datenschutzinformationen. Aktuell werden nur lokale Demo-Daten angezeigt.
        </Text>
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>App-Informationen</Text>
        <InfoRow label="App" value="Team Volleyball" />
        <InfoRow label="Version" value={Constants.expoConfig?.version ?? "1.0.0"} />
        <InfoRow label="Plattform" value={Platform.OS} />
      </Card>

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
});
