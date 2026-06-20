import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";

import { useTheme } from "@/context/theme-context";

type TabIconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: TabIconName) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons color={String(color)} name={name} size={size} />;
  }

  return TabIcon;
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Start", tabBarIcon: tabIcon("home-outline") }}
      />
      <Tabs.Screen
        name="events"
        options={{ title: "Termine", tabBarIcon: tabIcon("calendar-outline") }}
      />
      <Tabs.Screen
        name="team"
        options={{ title: "Team", tabBarIcon: tabIcon("people-outline") }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: "Nachrichten", tabBarIcon: tabIcon("chatbubbles-outline") }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Einstellungen", tabBarIcon: tabIcon("settings-outline") }}
      />
    </Tabs>
  );
}
