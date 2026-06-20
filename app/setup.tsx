import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { fontSizes, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

export default function SetupScreen() {
  const { enterDemoMode, setupMessage } = useAuth();
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={[styles.kicker, { color: colors.primary }]}>Setup</Text>
        <Text style={[styles.title, { color: colors.text }]}>Team Volleyball</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Supabase ist vorbereitet, aber in dieser lokalen Umgebung noch nicht
          verbunden.
        </Text>
      </View>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Konfiguration fehlt
        </Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>{setupMessage}</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Fuer UI-Tests kannst du die lokale Demo-App mit Mock-Daten oeffnen.
        </Text>
        <PrimaryButton label="Demo-App lokal oeffnen" onPress={enterDemoMode} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    paddingTop: spacing.xxl,
  },
  kicker: {
    fontSize: fontSizes.xs,
    fontWeight: "900",
    textTransform: "uppercase",
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
    fontSize: fontSizes.lg,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
});
