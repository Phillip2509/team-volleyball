import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { EventCard } from "@/components/event-card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { SectionHeader } from "@/components/section-header";
import { StatusBadge } from "@/components/status-badge";
import { demoAnnouncements, demoDataNotice, demoEvents, demoTeamMembers } from "@/data/demo-data";
import { fontSizes, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const nextEvent = demoEvents[0];
  const activeMembers = demoTeamMembers.filter((member) => member.status === "aktiv").length;
  const latestAnnouncement = demoAnnouncements[0];

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow={demoDataNotice}
        title="Bereit fuer den naechsten Satz?"
        subtitle="Eine moderne Basis fuer Termine, Zusagen, Teamuebersicht und Mannschaftskommunikation."
      />

      <EventCard event={nextEvent} />

      <View style={styles.grid}>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.text }]}>8/12</Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>Zugesagt</Text>
          <StatusBadge status="yes" />
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.text }]}>{activeMembers}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>Aktive im Team</Text>
          <StatusBadge status="aktiv" />
        </Card>
      </View>

      <SectionHeader title="Letzte Mitteilung" caption="Lokale Demo-Nachricht" />
      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{latestAnnouncement.title}</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>{latestAnnouncement.body}</Text>
      </Card>

      <SectionHeader title="Schnellaktionen" />
      <View style={styles.actions}>
        <PrimaryButton label="Zu-/Absagen vorbereiten" onPress={() => router.push("/events")} variant="secondary" />
        <PrimaryButton label="Termine anzeigen" onPress={() => router.push("/events")} variant="secondary" />
        <PrimaryButton label="Team oeffnen" onPress={() => router.push("/team")} variant="secondary" />
      </View>
      <Text style={[styles.note, { color: colors.mutedText }]}>
        Die Schnellaktionen sind Navigations- und UI-Platzhalter fuer die naechsten Funktionsschritte.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    gap: spacing.sm,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: fontSizes.sm,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  body: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  note: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
  },
});
