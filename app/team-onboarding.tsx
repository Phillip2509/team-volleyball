import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { SectionHeader } from "@/components/section-header";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useTeam } from "@/context/team-context";
import { useTheme } from "@/context/theme-context";

export default function TeamOnboardingScreen() {
  const { colors } = useTheme();
  const { createTeam, joinTeamByCode } = useTeam();
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateTeam() {
    setMessage("");
    setIsSubmitting(true);
    try {
      await createTeam(teamName);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Team konnte nicht erstellt werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleJoinTeam() {
    setMessage("");
    setIsSubmitting(true);
    try {
      await joinTeamByCode(joinCode);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Teambeitritt ist fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader
        title="Team verbinden"
        subtitle="Erstelle ein neues Team als Admin oder tritt einem bestehenden Team per Einladungscode bei."
      />

      <View style={styles.cards}>
        <Card style={styles.card}>
          <SectionHeader title="Team erstellen" caption="Du wirst automatisch Admin." />
          <TextInput
            editable={!isSubmitting}
            onChangeText={setTeamName}
            placeholder="Teamname"
            placeholderTextColor={colors.mutedText}
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={teamName}
          />
          <PrimaryButton
            disabled={isSubmitting}
            label="Team erstellen"
            onPress={handleCreateTeam}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="Team beitreten" caption="Standardrolle: Spieler." />
          <TextInput
            autoCapitalize="characters"
            editable={!isSubmitting}
            onChangeText={setJoinCode}
            placeholder="Einladungscode"
            placeholderTextColor={colors.mutedText}
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={joinCode}
          />
          <PrimaryButton
            disabled={isSubmitting}
            label="Team beitreten"
            onPress={handleJoinTeam}
          />
        </Card>
      </View>

      {isSubmitting ? <ActivityIndicator color={colors.primary} /> : null}
      {message ? <Text style={[styles.message, { color: colors.danger }]}>{message}</Text> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: spacing.lg,
  },
  card: {
    gap: spacing.lg,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fontSizes.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  message: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
