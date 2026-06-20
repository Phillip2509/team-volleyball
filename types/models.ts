export type AttendanceResponse = "yes" | "maybe" | "no" | "open";

export type DemoTeam = {
  id: string;
  name: string;
  season: string;
};

export type TeamMember = {
  id: string;
  name: string;
  position: string;
  role: "Spieler" | "Trainer" | "Co-Trainer";
  status: "aktiv" | "verletzt" | "pausiert";
};

export type EventType = "training" | "match" | "team";

export type TeamEvent = {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  attendance: AttendanceResponse;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
};
