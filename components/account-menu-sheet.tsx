import { Ionicons } from "@expo/vector-icons";
import type { ElementRef } from "react";
import { useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  findNodeHandle,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { InlineFeedback } from "@/components/inline-feedback";
import {
  foundationRadius,
  foundationSizes,
  foundationSpacing,
  foundationTypography,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import type { Team } from "@/types/team";

export function AccountMenuSheet({
  visible,
  displayName,
  teamName,
  teams,
  currentTeamId,
  hasSession,
  isDemoMode,
  onRequestClose,
  onOpenProfile,
  onSelectTeam,
  onSignOut,
  onLeaveDemoMode,
}: {
  visible: boolean;
  displayName: string;
  teamName?: string;
  teams: Team[];
  currentTeamId?: string;
  hasSession: boolean;
  isDemoMode: boolean;
  onRequestClose: () => void;
  onOpenProfile: () => void;
  onSelectTeam: (teamId: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onLeaveDemoMode: () => void;
}) {
  const { foundationColors } = useTheme();
  const closeButtonRef = useRef<ElementRef<typeof Pressable>>(null);
  const pendingActionRef = useRef<string | null>(null);
  const [translateX] = useState(() => new Animated.Value(48));
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  function handleShow() {
    requestAnimationFrame(() => {
      const reactTag = findNodeHandle(closeButtonRef.current);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    });

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotionEnabled) => {
        translateX.setValue(reduceMotionEnabled ? 0 : 48);
        Animated.timing(translateX, {
          duration: reduceMotionEnabled ? 0 : 180,
          toValue: 0,
          useNativeDriver: true,
        }).start();
      })
      .catch(() => {
        translateX.setValue(48);
        Animated.timing(translateX, {
          duration: 180,
          toValue: 0,
          useNativeDriver: true,
        }).start();
      });
  }

  async function runAction(actionId: string, action: () => Promise<void>) {
    if (pendingActionRef.current) {
      return;
    }

    pendingActionRef.current = actionId;
    setPendingAction(actionId);
    setErrorMessage("");
    try {
      await action();
      onRequestClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Die Aktion konnte nicht ausgeführt werden.",
      );
    } finally {
      pendingActionRef.current = null;
      setPendingAction(null);
    }
  }

  return (
    <Modal
      animationType="none"
      onShow={handleShow}
      onRequestClose={onRequestClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Menü schließen"
          accessibilityRole="button"
          onPress={onRequestClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: foundationColors.overlay }]}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: foundationColors.surface,
              borderColor: foundationColors.border,
              transform: [{ translateX }],
            },
          ]}
        >
          <SafeAreaView edges={["top", "right", "bottom"]} style={styles.safeArea}>
            <View style={styles.headerRow}>
              <View style={styles.profileCopy}>
                <Text style={[styles.name, { color: foundationColors.text }]}>{displayName}</Text>
                <Text style={[styles.teamName, { color: foundationColors.mutedText }]}>
                  {teamName ?? (isDemoMode ? "Demo-Modus" : "Kein Team ausgewählt")}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Menü schließen"
                accessibilityRole="button"
                hitSlop={4}
                onPress={onRequestClose}
                ref={closeButtonRef}
                style={({ pressed }) => [
                  styles.iconButton,
                  {
                    backgroundColor: foundationColors.surfaceSubtle,
                    borderColor: foundationColors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  color={foundationColors.text}
                  name="close"
                  size={foundationSizes.navigationIcon}
                />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
            >
              <View style={styles.menuSection}>
                <MenuRow
                  icon="person-circle-outline"
                  label="Profil & Account"
                  onPress={onOpenProfile}
                />
              </View>

              {teams.length > 1 ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: foundationColors.mutedText }]}>
                    Team wechseln
                  </Text>
                  <View style={styles.menuSection}>
                    {teams.map((team) => {
                      const isSelected = team.id === currentTeamId;
                      return (
                        <MenuRow
                          disabled={pendingAction !== null}
                          icon={isSelected ? "checkmark-circle" : "ellipse-outline"}
                          key={team.id}
                          label={team.name}
                          onPress={() =>
                            void runAction(`team-${team.id}`, () => onSelectTeam(team.id))
                          }
                          selected={isSelected}
                        />
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {errorMessage ? <InlineFeedback message={errorMessage} tone="error" /> : null}
            </ScrollView>

            <View style={[styles.footer, { borderColor: foundationColors.border }]}>
              {isDemoMode ? (
                <MenuRow
                  destructive
                  disabled={pendingAction !== null}
                  icon="exit-outline"
                  label="Demo-Modus verlassen"
                  onPress={() => {
                    onLeaveDemoMode();
                    onRequestClose();
                  }}
                />
              ) : hasSession ? (
                <MenuRow
                  destructive
                  disabled={pendingAction !== null}
                  icon="log-out-outline"
                  label={pendingAction === "sign-out" ? "Wird abgemeldet …" : "Abmelden"}
                  onPress={() => void runAction("sign-out", onSignOut)}
                />
              ) : null}
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  selected = false,
  destructive = false,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  selected?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const { foundationColors } = useTheme();
  const color = destructive
    ? foundationColors.danger
    : selected
      ? foundationColors.accent
      : foundationColors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        { borderColor: foundationColors.border },
        pressed && !disabled && { backgroundColor: foundationColors.surfaceSubtle },
        disabled && styles.disabled,
      ]}
    >
      <Ionicons color={color} name={icon} size={foundationSizes.controlIcon} />
      <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      {!destructive ? (
        <Ionicons
          color={foundationColors.mutedText}
          name="chevron-forward"
          size={foundationSizes.inlineIcon}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sheet: {
    borderLeftWidth: 1,
    borderBottomLeftRadius: foundationRadius.sheet,
    borderTopLeftRadius: foundationRadius.sheet,
    maxWidth: 360,
    overflow: "hidden",
    width: "88%",
  },
  safeArea: {
    flex: 1,
    gap: foundationSpacing.space6,
    paddingHorizontal: foundationSpacing.space4,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: foundationSpacing.space3,
    justifyContent: "space-between",
    paddingTop: foundationSpacing.space2,
  },
  profileCopy: {
    flex: 1,
    gap: foundationSpacing.space1,
    minWidth: 0,
  },
  name: {
    ...foundationTypography.section,
  },
  teamName: {
    ...foundationTypography.body,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: foundationRadius.full,
    borderWidth: 1,
    height: foundationSizes.minimumTouchTarget,
    justifyContent: "center",
    width: foundationSizes.minimumTouchTarget,
  },
  section: {
    gap: foundationSpacing.space2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: foundationSpacing.space6,
  },
  sectionLabel: {
    ...foundationTypography.caption,
    textTransform: "uppercase",
  },
  menuSection: {
    borderRadius: foundationRadius.control,
    overflow: "hidden",
  },
  menuRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: foundationSpacing.space3,
    minHeight: foundationSizes.minimumTouchTarget,
    paddingHorizontal: foundationSpacing.space3,
    paddingVertical: foundationSpacing.space2,
  },
  menuLabel: {
    ...foundationTypography.label,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    marginTop: "auto",
    paddingBottom: foundationSpacing.space3,
    paddingTop: foundationSpacing.space3,
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.55,
  },
});
