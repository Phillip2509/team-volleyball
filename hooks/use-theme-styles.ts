import { useMemo } from "react";

import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export function useThemeStyles<T>(factory: (colors: ThemeColors) => T) {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
