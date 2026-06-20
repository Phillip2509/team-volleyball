export function getTodayInputDate() {
  const now = new Date();
  return formatInputDate(now);
}

export function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatInputTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function parseLocalDateTime(dateValue: string, timeValue: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue.trim());

  if (!dateMatch || !timeMatch) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (month < 1 || month > 12 || day < 1 || day > 31 || hours > 23 || minutes > 59) {
    return null;
  }

  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes
  ) {
    return null;
  }

  return date;
}

export function toIsoFromLocalInput(dateValue: string, timeValue: string) {
  const date = parseLocalDateTime(dateValue, timeValue);
  return date ? date.toISOString() : null;
}

export function formatEventDateTime(isoValue: string) {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatEventTime(isoValue: string) {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function splitIsoToLocalInputs(isoValue: string | null) {
  if (!isoValue) {
    return { date: "", time: "" };
  }

  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return { date: "", time: "" };
  }

  return {
    date: formatInputDate(date),
    time: formatInputTime(date),
  };
}
