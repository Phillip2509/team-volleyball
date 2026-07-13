import type { TeamEventWithResponse } from "@/types/team";

export type EventPresentationState = "open" | "closed" | "past" | "cancelled" | "invalid";

export function getLocalWeekRange(referenceDate: Date) {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  const dayFromMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayFromMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

export function getEventsForLocalWeek(
  events: TeamEventWithResponse[],
  nowMs: number,
) {
  const { start, end } = getLocalWeekRange(new Date(nowMs));
  const startMs = start.getTime();
  const endMs = end.getTime();
  const current: TeamEventWithResponse[] = [];
  const past: TeamEventWithResponse[] = [];

  for (const event of events) {
    const eventStartMs = new Date(event.startsAt).getTime();
    if (Number.isNaN(eventStartMs) || eventStartMs < startMs || eventStartMs >= endMs) {
      continue;
    }

    if (eventStartMs >= nowMs) {
      current.push(event);
    } else {
      past.push(event);
    }
  }

  current.sort(
    (left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
  );
  past.sort(
    (left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime(),
  );

  return [...current, ...past];
}

export function formatLocalWeekRange(referenceDate: Date) {
  const { start, end } = getLocalWeekRange(referenceDate);
  const lastDay = new Date(end);
  lastDay.setDate(lastDay.getDate() - 1);

  const sameMonth = start.getMonth() === lastDay.getMonth();
  const sameYear = start.getFullYear() === lastDay.getFullYear();
  const dayAndMonth = new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
  });
  const fullDate = new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (sameMonth && sameYear) {
    return `${start.getDate()}.–${dayAndMonth.format(lastDay)}`;
  }
  if (sameYear) {
    return `${dayAndMonth.format(start)} – ${dayAndMonth.format(lastDay)}`;
  }
  return `${fullDate.format(start)} – ${fullDate.format(lastDay)}`;
}

export function getEventPresentationState(
  event: Pick<TeamEventWithResponse, "startsAt" | "responseDeadline" | "status">,
  nowMs: number,
): EventPresentationState {
  const startMs = new Date(event.startsAt).getTime();
  if (Number.isNaN(startMs)) {
    return "invalid";
  }
  if (event.status === "cancelled") {
    return "cancelled";
  }
  if (nowMs >= startMs) {
    return "past";
  }
  if (event.responseDeadline) {
    const deadlineMs = new Date(event.responseDeadline).getTime();
    if (!Number.isNaN(deadlineMs) && nowMs > deadlineMs) {
      return "closed";
    }
  }
  return "open";
}

export function formatEventDateLabel(isoValue: string) {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

export function formatEventTimeRange(startsAt: string, endsAt: string | null) {
  const startTime = formatEventTime(startsAt);
  const endTime = endsAt ? formatEventTime(endsAt) : "";
  if (!startTime) {
    return "";
  }
  return endTime ? `${startTime}–${endTime} Uhr` : `${startTime} Uhr`;
}

export function formatEventDeadline(isoValue: string) {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

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

export function formatResponseTimestamp(isoValue: string | null) {
  if (!isoValue) {
    return "";
  }

  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const valueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDifference = Math.round((today - valueDay) / 86_400_000);
  const time = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  if (dayDifference === 0) {
    return `Heute, ${time} Uhr`;
  }

  if (dayDifference === 1) {
    return `Gestern, ${time} Uhr`;
  }

  const dateLabel = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  return `${dateLabel}, ${time} Uhr`;
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
