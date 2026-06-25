import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "@/components/card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

type AuthMode = "login" | "register" | "verify";

const RESEND_COOLDOWN_SECONDS = 45;

export default function LoginScreen() {
  const { colors } = useTheme();
  const { enterDemoMode, reloadProfile, resendEmailOtp, signIn, signUp, verifyEmailOtp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [resendCooldown]);

  function resetFeedback(nextMode?: AuthMode) {
    setMessage("");
    if (nextMode) {
      setMode(nextMode);
    }
  }

  function validateEmail() {
    if (!normalizedEmail) {
      setMessage("Bitte gib deine E-Mail-Adresse ein.");
      return false;
    }
    return true;
  }

  async function handleSignIn() {
    if (!validateEmail()) {
      return;
    }
    if (!password) {
      setMessage("Bitte gib dein Passwort ein.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      await signIn(normalizedEmail, password);
      await reloadProfile();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Die Anmeldung ist fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignUp() {
    if (!validateEmail()) {
      return;
    }

    if (displayName.trim().length < 2) {
      setMessage("Bitte gib einen Anzeigenamen mit mindestens 2 Zeichen ein.");
      return;
    }

    if (password.length < 8) {
      setMessage("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Die beiden Passwörter stimmen nicht überein.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      await signUp(normalizedEmail, password, displayName);
      setPassword("");
      setConfirmPassword("");
      setOtpCode("");
      setMode("verify");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setMessage("Code versendet. Bitte prüfe deine E-Mail und gib den Code hier ein.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registrierung fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode() {
    if (!validateEmail()) {
      return;
    }

    const cleanCode = otpCode.trim();
    if (!/^\d{6,10}$/.test(cleanCode)) {
      setMessage("Bitte gib den vollständigen Code aus deiner E-Mail ein.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      await verifyEmailOtp(normalizedEmail, cleanCode);
      await reloadProfile();
      setMessage("Verifizierung erfolgreich. Du wirst jetzt weitergeleitet.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Der Code konnte nicht bestätigt werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0 || isSubmitting || !validateEmail()) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      await resendEmailOtp(normalizedEmail);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setMessage("Neuer Code versendet. Bitte prüfe deine E-Mail.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Der Code konnte nicht erneut gesendet werden.");
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
            Melde dich an oder erstelle deinen Zugang mit E-Mail-Code.
          </Text>
        </View>

        <Card>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {mode === "login"
              ? "Anmelden"
              : mode === "register"
                ? "Account erstellen"
                : "Code bestätigen"}
          </Text>

          {mode === "register" ? (
            <TextInput
              autoCapitalize="words"
              editable={!isSubmitting}
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
          ) : null}

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

          {mode !== "verify" ? (
            <TextInput
              autoCapitalize="none"
              autoComplete={mode === "login" ? "password" : "new-password"}
              editable={!isSubmitting}
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
          ) : null}

          {mode === "register" ? (
            <TextInput
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isSubmitting}
              onChangeText={setConfirmPassword}
              placeholder="Passwort bestätigen"
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
              value={confirmPassword}
            />
          ) : null}

          {mode === "verify" ? (
            <TextInput
              autoComplete="one-time-code"
              editable={!isSubmitting}
              keyboardType="number-pad"
              onChangeText={setOtpCode}
              placeholder="Code"
              placeholderTextColor={colors.mutedText}
              style={[
                styles.input,
                styles.codeInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              textContentType="oneTimeCode"
              value={otpCode}
            />
          ) : null}

          {message ? (
            <Text style={[styles.message, { color: colors.mutedText }]}>{message}</Text>
          ) : null}

          {mode === "login" ? (
            <PrimaryButton
              disabled={isSubmitting}
              label={isSubmitting ? "Anmeldung läuft ..." : "Anmelden"}
              onPress={handleSignIn}
            />
          ) : null}

          {mode === "register" ? (
            <PrimaryButton
              disabled={isSubmitting}
              label={isSubmitting ? "Account wird erstellt ..." : "Account erstellen"}
              onPress={handleSignUp}
            />
          ) : null}

          {mode === "verify" ? (
            <>
              <PrimaryButton
                disabled={isSubmitting}
                label={isSubmitting ? "Code wird geprüft ..." : "Code bestätigen"}
                onPress={handleVerifyCode}
              />
              <PrimaryButton
                disabled={isSubmitting || resendCooldown > 0}
                label={
                  resendCooldown > 0
                    ? `Code erneut senden (${resendCooldown}s)`
                    : "Code erneut senden"
                }
                onPress={handleResendCode}
                variant="secondary"
              />
            </>
          ) : null}

          <View style={styles.links}>
            {mode !== "login" ? (
              <Pressable disabled={isSubmitting} onPress={() => resetFeedback("login")}>
                <Text style={[styles.linkText, { color: colors.primary }]}>Zum Login</Text>
              </Pressable>
            ) : (
              <Pressable disabled={isSubmitting} onPress={() => resetFeedback("register")}>
                <Text style={[styles.linkText, { color: colors.primary }]}>Account erstellen</Text>
              </Pressable>
            )}
          </View>

          <PrimaryButton label="Demo-App lokal öffnen" onPress={enterDemoMode} variant="secondary" />
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
  codeInput: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 8,
    textAlign: "center",
  },
  message: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  links: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  linkText: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
});
