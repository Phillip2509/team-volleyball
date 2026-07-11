import type { Profile } from "@/types/auth";

export type TeamRole = "player" | "coach" | "admin";

export type Team = {
  id: string;
  name: string;
  joinCode: string;
  createdBy: string;
  accentColor: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamMember = {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  roles: TeamRole[];
  joinedAt: string;
};

export type TeamMembershipWithProfile = TeamMember & {
  profile: Profile;
};

export type TeamEventType = "training" | "match" | "team_event";

export type TeamEventStatus = "scheduled" | "cancelled";

export type EventResponseValue = "accepted" | "maybe" | "declined";

export type TeamEvent = {
  id: string;
  teamId: string;
  createdBy: string;
  eventType: TeamEventType;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  responseDeadline: string | null;
  status: TeamEventStatus;
  createdAt: string;
  updatedAt: string;
};

export type EventResponse = {
  id: string;
  eventId: string;
  userId: string;
  response: EventResponseValue;
  note: string | null;
  respondedAt: string;
  updatedAt: string;
};

export type EventResponseSummary = {
  accepted: number;
  maybe: number;
  declined: number;
  open: number;
};

export type TeamEventWithResponse = TeamEvent & {
  ownResponse: EventResponse | null;
  responses: EventResponse[];
  summary: EventResponseSummary;
};

export type EventResponseWithProfile = EventResponse & {
  profile: Profile;
  role: TeamRole;
};

export type TeamEventInput = {
  eventType: TeamEventType;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  responseDeadlineDate: string;
  responseDeadlineTime: string;
};

export type SaveTeamEventParams = {
  eventId?: string;
  teamId: string;
  input: TeamEventInput;
};
