import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import type { ElementRef } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  AppState,
  findNodeHandle,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AccountMenuSheet } from "@/components/account-menu-sheet";
import { AppHeader } from "@/components/app-header";
import { EventCard } from "@/components/event-card";
import { InlineFeedback } from "@/components/inline-feedback";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import {
  foundationRadius,
  foundationSizes,
  foundationSpacing,
  foundationTypography,
} from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useEvents } from "@/context/event-context";
import { useTeam } from "@/context/team-context";
import { useTheme } from "@/context/theme-context";
import type { EventResponseValue, TeamEventWithResponse } from "@/types/team";
import { formatLocalWeekRange, getEventsForLocalWeek } from "@/utils/event-dates";
import { hasRole } from "@/utils/roles";

function isEmailLike(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getGreetingName(
  profileName: string | null | undefined,
  metadata: Record<string, unknown> | undefined,
) {
  const candidates = [
    profileName,
    metadata?.display_name,
    metadata?.full_name,
    metadata?.name,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const trimmedCandidate = candidate.trim();
      if (trimmedCandidate && !isEmailLike(trimmedCandidate)) {
        return trimmedCandidate;
      }
    }
  }

  return "Teammitglied";
}

export default function HomeScreen() {
  const { foundationColors } = useTheme();
  const {
    isDemoMode,
    isLoading: isAuthLoading,
    leaveDemoMode,
    profile,
    session,
    signOut,
    user,
  } = useAuth();
  const {
    currentMembership,
    currentTeam,
    isLoading: isTeamLoading,
    selectTeam,
    teams,
  } = useTeam();
  const {
    clearMessages,
    errorMessage: eventErrorMessage,
    events,
    isLoading: isEventsLoading,
    refreshEvents,
    respondToEvent,
  } = useEvents();
  const router = useRouter();
  const menuButtonRef = useRef<ElementRef<typeof Pressable>>(null);
  const loadingDataKeyRef = useRef<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [menuVisible, setMenuVisible] = useState(false);
  const [loadedDataKey, setLoadedDataKey] = useState<string | null>(null);
  const [homeLoadError, setHomeLoadError] = useState("");
  const [responseErrors, setResponseErrors] = useState<Record<string, string>>({});
  const [responseSuccesses, setResponseSuccesses] = useState<Record<string, string>>({});
  const [pendingResponseEventIds, setPendingResponseEventIds] = useState<Set<string>>(
    () => new Set(),
  );
  const pendingResponseEventIdsRef = useRef(new Set<string>());

  const greetingName = getGreetingName(
    profile?.displayName,
    user?.user_metadata as Record<string, unknown> | undefined,
  );
  const dataKey = isDemoMode ? "demo" : currentTeam?.id ?? null;
  const homeEvents = useMemo(
    () =>
      events.filter((event) =>
        isDemoMode ? event.teamId === "demo-team" : event.teamId === currentTeam?.id,
      ),
    [currentTeam?.id, events, isDemoMode],
  );
  const weeklyEvents = useMemo(
    () => getEventsForLocalWeek(homeEvents, nowMs),
    [homeEvents, nowMs],
  );
  const weekLabel = useMemo(() => formatLocalWeekRange(new Date(nowMs)), [nowMs]);
  const canManageEvents =
    hasRole(currentMembership, "admin") || hasRole(currentMembership, "coach");
  const demoDataReady = isDemoMode && homeEvents.length > 0;
  const dataKeyReady =
    dataKey === null
      ? !isAuthLoading && !isTeamLoading
      : demoDataReady || loadedDataKey === dataKey;
  const showInitialLoading =
    homeEvents.length === 0 &&
    (!dataKeyReady || isEventsLoading || isAuthLoading || isTeamLoading);
  const showErrorWithoutData =
    !showInitialLoading && homeEvents.length === 0 && Boolean(homeLoadError);

  useFocusEffect(
    useCallback(() => {
      setNowMs(Date.now());
      const interval = setInterval(() => setNowMs(Date.now()), 30_000);
      return () => clearInterval(interval);
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        setNowMs(Date.now());
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const scheduleUpdate = (update: () => void) => {
      void Promise.resolve().then(() => {
        if (!cancelled) {
          update();
        }
      });
    };

    if (!dataKey) {
      loadingDataKeyRef.current = null;
      scheduleUpdate(() => {
        setLoadedDataKey(null);
        setHomeLoadError("");
      });
    } else if (isEventsLoading) {
      loadingDataKeyRef.current = dataKey;
      scheduleUpdate(() => setHomeLoadError(""));
    } else if (loadingDataKeyRef.current === dataKey) {
      loadingDataKeyRef.current = null;
      const completedLoadError = eventErrorMessage;
      scheduleUpdate(() => {
        setLoadedDataKey(dataKey);
        setHomeLoadError(completedLoadError);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [dataKey, eventErrorMessage, isEventsLoading]);

  function restoreMenuFocus() {
    setTimeout(() => {
      const reactTag = findNodeHandle(menuButtonRef.current);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }, 360);
  }

  function handleCloseMenu() {
    setMenuVisible(false);
    restoreMenuFocus();
  }

  function handleOpenProfile() {
    setMenuVisible(false);
    router.push("/settings");
  }

  async function handleRespond(event: TeamEventWithResponse, response: EventResponseValue) {
    if (pendingResponseEventIdsRef.current.has(event.id)) {
      return;
    }

    pendingResponseEventIdsRef.current.add(event.id);
    setPendingResponseEventIds((current) => new Set(current).add(event.id));
    setResponseErrors((current) => ({ ...current, [event.id]: "" }));
    setResponseSuccesses((current) => ({ ...current, [event.id]: "" }));
    try {
      await respondToEvent(event.id, response);
      setResponseSuccesses((current) => ({
        ...current,
        [event.id]: "Rückmeldung gespeichert.",
      }));
    } catch (error) {
      setResponseErrors((current) => ({
        ...current,
        [event.id]:
          error instanceof Error
            ? error.message
            : "Antwort konnte nicht gespeichert werden.",
      }));
      clearMessages();
      setNowMs(Date.now());
    } finally {
      pendingResponseEventIdsRef.current.delete(event.id);
      setPendingResponseEventIds((current) => {
        const next = new Set(current);
        next.delete(event.id);
        return next;
      });
    }
  }

  return (
    <ScreenContainer>
      <AppHeader
        rightAction={
          <Pressable
            accessibilityLabel="Menü öffnen"
            accessibilityRole="button"
            hitSlop={4}
            onPress={() => setMenuVisible(true)}
            ref={menuButtonRef}
            style={({ pressed }) => [
              styles.menuButton,
              {
                backgroundColor: foundationColors.surfaceSubtle,
                borderColor: foundationColors.border,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              color={foundationColors.text}
              name="menu"
              size={foundationSizes.navigationIcon}
            />
          </Pressable>
        }
        subtitle="Das steht diese Woche an."
        title={`Hallo, ${greetingName}`}
        variant="greeting"
      />

      <View style={styles.sectionHeader}>
        <View style={styles.sectionCopy}>
          <Text style={[styles.sectionTitle, { color: foundationColors.text }]}>
            Diese Woche
          </Text>
          <Text style={[styles.weekLabel, { color: foundationColors.mutedText }]}>
            {weekLabel}
          </Text>
        </View>
        {isEventsLoading && homeEvents.length > 0 ? (
          <View accessibilityLiveRegion="polite" style={styles.refreshIndicator}>
            <ActivityIndicator color={foundationColors.accent} size="small" />
            <Text style={[styles.refreshLabel, { color: foundationColors.mutedText }]}>
              Wird aktualisiert …
            </Text>
          </View>
        ) : null}
      </View>

      {showInitialLoading ? (
        <View
          accessibilityLabel="Termine werden geladen"
          accessibilityLiveRegion="polite"
          accessibilityState={{ busy: true }}
          accessible
          style={styles.cardList}
        >
          <EventCardSkeleton />
          <EventCardSkeleton />
        </View>
      ) : showErrorWithoutData ? (
        <InlineFeedback
          actionLabel="Erneut versuchen"
          message={homeLoadError}
          onAction={() => void refreshEvents()}
          tone="error"
        />
      ) : (
        <>
          {homeLoadError ? (
            <InlineFeedback
              actionLabel="Erneut versuchen"
              message={homeLoadError}
              onAction={() => void refreshEvents()}
              tone="warning"
            />
          ) : null}

          {weeklyEvents.length > 0 ? (
            <View style={styles.cardList}>
              {weeklyEvents.map((event) => (
                <EventCard
                  errorMessage={responseErrors[event.id]}
                  event={event}
                  key={event.id}
                  nowMs={nowMs}
                  onRespond={(response) => void handleRespond(event, response)}
                  responsesEnabled={!isDemoMode && Boolean(session)}
                  saving={pendingResponseEventIds.has(event.id)}
                  successMessage={responseSuccesses[event.id]}
                />
              ))}
            </View>
          ) : (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: foundationColors.surface,
                  borderColor: foundationColors.border,
                },
              ]}
            >
              <Text style={[styles.emptyTitle, { color: foundationColors.text }]}>
                Diese Woche steht nichts an.
              </Text>
              {canManageEvents ? (
                <PrimaryButton
                  label="Termin erstellen"
                  onPress={() => router.push("/events")}
                  size="compact"
                  variant="secondary"
                />
              ) : null}
            </View>
          )}
        </>
      )}

      {menuVisible ? (
        <AccountMenuSheet
          currentTeamId={currentTeam?.id}
          displayName={greetingName}
          hasSession={Boolean(session)}
          isDemoMode={isDemoMode}
          onLeaveDemoMode={leaveDemoMode}
          onOpenProfile={handleOpenProfile}
          onRequestClose={handleCloseMenu}
          onSelectTeam={selectTeam}
          onSignOut={signOut}
          teamName={currentTeam?.name}
          teams={teams}
          visible
        />
      ) : null}
    </ScreenContainer>
  );
}

function EventCardSkeleton() {
  const { foundationColors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.skeletonCard,
        {
          backgroundColor: foundationColors.surface,
          borderColor: foundationColors.border,
        },
      ]}
    >
      <View
        style={[
          styles.skeletonBadge,
          { backgroundColor: foundationColors.surfaceSubtle },
        ]}
      />
      <View
        style={[
          styles.skeletonTitle,
          { backgroundColor: foundationColors.surfaceSubtle },
        ]}
      />
      <View
        style={[
          styles.skeletonMeta,
          { backgroundColor: foundationColors.surfaceSubtle },
        ]}
      />
      <View style={styles.skeletonActions}>
        {[0, 1, 2].map((item) => (
          <View
            key={item}
            style={[
              styles.skeletonAction,
              { backgroundColor: foundationColors.surfaceSubtle },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    alignItems: "center",
    borderRadius: foundationRadius.full,
    borderWidth: 1,
    height: foundationSizes.minimumTouchTarget,
    justifyContent: "center",
    width: foundationSizes.minimumTouchTarget,
  },
  pressed: {
    opacity: 0.72,
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: foundationSpacing.space3,
    justifyContent: "space-between",
    marginTop: foundationSpacing.space2,
  },
  sectionCopy: {
    flex: 1,
    gap: foundationSpacing.space1,
  },
  sectionTitle: {
    ...foundationTypography.section,
  },
  weekLabel: {
    ...foundationTypography.caption,
    fontVariant: ["tabular-nums"],
  },
  refreshIndicator: {
    alignItems: "center",
    flexDirection: "row",
    gap: foundationSpacing.space1,
  },
  refreshLabel: {
    ...foundationTypography.caption,
  },
  cardList: {
    gap: foundationSpacing.space3,
  },
  emptyState: {
    borderRadius: foundationRadius.control,
    borderWidth: 1,
    gap: foundationSpacing.space3,
    padding: foundationSizes.cardPadding,
  },
  emptyTitle: {
    ...foundationTypography.body,
  },
  skeletonCard: {
    borderRadius: foundationRadius.control,
    borderWidth: 1,
    gap: foundationSpacing.space3,
    padding: foundationSizes.cardPadding,
  },
  skeletonBadge: {
    borderRadius: foundationRadius.small,
    height: 24,
    width: "28%",
  },
  skeletonTitle: {
    borderRadius: foundationRadius.small,
    height: 22,
    width: "72%",
  },
  skeletonMeta: {
    borderRadius: foundationRadius.small,
    height: 16,
    width: "58%",
  },
  skeletonActions: {
    flexDirection: "row",
    gap: foundationSpacing.space2,
  },
  skeletonAction: {
    borderRadius: foundationRadius.control,
    flex: 1,
    height: foundationSizes.minimumTouchTarget,
  },
});
