import type { Session } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { supabase, supabaseConfig } from "@/lib/supabase";

type AuthContextValue = {
  session: Session | null;
  isConfigured: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  setupMessage: string;
  enterDemoMode: () => void;
  leaveDemoMode: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
      if (nextSession) {
        setIsDemoMode(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isConfigured: supabaseConfig.isConfigured,
      isDemoMode,
      isLoading,
      setupMessage: supabaseConfig.message,
      enterDemoMode: () => setIsDemoMode(true),
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
          throw new Error("Die Anmeldung ist fehlgeschlagen. Bitte pruefe deine Eingaben.");
        }
      },
      signUp: async (email, password) => {
        if (!supabase) {
          throw new Error(supabaseConfig.message);
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw new Error("Die Registrierung ist fehlgeschlagen. Bitte versuche es erneut.");
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
    }),
    [isDemoMode, isLoading, session],
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
