import type { Announcement, DemoTeam, TeamEvent, TeamMember } from "@/types/models";

export const demoDataNotice =
  "Lokale Demo-Daten. Noch keine Supabase-Anbindung.";

export const demoTeam: DemoTeam = {
  id: "demo-team",
  name: "Team Volleyball",
  season: "Saison 2026/27",
};

export const demoEvents: TeamEvent[] = [
  {
    id: "event-1",
    title: "Hallentraining",
    type: "training",
    date: "2026-06-23",
    time: "19:30",
    location: "Sporthalle Mitte",
    attendance: "yes",
  },
  {
    id: "event-2",
    title: "Testspiel",
    type: "match",
    date: "2026-06-27",
    time: "15:00",
    location: "Arena Nord",
    attendance: "open",
  },
  {
    id: "event-3",
    title: "Teamabend",
    type: "team",
    date: "2026-07-02",
    time: "20:00",
    location: "Clubraum",
    attendance: "maybe",
  },
];

export const demoTeamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "Max Mustermann",
    position: "Außenangriff",
    role: "Spieler",
    status: "aktiv",
  },
  {
    id: "member-2",
    name: "Luca Beispiel",
    position: "Zuspiel",
    role: "Spieler",
    status: "aktiv",
  },
  {
    id: "member-3",
    name: "Jonas Muster",
    position: "Mittelblock",
    role: "Spieler",
    status: "pausiert",
  },
  {
    id: "member-4",
    name: "Trainer Demo",
    position: "Coaching",
    role: "Trainer",
    status: "aktiv",
  },
];

export const demoAnnouncements: Announcement[] = [
  {
    id: "announcement-1",
    title: "Training am Dienstag",
    body: "Bitte bringt beide Trikotsätze mit. Wir testen Aufstellung und Annahmeformation.",
    author: "Demo Trainerteam",
    createdAt: "2026-06-20",
  },
  {
    id: "announcement-2",
    title: "Hallenzeit bestätigt",
    body: "Die Halle ist für die nächsten vier Wochen wie geplant reserviert.",
    author: "Demo Organisation",
    createdAt: "2026-06-18",
  },
];
