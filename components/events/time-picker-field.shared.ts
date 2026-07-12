import type { StyleProp, ViewStyle } from "react-native";

export type TimePickerFieldProps = {
  allowClear?: boolean;
  emptyLabel?: string;
  fallbackTime?: string;
  helperText?: string;
  label: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  value: string;
};

export function parseTimeValue(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    return null;
  }

  return { hour, minute };
}

export function timeToDate(value: string, fallbackTime: string) {
  const parsed = parseTimeValue(value) ?? parseTimeValue(fallbackTime) ?? { hour: 19, minute: 0 };
  const date = new Date();
  date.setHours(parsed.hour, parsed.minute, 0, 0);
  return date;
}

export function dateToTime(value: Date) {
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function formatDisplayTime(value: string, emptyLabel: string) {
  return parseTimeValue(value) ? `${value} Uhr` : emptyLabel;
}
