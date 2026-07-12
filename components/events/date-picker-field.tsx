import { useMemo, useState } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Keyboard, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { fontSizes, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { formatInputDate, getTodayInputDate } from "@/utils/event-dates";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MIN_DAY_SIZE = 44;
const CALENDAR_WIDTH = MIN_DAY_SIZE * 7;

type CalendarDay = {
  date: Date;
  dateValue: string;
  isCurrentMonth: boolean;
};

function parseInputDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function getMonthDays(monthDate: Date): CalendarDay[] {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 12);
  const mondayBasedWeekday = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - mondayBasedWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      dateValue: formatInputDate(date),
      isCurrentMonth: date.getMonth() === monthDate.getMonth(),
    };
  });
}

function formatDisplayDate(value: string) {
  const date = parseInputDate(value);
  if (!date) {
    return "Datum auswählen";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function DatePickerField({
  helperText,
  label,
  maxSelections = 20,
  minDate,
  onChange,
  onMultiChange,
  selectionMode = "single",
  style,
  value,
  values,
}: {
  helperText?: string;
  label: string;
  maxSelections?: number;
  minDate?: string;
  onChange: (value: string) => void;
  onMultiChange?: (values: string[]) => void;
  selectionMode?: "single" | "multiple";
  style?: StyleProp<ViewStyle>;
  value: string;
  values?: string[];
}) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState(value || minDate || getTodayInputDate());
  const [pendingDates, setPendingDates] = useState<string[]>(values ?? []);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initialDate = parseInputDate(value || minDate || getTodayInputDate()) ?? new Date();
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1, 12);
  });
  const today = getTodayInputDate();

  function openPicker() {
    Keyboard.dismiss();
    const nextPendingDate = value || minDate || getTodayInputDate();
    const parsed = parseInputDate(nextPendingDate) ?? new Date();
    setPendingDate(nextPendingDate);
    setPendingDates([...(values ?? [])].sort());
    setVisibleMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1, 12));
    setIsOpen(true);
  }

  const days = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);

  function changeMonth(offset: number) {
    setVisibleMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1, 12),
    );
  }

  function applySelection() {
    if (selectionMode === "multiple") {
      onMultiChange?.([...pendingDates].sort());
      if (pendingDates[0]) {
        onChange(pendingDates[0]);
      }
    } else {
      onChange(pendingDate);
    }
    setIsOpen(false);
  }

  function togglePendingDate(dateValue: string) {
    if (selectionMode === "single") {
      setPendingDate(dateValue);
      return;
    }

    setPendingDates((currentDates) => {
      if (currentDates.includes(dateValue)) {
        return currentDates.filter((currentDate) => currentDate !== dateValue);
      }
      if (currentDates.length >= maxSelections) {
        return currentDates;
      }
      return [...currentDates, dateValue].sort();
    });
  }

  function getDayAccessibilityLabel(day: CalendarDay, isDisabled: boolean, isSelected: boolean, isToday: boolean) {
    const parts = [
      new Intl.DateTimeFormat("de-DE", {
        dateStyle: "full",
      }).format(day.date),
    ];

    if (isToday) {
      parts.push("heute");
    }
    if (isSelected) {
      parts.push("ausgewählt");
    }
    if (isDisabled) {
      parts.push("nicht auswählbar");
    }

    return parts.join(", ");
  }

  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        accessibilityHint="Öffnet die Kalenderauswahl."
        accessibilityLabel={`${label}: ${formatDisplayDate(value)}`}
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
          {formatDisplayDate(value)}
        </Text>
        <Text style={[styles.selectIcon, { color: colors.primary }]}>Kalender</Text>
      </Pressable>
      {helperText ? (
        <Text style={[styles.helperText, { color: colors.mutedText }]}>{helperText}</Text>
      ) : null}

      <Modal animationType="fade" onRequestClose={() => setIsOpen(false)} transparent visible={isOpen}>
        <View style={styles.backdrop}>
          <SafeAreaView style={styles.safeArea}>
          <View
            accessibilityLabel={`${label}. Kalenderauswahl.`}
            accessibilityViewIsModal
            style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
            <ScrollView contentContainerStyle={styles.calendarScrollContent} style={styles.calendarScroll}>
              <View style={styles.monthHeader}>
                <Pressable
                  accessibilityLabel="Vorherigen Monat anzeigen"
                  accessibilityRole="button"
                  hitSlop={6}
                  onPress={() => changeMonth(-1)}
                  style={[styles.monthButton, { backgroundColor: colors.inputBackground }]}
                >
                  <Text style={[styles.monthButtonText, { color: colors.text }]}>Zurück</Text>
                </Pressable>
                <Text style={[styles.monthTitle, { color: colors.text }]}>
                  {formatMonthTitle(visibleMonth)}
                </Text>
                <Pressable
                  accessibilityLabel="Nächsten Monat anzeigen"
                  accessibilityRole="button"
                  hitSlop={6}
                  onPress={() => changeMonth(1)}
                  style={[styles.monthButton, { backgroundColor: colors.inputBackground }]}
                >
                  <Text style={[styles.monthButtonText, { color: colors.text }]}>Weiter</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.calendarTable}>
                  <View style={styles.weekdayRow}>
                    {WEEKDAY_LABELS.map((weekday) => (
                      <Text key={weekday} style={[styles.weekday, { color: colors.mutedText }]}>
                        {weekday}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.calendarGrid}>
                {days.map((day) => {
                  const isDisabled = Boolean(minDate && day.dateValue < minDate);
                  const isSelected =
                    selectionMode === "multiple"
                      ? pendingDates.includes(day.dateValue)
                      : pendingDate === day.dateValue;
                  const isToday = today === day.dateValue;
                  return (
                        <Pressable
                          accessibilityLabel={getDayAccessibilityLabel(day, isDisabled, isSelected, isToday)}
                          accessibilityRole="button"
                          accessibilityState={{ disabled: isDisabled, selected: isSelected }}
                          disabled={isDisabled}
                          key={day.dateValue}
                          onPress={() => togglePendingDate(day.dateValue)}
                          style={[
                            styles.dayButton,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.inputBackground,
                              borderColor: isToday || isSelected ? colors.primary : colors.border,
                            },
                            !day.isCurrentMonth && styles.secondaryDay,
                            isDisabled && styles.disabled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              {
                                color: isSelected
                                  ? colors.onPrimary
                                  : isDisabled
                                    ? colors.mutedText
                                    : colors.text,
                              },
                            ]}
                          >
                            {day.date.getDate()}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            </ScrollView>
            {selectionMode === "multiple" ? (
              <Text style={[styles.helperText, { color: colors.mutedText }]}>
                {pendingDates.length} von {maxSelections} Terminen ausgewählt.
              </Text>
            ) : null}
            <View style={styles.actions}>
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
  safeArea: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: CALENDAR_WIDTH,
  },
  calendarTable: {
    width: CALENDAR_WIDTH,
  },
  calendarScroll: {
    flexShrink: 1,
  },
  calendarScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  dayButton: {
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    width: MIN_DAY_SIZE,
  },
  dayText: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.38,
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
  monthButton: {
    borderRadius: radius.sm,
    minHeight: 44,
    minWidth: 76,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  monthButtonText: {
    fontSize: fontSizes.xs,
    fontWeight: "900",
  },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  monthTitle: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "capitalize",
  },
  secondaryDay: {
    opacity: 0.58,
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
  weekday: {
    fontSize: fontSizes.xs,
    fontWeight: "900",
    textAlign: "center",
    width: MIN_DAY_SIZE,
  },
  weekdayRow: {
    flexDirection: "row",
    width: CALENDAR_WIDTH,
  },
});
