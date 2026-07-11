import type { TeamMember, TeamRole } from "@/types/team";

export function hasRole(
  member: Pick<TeamMember, "roles"> | null | undefined,
  role: TeamRole,
): boolean {
  return Boolean(member?.roles?.includes(role));
}
