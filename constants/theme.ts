export type ResolvedTheme = "light" | "dark";

export type FoundationColors = {
  canvas: string;
  surface: string;
  surfaceSubtle: string;
  text: string;
  mutedText: string;
  border: string;
  accent: string;
  accentPressed: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
};

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

export const foundationSpacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space7: 32,
  space8: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
};

export const foundationRadius = {
  small: 8,
  control: 12,
  sheet: 16,
  full: 999,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
};

export const foundationTypography = {
  greeting: { fontSize: 28, lineHeight: 34, fontWeight: "700" as const },
  section: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const },
  cardTitle: { fontSize: 17, lineHeight: 22, fontWeight: "700" as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: "400" as const },
  label: { fontSize: 14, lineHeight: 19, fontWeight: "600" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const },
} as const;

export const foundationSizes = {
  minimumTouchTarget: 44,
  minimumInputHeight: 48,
  screenPadding: 16,
  cardPadding: 16,
  inlineIcon: 16,
  controlIcon: 20,
  navigationIcon: 24,
} as const;

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

export const lightFoundationColors: FoundationColors = {
  canvas: "#F6F8FB",
  surface: "#FFFFFF",
  surfaceSubtle: "#F1F5F9",
  text: "#0F172A",
  mutedText: "#5B6B80",
  border: "#DCE3ED",
  accent: "#047E9B",
  accentPressed: "#03677F",
  accentSoft: "#DDF7FC",
  success: "#0F6F4D",
  warning: "#89520D",
  danger: "#A93440",
  overlay: "#0F172A7A",
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

export const darkFoundationColors: FoundationColors = {
  canvas: "#0B1220",
  surface: "#121C2E",
  surfaceSubtle: "#17243A",
  text: "#F8FAFC",
  mutedText: "#A5B4C7",
  border: "#2B3A52",
  accent: "#27B9D2",
  accentPressed: "#1AA0B6",
  accentSoft: "#123947",
  success: "#62D49F",
  warning: "#F0B653",
  danger: "#F1868F",
  overlay: "#0000008F",
};
