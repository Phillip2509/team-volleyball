import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "@/components/card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordResetRedirectUrl() {
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/reset-password`;
  }

  return Linking.createURL("reset-password");
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestPasswordReset } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  async function handleSubmit() {
    if (!normalizedEmail) {
      setMessage("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setMessage("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      await requestPasswordReset(normalizedEmail, getPasswordResetRedirectUrl());
      setMessage(
        "Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde eine Nachricht zum Zurücksetzen des Passworts versendet.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Die Nachricht konnte nicht versendet werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScreenContainer>
        <View style={styles.hero}>
          <Text style={[styles.title, { color: colors.text }]}>Passwort zurücksetzen</Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Festlegen eines neuen Passworts.
          </Text>
        </View>

        <Card>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            editable={!isSubmitting}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="name@beispiel.de"
            placeholderTextColor={colors.mutedText}
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={email}
          />

          {message ? (
            <Text style={[styles.message, { color: colors.mutedText }]}>{message}</Text>
          ) : null}

          <PrimaryButton
            disabled={isSubmitting}
            label={isSubmitting ? "Nachricht wird versendet ..." : "Link zum Zurücksetzen senden"}
            onPress={() => void handleSubmit()}
          />

          <Pressable disabled={isSubmitting} onPress={() => router.replace("/login")} style={styles.backLink}>
            <Text style={[styles.linkText, { color: colors.primary }]}>Zurück zum Login</Text>
          </Pressable>
        </Card>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: fontSizes.md,
    lineHeight: 23,
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
  backLink: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  linkText: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
});
