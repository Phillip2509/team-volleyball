import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider, useAuth } from "@/context/auth-context";
import { EventProvider } from "@/context/event-context";
import { TeamProvider, useTeam } from "@/context/team-context";
import { ThemeProvider, useTheme } from "@/context/theme-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <AuthProvider>
          <TeamProvider>
            <EventProvider>
              <RootNavigator />
            </EventProvider>
          </TeamProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { isConfigured, isDemoMode, isLoading, isProfileLoading, profile, session } = useAuth();
  const { teams, isLoading: isTeamLoading } = useTeam();
  const { colors } = useTheme();
  const hasCompleteProfile =
    Boolean(profile?.displayName.trim()) && profile?.displayName !== "Neues Mitglied";
  const canEnterApp = isDemoMode || (Boolean(session) && hasCompleteProfile && teams.length > 0);

  if (isLoading || isProfileLoading || (session && hasCompleteProfile && isTeamLoading)) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isConfigured && !isDemoMode}>
        <Stack.Screen name="setup" />
      </Stack.Protected>
      <Stack.Protected guard={isConfigured && !session && !isDemoMode}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session) && !isDemoMode && !hasCompleteProfile}>
        <Stack.Screen name="profile-setup" />
      </Stack.Protected>
      <Stack.Protected
        guard={Boolean(session) && !isDemoMode && hasCompleteProfile && teams.length === 0}
      >
        <Stack.Screen name="team-onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={canEnterApp}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
