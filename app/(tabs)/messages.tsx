import { StyleSheet, Text } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { ScreenContainer } from "@/components/screen-container";
import { SectionHeader } from "@/components/section-header";
import { fontSizes, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { demoAnnouncements, demoDataNotice } from "@/data/demo-data";

export default function MessagesScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow={demoDataNotice}
        title="Nachrichten"
        subtitle="Eine einfache Mitteilungsuebersicht. Noch kein Chat, kein Echtzeit-System und keine Push-Nachrichten."
      />
      <SectionHeader title="Mitteilungen" />
      {demoAnnouncements.length === 0 ? (
        <EmptyState title="Keine Mitteilungen" text="Spaeter erscheinen hier Teaminfos." />
      ) : (
        demoAnnouncements.map((announcement) => (
          <Card key={announcement.id}>
            <Text style={[styles.title, { color: colors.text }]}>{announcement.title}</Text>
            <Text style={[styles.body, { color: colors.mutedText }]}>{announcement.body}</Text>
            <Text style={[styles.meta, { color: colors.mutedText }]}>
              {announcement.author} · {announcement.createdAt}
            </Text>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  body: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  meta: {
    fontSize: fontSizes.xs,
    marginTop: spacing.md,
  },
});
