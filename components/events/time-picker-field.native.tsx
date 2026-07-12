import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  dateToTime,
  formatDisplayTime,
  timeToDate,
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
  const { colors, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingTime, setPendingTime] = useState(value || fallbackTime);

  function openPicker() {
    Keyboard.dismiss();
    setPendingTime(value || fallbackTime);
    setIsOpen(true);
  }

  function applySelection() {
    onChange(pendingTime);
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
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <DateTimePicker
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  is24Hour
                  locale="de-DE"
                  minuteInterval={5}
                  mode="time"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      setPendingTime(dateToTime(selectedDate));
                    }
                  }}
                  themeVariant={resolvedTheme}
                  value={timeToDate(pendingTime, fallbackTime)}
                />
              </View>
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
  pickerContainer: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
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
});
