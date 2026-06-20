import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { darkColors, lightColors, ResolvedTheme, ThemeColors } from "@/constants/theme";

const THEME_PREFERENCE_KEY = "team-volleyball-theme";

type ThemePreference = "system" | "light" | "dark";

type ThemeContextValue = {
  colors: ThemeColors;
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    let isMounted = true;
    void AsyncStorage.getItem(THEME_PREFERENCE_KEY).then((storedValue) => {
      if (
        isMounted &&
        (storedValue === "system" || storedValue === "light" || storedValue === "dark")
      ) {
        setPreferenceState(storedValue);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const systemTheme: ResolvedTheme = systemScheme === "dark" ? "dark" : "light";
  const resolvedTheme: ResolvedTheme =
    preference === "system" ? systemTheme : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: resolvedTheme === "dark" ? darkColors : lightColors,
      preference,
      resolvedTheme,
      systemTheme,
      setPreference: async (nextPreference) => {
        setPreferenceState(nextPreference);
        await AsyncStorage.setItem(THEME_PREFERENCE_KEY, nextPreference);
      },
    }),
    [preference, resolvedTheme, systemTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme muss innerhalb des ThemeProvider verwendet werden.");
  }
  return context;
}
