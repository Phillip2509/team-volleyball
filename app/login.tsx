import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "@/components/card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

type AuthMode = "login" | "register";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { enterDemoMode, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setMessage("Bitte gib E-Mail und Passwort ein.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      if (mode === "login") {
        await signIn(normalizedEmail, password);
      } else {
        await signUp(normalizedEmail, password);
        setMessage("Account wurde angelegt. Falls Supabase E-Mail-Bestaetigung fordert, pruefe dein Postfach.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Die Aktion ist fehlgeschlagen.");
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
          <Text style={[styles.title, { color: colors.text }]}>Team Volleyball</Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            Melde dich an, sobald Supabase verbunden ist, oder nutze lokal die Demo-Ansicht.
          </Text>
        </View>

        <Card>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {mode === "login" ? "Anmelden" : "Account erstellen"}
          </Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
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
          <TextInput
            autoCapitalize="none"
            autoComplete={mode === "login" ? "password" : "new-password"}
            onChangeText={setPassword}
            placeholder="Passwort"
            placeholderTextColor={colors.mutedText}
            secureTextEntry
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={password}
          />
          {message ? (
            <Text style={[styles.message, { color: colors.mutedText }]}>{message}</Text>
          ) : null}
          <PrimaryButton
            disabled={isSubmitting}
            label={isSubmitting ? "Bitte warten ..." : mode === "login" ? "Anmelden" : "Registrieren"}
            onPress={submit}
          />
          <PrimaryButton
            label={mode === "login" ? "Zur Registrierung wechseln" : "Zum Login wechseln"}
            onPress={() => setMode(mode === "login" ? "register" : "login")}
            variant="secondary"
          />
          <PrimaryButton label="Demo-App lokal oeffnen" onPress={enterDemoMode} variant="secondary" />
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
  cardTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "900",
    marginBottom: spacing.md,
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
