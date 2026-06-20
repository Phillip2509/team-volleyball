import type { AttendanceResponse, EventType } from "@/types/models";

export function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

export function getEventTypeLabel(type: EventType) {
  const labels: Record<EventType, string> = {
    training: "Training",
    match: "Spiel",
    team: "Teamtermin",
  };
  return labels[type];
}

export function getAttendanceLabel(attendance: AttendanceResponse) {
  const labels: Record<AttendanceResponse, string> = {
    yes: "Zusage",
    maybe: "Vielleicht",
    no: "Absage",
    open: "Offen",
  };
  return labels[attendance];
}
