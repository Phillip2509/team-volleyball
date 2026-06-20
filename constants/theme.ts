export type ResolvedTheme = "light" | "dark";

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  onPrimary: string;
  inputBackground: string;
  shadow: string;
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
};

export const shadows = {
  card: {
    elevation: 3,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
};

export const lightColors: ThemeColors = {
  background: "#F6F8FB",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  text: "#0F172A",
  mutedText: "#64748B",
  border: "#DCE3ED",
  primary: "#047E9B",
  primaryPressed: "#03677F",
  primarySoft: "#DDF7FC",
  success: "#16815B",
  successSoft: "#E2F7EC",
  warning: "#A56612",
  warningSoft: "#FFF2D9",
  danger: "#C2414B",
  dangerSoft: "#FBE7EA",
  onPrimary: "#FFFFFF",
  inputBackground: "#F1F5F9",
  shadow: "#0F172A",
};

export const darkColors: ThemeColors = {
  background: "#0B1220",
  surface: "#121C2E",
  surfaceElevated: "#17243A",
  text: "#F8FAFC",
  mutedText: "#A5B4C7",
  border: "#2B3A52",
  primary: "#27B9D2",
  primaryPressed: "#1AA0B6",
  primarySoft: "#123947",
  success: "#62D49F",
  successSoft: "#143A2C",
  warning: "#F0B653",
  warningSoft: "#3B2A12",
  danger: "#F1868F",
  dangerSoft: "#3C1D25",
  onPrimary: "#06141A",
  inputBackground: "#17243A",
  shadow: "#000000",
};
