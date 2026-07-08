import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

export default function ProfileSetupScreen() {
  const { colors } = useTheme();
  const { profile, signOut, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(
    profile?.displayName === "Neues Mitglied" ? "" : profile?.displayName ?? "",
  );
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function saveProfile() {
    setMessage("");
    setIsSaving(true);
    try {
      await updateProfile(displayName);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profil konnte nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert(
        "Abmelden fehlgeschlagen",
        error instanceof Error ? error.message : "Bitte versuche es erneut.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader
        title="Profil einrichten"
        subtitle="Lege fest, welcher Name in deinem Team angezeigt wird."
      />

      <Card>
        <Text style={[styles.label, { color: colors.text }]}>Anzeigename</Text>
        <TextInput
          autoCapitalize="words"
          editable={!isSaving}
          onChangeText={setDisplayName}
          placeholder="Dein Name"
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
        {message ? (
          <Text style={[styles.message, { color: colors.danger }]}>{message}</Text>
        ) : null}
        {isSaving ? <ActivityIndicator color={colors.primary} /> : null}
        <PrimaryButton
          disabled={isSaving}
          label={isSaving ? "Profil wird gespeichert ..." : "Profil speichern"}
          onPress={saveProfile}
        />
      </Card>

      <PrimaryButton
        variant="secondary"
        label={isSigningOut ? "Abmelden ..." : "Abmelden"}
        onPress={handleSignOut}
        disabled={isSaving || isSigningOut}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fontSizes.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  message: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
});
