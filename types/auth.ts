export type UserRole = "player" | "coach" | "admin";

export type AppUserProfile = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
};
