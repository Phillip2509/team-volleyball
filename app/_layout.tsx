import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider, useAuth } from "@/context/auth-context";
import { ThemeProvider, useTheme } from "@/context/theme-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { isConfigured, isDemoMode, isLoading, session } = useAuth();
  const { colors } = useTheme();
  const canEnterApp = Boolean(session) || isDemoMode;

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isConfigured && !canEnterApp}>
        <Stack.Screen name="setup" />
      </Stack.Protected>
      <Stack.Protected guard={isConfigured && !canEnterApp}>
        <Stack.Screen name="login" />
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
