import type { Session, User } from "@supabase/supabase-js";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { supabase, supabaseConfig } from "@/lib/supabase";
import type { Profile } from "@/types/auth";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isConfigured: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  setupMessage: string;
  enterDemoMode: () => void;
  leaveDemoMode: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  verifyEmailOtp: (email: string, token: string) => Promise<void>;
  resendEmailOtp: (email: string) => Promise<void>;
  requestPasswordReset: (email: string, redirectTo: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  reloadProfile: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
};

type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeDisplayName(displayName: string) {
  return displayName.trim().replace(/\s+/g, " ");
}

function getAuthErrorMessage(errorMessage: string) {
  const message = errorMessage.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "E-Mail-Adresse oder Passwort ist falsch.";
  }

  if (message.includes("email not confirmed")) {
    return "Bitte bestätige zuerst deine E-Mail-Adresse mit dem Code aus der E-Mail.";
  }

  if (message.includes("already registered") || message.includes("already exists")) {
    return "Diese E-Mail-Adresse ist bereits registriert.";
  }

  if (message.includes("token") || message.includes("expired") || message.includes("otp")) {
    return "Der Code ist falsch oder abgelaufen. Bitte prüfe ihn oder fordere einen neuen Code an.";
  }

  if (message.includes("network")) {
    return "Netzwerkfehler. Bitte prüfe deine Verbindung.";
  }

  return "Die Aktion ist fehlgeschlagen. Bitte versuche es erneut.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [isProfileLoading, setIsProfileLoading] = useState(Boolean(supabase));

  const user = session?.user ?? null;

  const reloadProfile = useCallback(async () => {
    if (!supabase || !session?.user) {
      setProfile(null);
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, created_at, updated_at")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("PROFILE_LOAD_ERROR", error);
        throw new Error("Profil konnte nicht geladen werden.");
      }

      setProfile(data ? mapProfile(data as ProfileRow) : null);
    } finally {
      setIsProfileLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      setIsProfileLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("SESSION_RESTORE_ERROR", error);
        setSession(null);
        setIsProfileLoading(false);
      } else {
        setSession(data.session);
        if (!data.session) {
          setIsProfileLoading(false);
        }
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsDemoMode(false);
      }
      setSession(nextSession);
      setIsLoading(false);
      if (nextSession) {
        setIsDemoMode(false);
        setIsProfileLoading(true);
      } else {
        setProfile(null);
        setIsProfileLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user && !isDemoMode) {
      void reloadProfile().catch((error) => {
        console.error("PROFILE_RELOAD_ERROR", error);
        setProfile(null);
      });
      return;
    }

    setProfile(null);
    setIsProfileLoading(false);
  }, [isDemoMode, reloadProfile, session?.user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      isConfigured: supabaseConfig.isConfigured,
      isDemoMode,
      isLoading,
      isProfileLoading,
      setupMessage: supabaseConfig.message,
      enterDemoMode: () => {
        setIsDemoMode(true);
        setSession(null);
        setProfile(null);
        setIsProfileLoading(false);
      },
      leaveDemoMode: () => setIsDemoMode(false),
      signIn: async (email, password) => {
        if (!supabase) {
          throw new Error(supabaseConfig.message);
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw new Error(getAuthErrorMessage(error.message));
        }
      },
      signUp: async (email, password, displayName) => {
        if (!supabase) {
          throw new Error(supabaseConfig.message);
        }

        const normalizedName = normalizeDisplayName(displayName);
        if (normalizedName.length < 2 || normalizedName.length > 50) {
          throw new Error("Der Anzeigename muss zwischen 2 und 50 Zeichen lang sein.");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: normalizedName,
            },
          },
        });

        if (error) {
          throw new Error(getAuthErrorMessage(error.message));
        }
      },
      verifyEmailOtp: async (email, token) => {
        if (!supabase) {
          throw new Error(supabaseConfig.message);
        }

        const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });

        if (error) {
          throw new Error(getAuthErrorMessage(error.message));
        }
      },
      resendEmailOtp: async (email) => {
        if (!supabase) {
          throw new Error(supabaseConfig.message);
        }

        const { error } = await supabase.auth.resend({
          email,
          type: "signup",
        });

        if (error) {
          throw new Error(getAuthErrorMessage(error.message));
        }
      },
      requestPasswordReset: async (email, redirectTo) => {
        if (!supabase) {
          throw new Error(supabaseConfig.message);
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });

        if (error) {
          throw new Error(getAuthErrorMessage(error.message));
        }
      },
      updatePassword: async (password) => {
        if (!supabase) {
          throw new Error(supabaseConfig.message);
        }

        const { error } = await supabase.auth.updateUser({
          password,
        });

        if (error) {
          throw new Error(getAuthErrorMessage(error.message));
        }
      },
      signOut: async () => {
        if (!supabase) {
          setIsDemoMode(false);
          return;
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
          throw new Error("Die Abmeldung ist fehlgeschlagen. Bitte versuche es erneut.");
        }
      },
      reloadProfile,
      updateProfile: async (displayName) => {
        if (!supabase || !session?.user) {
          throw new Error("Supabase ist nicht konfiguriert oder du bist nicht angemeldet.");
        }

        const normalizedName = normalizeDisplayName(displayName);
        if (normalizedName.length < 2 || normalizedName.length > 50) {
          throw new Error("Der Anzeigename muss zwischen 2 und 50 Zeichen lang sein.");
        }

        const { error } = await supabase.rpc("upsert_own_profile", {
          input_display_name: normalizedName,
        });

        if (error) {
          console.error("PROFILE_UPDATE_ERROR", error);
          throw new Error("Profil konnte nicht gespeichert werden.");
        }

        await reloadProfile();
      },
    }),
    [isDemoMode, isLoading, isProfileLoading, profile, reloadProfile, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth muss innerhalb des AuthProvider verwendet werden.");
  }
  return context;
}
