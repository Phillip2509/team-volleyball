export type UserRole = "player" | "coach" | "admin";

export type AppUserProfile = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
};

export type Profile = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
