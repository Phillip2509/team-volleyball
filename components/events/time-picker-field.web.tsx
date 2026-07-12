import { useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  formatDisplayTime,
  parseTimeValue,
  type TimePickerFieldProps,
} from "./time-picker-field.shared";

export function TimePickerField({
  allowClear,
  emptyLabel = "Uhrzeit auswählen",
  fallbackTime = "19:00",
  helperText,
  label,
  onChange,
  style,
  value,
}: TimePickerFieldProps) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [webError, setWebError] = useState("");
  const [webTime, setWebTime] = useState(value || fallbackTime);

  function openPicker() {
    Keyboard.dismiss();
    setWebError("");
    setWebTime(value || fallbackTime);
    setIsOpen(true);
  }

  function applySelection() {
    const nextTime = webTime.trim();
    if (!parseTimeValue(nextTime)) {
      setWebError("Bitte gib eine Uhrzeit im Format HH:mm ein.");
      return;
    }
    onChange(nextTime);
    setIsOpen(false);
  }

  function clearSelection() {
    onChange("");
    setIsOpen(false);
  }

  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        accessibilityHint="Öffnet die Zeitauswahl."
        accessibilityLabel={`${label}: ${formatDisplayTime(value, emptyLabel)}`}
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [
          styles.selectField,
          {
            backgroundColor: colors.inputBackground,
            borderColor: pressed ? colors.primary : colors.border,
          },
        ]}
      >
        <Text style={[styles.selectValue, { color: value ? colors.text : colors.mutedText }]}>
          {formatDisplayTime(value, emptyLabel)}
        </Text>
        <Text style={[styles.selectIcon, { color: colors.primary }]}>Uhrzeit</Text>
      </Pressable>
      {helperText ? (
        <Text style={[styles.helperText, { color: colors.mutedText }]}>{helperText}</Text>
      ) : null}

      <Modal animationType="fade" onRequestClose={() => setIsOpen(false)} transparent visible={isOpen}>
        <View style={styles.backdrop}>
          <SafeAreaView style={styles.safeArea}>
            <View
              accessibilityLabel={`${label}. Zeitauswahl.`}
              accessibilityViewIsModal
              style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
              <TextInput
                accessibilityLabel={`${label} im Format Stunden Doppelpunkt Minuten`}
                onChangeText={(nextValue) => {
                  setWebError("");
                  setWebTime(nextValue);
                }}
                placeholder="HH:mm"
                placeholderTextColor={colors.mutedText}
                style={[
                  styles.webInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={webTime}
              />
              {webError ? <Text style={[styles.errorText, { color: colors.danger }]}>{webError}</Text> : null}
              <View style={styles.actions}>
                {allowClear ? (
                  <PrimaryButton label="Keine Uhrzeit" onPress={clearSelection} variant="secondary" />
                ) : null}
                <PrimaryButton label="Abbrechen" onPress={() => setIsOpen(false)} variant="secondary" />
                <PrimaryButton label="Übernehmen" onPress={applySelection} />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-end",
  },
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.56)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  errorText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  field: {
    gap: spacing.xs,
  },
  helperText: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  modalCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    maxHeight: "90%",
    maxWidth: 520,
    padding: spacing.xl,
    width: "100%",
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "900",
  },
  safeArea: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  selectField: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  selectIcon: {
    fontSize: fontSizes.xs,
    fontWeight: "900",
  },
  selectValue: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: "700",
  },
  webInput: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fontSizes.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
});
