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
  joinedAt: string;
};

export type TeamMembershipWithProfile = TeamMember & {
  profile: Profile;
};
