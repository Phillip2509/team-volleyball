import type { AttendanceResponse, EventType } from "@/types/models";
import type { TeamRole } from "@/types/team";

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

export function getTeamRoleLabel(role: TeamRole) {
  const labels: Record<TeamRole, string> = {
    admin: "Admin",
    coach: "Trainer",
    player: "Spieler",
  };
  return labels[role];
}

export function formatDateTime(dateTime: string) {
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
