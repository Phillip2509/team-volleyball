import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/auth";
import type { Team, TeamMember, TeamMembershipWithProfile, UpdateMemberRoleParams } from "@/types/team";

type TeamContextValue = {
  teams: Team[];
  currentTeam: Team | null;
  currentMembership: TeamMember | null;
  teamMembers: TeamMembershipWithProfile[];
  isLoading: boolean;
  isMembersLoading: boolean;
  updatingMemberId: string | null;
  errorMessage: string;
  successMessage: string;
  refreshTeams: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  selectTeam: (teamId: string) => Promise<void>;
  createTeam: (teamName: string) => Promise<Team>;
  joinTeamByCode: (joinCode: string) => Promise<Team>;
  clearMessages: () => void;
  updateMemberRole: (params: UpdateMemberRoleParams) => Promise<TeamMember>;
};

type TeamRow = {
  id: string;
  name: string;
  join_code: string;
  created_by: string;
  accent_color: string | null;
  created_at: string;
  updated_at: string;
};

type MembershipRow = {
  id: string;
  team_id: string;
  user_id: string;
  role: "player" | "coach" | "admin";
  joined_at: string;
};

type MembershipWithTeamRow = MembershipRow & {
  teams: TeamRow | TeamRow[] | null;
};

type MembershipWithProfileRow = MembershipRow & {
  profiles: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  } | {
    id: string;
    display_name: string;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  }[] | null;
};

const SELECTED_TEAM_KEY = "team-volleyball:selected-team";

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

function mapTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    joinCode: row.join_code,
    createdBy: row.created_by,
    accentColor: row.accent_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMembership(row: MembershipRow): TeamMember {
  return {
    id: row.id,
    teamId: row.team_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
  };
}

function mapProfile(row: MembershipWithProfileRow["profiles"]): Profile {
  const profileRow = Array.isArray(row) ? row[0] : row;
  return {
    id: profileRow?.id ?? "",
    displayName: profileRow?.display_name ?? "Unbekanntes Mitglied",
    avatarUrl: profileRow?.avatar_url ?? null,
    createdAt: profileRow?.created_at ?? "",
    updatedAt: profileRow?.updated_at ?? "",
  };
}

function normalizeRpcTeam(data: unknown): Team {
  return mapTeam(data as TeamRow);
}

function getTeamErrorMessage(message: string) {
  if (message.includes("ADMIN_REQUIRED")) {
    return "Nur Admins dürfen Rollen ändern.";
  }

  if (message.includes("MEMBER_NOT_FOUND")) {
    return "Das Mitglied wurde nicht gefunden.";
  }

  if (message.includes("INVALID_ROLE")) {
    return "Diese Rolle ist ungültig.";
  }

  if (message.includes("CANNOT_CHANGE_OWN_ROLE")) {
    return "Du kannst deine eigene Rolle hier nicht ändern.";
  }

  if (message.includes("LAST_ADMIN_REQUIRED")) {
    return "Dieses Team muss mindestens einen Admin behalten.";
  }

  if (message.includes("INVALID_JOIN_CODE")) {
    return "Der Einladungscode ist ungültig.";
  }

  if (message.includes("ALREADY_TEAM_MEMBER")) {
    return "Du bist bereits Mitglied in diesem Team.";
  }

  if (message.includes("PROFILE_MISSING")) {
    return "Dein Profil fehlt noch. Bitte richte zuerst dein Profil ein.";
  }

  if (message.includes("INVALID_TEAM_NAME")) {
    return "Der Teamname muss zwischen 2 und 80 Zeichen lang sein.";
  }

  if (message.includes("AUTH_REQUIRED")) {
    return "Bitte melde dich erneut an.";
  }

  if (message.toLowerCase().includes("permission")) {
    return "Du hast dafür keine Berechtigung.";
  }

  if (message.toLowerCase().includes("network")) {
    return "Netzwerkfehler. Bitte pruefe deine Verbindung.";
  }

  return "Die Team-Aktion ist fehlgeschlagen. Bitte versuche es erneut.";
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const { isDemoMode, session } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [memberships, setMemberships] = useState<TeamMember[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMembershipWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? teams[0] ?? null,
    [selectedTeamId, teams],
  );

  const currentMembership = useMemo(
    () =>
      currentTeam
        ? memberships.find((membership) => membership.teamId === currentTeam.id) ?? null
        : null,
    [currentTeam, memberships],
  );

  const refreshMembers = useCallback(async () => {
    if (!supabase || !session?.user || !currentTeam || isDemoMode) {
      setTeamMembers([]);
      return;
    }

    setIsMembersLoading(true);
    setErrorMessage("");
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, team_id, user_id, role, joined_at, profiles(id, display_name, avatar_url, created_at, updated_at)")
        .eq("team_id", currentTeam.id);

      if (error) {
        console.error("TEAM_MEMBERS_LOAD_ERROR", error);
        throw new Error("Teammitglieder konnten nicht geladen werden.");
      }

      const mappedMembers = ((data ?? []) as unknown as MembershipWithProfileRow[])
        .map((row) => ({
          ...mapMembership(row),
          profile: mapProfile(row.profiles),
        }))
        .sort((left, right) => {
          const roleOrder = { admin: 0, coach: 1, player: 2 };
          const roleDifference = roleOrder[left.role] - roleOrder[right.role];
          if (roleDifference !== 0) {
            return roleDifference;
          }
          return left.profile.displayName.localeCompare(right.profile.displayName, "de");
        });

      setTeamMembers(mappedMembers);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Teammitglieder konnten nicht geladen werden.";
      setErrorMessage(message);
    } finally {
      setIsMembersLoading(false);
    }
  }, [currentTeam, isDemoMode, session?.user]);

  const refreshTeams = useCallback(async () => {
    if (!supabase || !session?.user || isDemoMode) {
      setTeams([]);
      setMemberships([]);
      setSelectedTeamId(null);
      setTeamMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, team_id, user_id, role, joined_at, teams(id, name, join_code, created_by, accent_color, created_at, updated_at)")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("TEAMS_LOAD_ERROR", error);
        throw new Error("Teams konnten nicht geladen werden.");
      }

      const rows = (data ?? []) as unknown as MembershipWithTeamRow[];
      const nextTeams = rows
        .map((row) => (Array.isArray(row.teams) ? row.teams[0] : row.teams))
        .filter((team): team is TeamRow => Boolean(team))
        .map(mapTeam);
      const nextMemberships = rows.map(mapMembership);
      const storedTeamId = await AsyncStorage.getItem(SELECTED_TEAM_KEY);
      const nextSelectedTeam =
        nextTeams.find((team) => team.id === storedTeamId) ?? nextTeams[0] ?? null;

      setTeams(nextTeams);
      setMemberships(nextMemberships);
      setSelectedTeamId(nextSelectedTeam?.id ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Teams konnten nicht geladen werden.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, session?.user]);

  useEffect(() => {
    void refreshTeams();
  }, [refreshTeams]);

  useEffect(() => {
    void refreshMembers();
  }, [refreshMembers]);

  const value = useMemo<TeamContextValue>(
    () => ({
      teams,
      currentTeam,
      currentMembership,
      teamMembers,
      isLoading,
      isMembersLoading,
      updatingMemberId,
      errorMessage,
      successMessage,
      refreshTeams,
      refreshMembers,
      clearMessages: () => {
        setErrorMessage("");
        setSuccessMessage("");
      },
      selectTeam: async (teamId) => {
        setSelectedTeamId(teamId);
        await AsyncStorage.setItem(SELECTED_TEAM_KEY, teamId);
      },
      createTeam: async (teamName) => {
        if (!supabase || !session?.user || isDemoMode) {
          throw new Error("Supabase ist nicht konfiguriert oder du bist nicht angemeldet.");
        }

        const { data, error } = await supabase.rpc("create_team_with_admin_membership", {
          team_name: teamName,
        });

        if (error) {
          console.error("CREATE_TEAM_ERROR", error);
          throw new Error(getTeamErrorMessage(error.message));
        }

        const createdTeam = normalizeRpcTeam(data);
        await AsyncStorage.setItem(SELECTED_TEAM_KEY, createdTeam.id);
        setSelectedTeamId(createdTeam.id);
        await refreshTeams();
        return createdTeam;
      },
      joinTeamByCode: async (joinCode) => {
        if (!supabase || !session?.user || isDemoMode) {
          throw new Error("Supabase ist nicht konfiguriert oder du bist nicht angemeldet.");
        }

        const { data, error } = await supabase.rpc("join_team_by_code", {
          input_code: joinCode,
        });

        if (error) {
          console.error("JOIN_TEAM_ERROR", error);
          throw new Error(getTeamErrorMessage(error.message));
        }

        const joinedTeam = normalizeRpcTeam(data);
        await AsyncStorage.setItem(SELECTED_TEAM_KEY, joinedTeam.id);
        setSelectedTeamId(joinedTeam.id);
        await refreshTeams();
        return joinedTeam;
      },
      updateMemberRole: async ({ role, teamId, userId }) => {
        if (!supabase || !session?.user || isDemoMode) {
          throw new Error("Supabase ist nicht konfiguriert oder du bist nicht angemeldet.");
        }

        setUpdatingMemberId(userId);
        setErrorMessage("");
        setSuccessMessage("");

        try {
          const { data, error } = await supabase.rpc("update_team_member_role", {
            input_role: role,
            input_team_id: teamId,
            input_user_id: userId,
          });

          if (error) {
            console.error("UPDATE_MEMBER_ROLE_ERROR", error);
            throw new Error(getTeamErrorMessage(error.message));
          }

          const updatedMembership = mapMembership(data as MembershipRow);
          await refreshTeams();
          await refreshMembers();
          setSuccessMessage("Änderung erfolgreich.");
          return updatedMembership;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Die Rolle konnte nicht geändert werden.";
          setErrorMessage(message);
          throw new Error(message);
        } finally {
          setUpdatingMemberId(null);
        }
      },
    }),
    [
      currentMembership,
      currentTeam,
      errorMessage,
      isDemoMode,
      isLoading,
      isMembersLoading,
      refreshMembers,
      refreshTeams,
      session?.user,
      successMessage,
      teamMembers,
      teams,
      updatingMemberId,
    ],
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeam muss innerhalb des TeamProvider verwendet werden.");
  }
  return context;
}
