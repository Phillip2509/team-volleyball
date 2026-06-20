import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock, SupabaseClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function validateSupabaseConfig() {
  if (!supabaseUrl || !supabasePublishableKey) {
    return {
      isConfigured: false,
      message:
        "Supabase ist noch nicht konfiguriert. Lege eine lokale .env auf Basis von .env.example an.",
    };
  }

  try {
    const parsedUrl = new URL(supabaseUrl);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return {
        isConfigured: false,
        message: "Die Supabase URL muss mit https:// oder http:// beginnen.",
      };
    }
  } catch {
    return {
      isConfigured: false,
      message: "Die Supabase URL ist ungueltig.",
    };
  }

  if (supabasePublishableKey === "your_supabase_publishable_key") {
    return {
      isConfigured: false,
      message:
        "Der Supabase Publishable Key ist noch der Platzhalter aus .env.example.",
    };
  }

  return { isConfigured: true, message: "" };
}

export const supabaseConfig = validateSupabaseConfig();

export const supabase: SupabaseClient | null = supabaseConfig.isConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    })
  : null;

if (Platform.OS !== "web" && supabase) {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
