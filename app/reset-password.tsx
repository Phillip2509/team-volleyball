import { useURL } from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "@/components/card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase, supabaseConfig } from "@/lib/supabase";

type RecoveryParams = {
  accessToken: string | null;
  code: string | null;
  error: string | null;
  errorDescription: string | null;
  refreshToken: string | null;
};

function getCurrentUrl(fallbackUrl: string | null) {
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location.href) {
    return window.location.href;
  }

  return fallbackUrl;
}

function readRecoveryParams(rawUrl: string): RecoveryParams {
  const params = new URLSearchParams();
  const baseUrl =
    Platform.OS === "web" && typeof window !== "undefined"
      ? window.location.origin
      : "teamvolleyball://reset-password";
  const parsedUrl = new URL(rawUrl, baseUrl);

  parsedUrl.searchParams.forEach((value, key) => {
    params.set(key, value);
  });

  const hashValue = parsedUrl.hash.replace(/^#/, "");
  if (hashValue) {
    new URLSearchParams(hashValue).forEach((value, key) => {
      params.set(key, value);
    });
  }

  return {
    accessToken: params.get("access_token"),
    code: params.get("code"),
    error: params.get("error"),
    errorDescription: params.get("error_description"),
    refreshToken: params.get("refresh_token"),
  };
}

function getRecoveryErrorMessage(params: RecoveryParams) {
  if (!params.error && !params.errorDescription) {
    return "";
  }

  const message = `${params.error ?? ""} ${params.errorDescription ?? ""}`.toLowerCase();
  if (message.includes("expired")) {
    return "Der Link zum ZurÃ¼cksetzen ist abgelaufen. Bitte fordere einen neuen Link an.";
  }

  return "Der Link zum ZurÃ¼cksetzen ist ungÃ¼ltig. Bitte fordere einen neuen Link an.";
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const url = useURL();
  const { session, signOut, updatePassword } = useAuth();
  const { colors } = useTheme();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPreparing, setIsPreparing] = useState(Boolean(supabase));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(supabase ? "" : supabaseConfig.message);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [canSetPassword, setCanSetPassword] = useState(Boolean(session));

  const hasSession = useMemo(() => Boolean(session), [session]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const supabaseClient = supabase;
    const currentUrl = getCurrentUrl(url);
    if (currentUrl === processedUrl && !hasSession) {
      return;
    }

    async function prepareRecoverySession() {
      if (hasSession) {
        setCanSetPassword(true);
        setIsPreparing(false);
        return;
      }

      if (!currentUrl) {
        setMessage("Bitte öffne diese Seite über den Link aus der E-Mail zum Zurücksetzen.");
        setCanSetPassword(false);
        setIsPreparing(false);
        return;
      }

      setProcessedUrl(currentUrl);
      setIsPreparing(true);
      setMessage("");

      try {
        const params = readRecoveryParams(currentUrl);
        const recoveryError = getRecoveryErrorMessage(params);
        if (recoveryError) {
          setMessage(recoveryError);
          setCanSetPassword(false);
          return;
        }

        if (params.code) {
          const { error } = await supabaseClient.auth.exchangeCodeForSession(params.code);
          if (error) {
            throw error;
          }
          setCanSetPassword(true);
          return;
        }

        if (params.accessToken && params.refreshToken) {
          const { error } = await supabaseClient.auth.setSession({
            access_token: params.accessToken,
            refresh_token: params.refreshToken,
          });
          if (error) {
            throw error;
          }
          setCanSetPassword(true);
          return;
        }

        setMessage("Bitte öffne diese Seite über den Link aus der E-Mail zum Zurücksetzen.");
        setCanSetPassword(false);
      } catch {
        setMessage("Der Link zum Zurücksetzen ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.");
        setCanSetPassword(false);
      } finally {
        setIsPreparing(false);
      }
    }

    void prepareRecoverySession();
  }, [hasSession, processedUrl, url]);
  async function handleUpdatePassword() {
    if (!password || !confirmPassword) {
      setMessage("Bitte gib dein neues Passwort zweimal ein.");
      return;
    }

    if (password.length < 8) {
      setMessage("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Die beiden PasswÃ¶rter stimmen nicht Ã¼berein.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      await updatePassword(password);
      setMessage("Dein Passwort wurde geÃ¤ndert. Du wirst zum Login weitergeleitet.");
      await signOut();
      setTimeout(() => {
        router.replace("/login");
      }, 900);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Das Passwort konnte nicht geÃ¤ndert werden.");
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
          <Text style={[styles.title, { color: colors.text }]}>Neues Passwort</Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            Lege ein neues Passwort fÃ¼r deinen Zugang fest.
          </Text>
        </View>

        <Card>
          {isPreparing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.message, { color: colors.mutedText }]}>Link wird geprÃ¼ft ...</Text>
            </View>
          ) : null}

          <TextInput
            autoCapitalize="none"
            autoComplete="new-password"
            editable={!isPreparing && !isSubmitting && canSetPassword}
            onChangeText={setPassword}
            placeholder="Neues Passwort"
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

          <TextInput
            autoCapitalize="none"
            autoComplete="new-password"
            editable={!isPreparing && !isSubmitting && canSetPassword}
            onChangeText={setConfirmPassword}
            placeholder="Neues Passwort bestÃ¤tigen"
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

          {message ? (
            <Text style={[styles.message, { color: colors.mutedText }]}>{message}</Text>
          ) : null}

          <PrimaryButton
            disabled={isPreparing || isSubmitting || !canSetPassword}
            label={isSubmitting ? "Passwort wird gespeichert ..." : "Passwort speichern"}
            onPress={() => void handleUpdatePassword()}
          />

          <Pressable disabled={isSubmitting} onPress={() => router.replace("/login")} style={styles.backLink}>
            <Text style={[styles.linkText, { color: colors.primary }]}>ZurÃ¼ck zum Login</Text>
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
  loadingRow: {
    gap: spacing.sm,
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
