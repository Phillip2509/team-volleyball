import { Pressable, StyleSheet, Text } from "react-native";

import { fontSizes, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const { colors } = useTheme();
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isSecondary ? colors.inputBackground : colors.primary,
          borderColor: isSecondary ? colors.border : colors.primary,
        },
        pressed && !disabled && {
          backgroundColor: isSecondary ? colors.primarySoft : colors.primaryPressed,
        },
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, { color: isSecondary ? colors.text : colors.onPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
});
