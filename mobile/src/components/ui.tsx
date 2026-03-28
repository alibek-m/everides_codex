import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, shadows, spacing, typography } from "../theme/tokens";

export function Screen({
  children,
  scroll = true
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  if (!scroll) {
    return <SafeAreaView style={styles.screen}>{children}</SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Hero({
  eyebrow,
  title,
  subtitle,
  children
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <LinearGradient
      colors={["#2E2AA5", "#504EF4", "#12B2A0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
      {children}
    </LinearGradient>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  href,
  back = false,
  backHref
}: {
  title: string;
  actionLabel?: string;
  href?: string;
  back?: boolean;
  backHref?: string;
}) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionTitleRow}>
        {back ? (
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }

              if (backHref) {
                router.replace(backHref as never);
              }
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>
        ) : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {actionLabel && href ? (
        <Link href={href as never} style={styles.sectionAction}>
          {actionLabel}
        </Link>
      ) : null}
    </View>
  );
}

export function Card({
  children,
  muted = false
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        muted && {
          backgroundColor: colors.surfaceSecondary
        }
      ]}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false
}: {
  label: string;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        disabled && {
          opacity: 0.5
        }
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress
}: {
  label: string;
  onPress?: () => void | Promise<void>;
}) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  active = false,
  onPress
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && {
          backgroundColor: colors.ink
        }
      ]}
    >
      <Text
        style={[
          styles.chipText,
          active && {
            color: colors.surface
          }
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  secureTextEntry = false,
  keyboardType
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

export function Stat({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  description,
  art,
  action
}: {
  title: string;
  description: string;
  art?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card muted>
      <View style={styles.emptyState}>
        {art}
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyDescription}>{description}</Text>
        {action}
      </View>
    </Card>
  );
}

export function MenuRow({
  label,
  value,
  onPress
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuValue}>{value ?? "Open"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 120,
    gap: spacing.md
  },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm
  },
  eyebrow: {
    color: "rgba(255,255,255,0.82)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "700"
  },
  heroTitle: {
    color: colors.surface,
    ...typography.display
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.88)",
    ...typography.body
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 1
  },
  sectionTitle: {
    color: colors.ink,
    ...typography.title
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center"
  },
  backButtonText: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "700",
    marginTop: -2
  },
  sectionAction: {
    color: colors.primary,
    fontWeight: "700"
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card
  },
  button: {
    minHeight: 54,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  buttonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "700"
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  secondaryButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700"
  },
  chip: {
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  chipText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700"
  },
  field: {
    gap: 8
  },
  fieldLabel: {
    color: colors.ink,
    ...typography.label
  },
  input: {
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    fontSize: 15
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: spacing.md,
    textAlignVertical: "top"
  },
  stat: {
    flex: 1,
    gap: 4
  },
  statValue: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800"
  },
  statLabel: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  emptyState: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg
  },
  emptyTitle: {
    color: colors.ink,
    ...typography.title,
    textAlign: "center"
  },
  emptyDescription: {
    color: colors.inkMuted,
    ...typography.body,
    textAlign: "center"
  },
  menuRow: {
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  menuLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700"
  },
  menuValue: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "700"
  }
});
