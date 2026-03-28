import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen, SectionHeader, Stat } from "../../../src/components/ui";
import { useApp } from "../../../src/providers/app-provider";
import { colors, radius, spacing } from "../../../src/theme/tokens";
import { formatCurrency } from "../../../src/utils/format";

function MoreListRow({
  icon,
  label,
  value,
  badge,
  onPress,
  last = false,
  destructive = false
}: {
  icon: string;
  label: string;
  value?: string;
  badge?: string;
  onPress?: () => void | Promise<void>;
  last?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, !last && styles.rowBorder]}
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
          {label}
        </Text>
      </View>

      <View style={styles.rowRight}>
        {badge ? <Text style={styles.rowBadge}>{badge}</Text> : null}
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

export default function MoreScreen() {
  const {
    isAuthenticated,
    profile,
    paymentMethods,
    earnings,
    createMockPaymentMethod,
    signOut
  } = useApp();

  if (!profile) {
    return null;
  }

  return (
    <Screen>
      <SectionHeader title="More" />

      <Pressable
        style={styles.profileCard}
        onPress={() =>
          router.push(isAuthenticated ? "/host/dashboard" : "/(auth)/sign-in")
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {isAuthenticated ? profile.firstName.slice(0, 1).toUpperCase() : "G"}
          </Text>
        </View>

        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>
            {isAuthenticated
              ? `${profile.firstName} ${profile.lastName}`
              : "Guest"}
          </Text>
          <Text style={styles.profileLink}>
            {isAuthenticated ? "View and edit profile" : "Sign in or create account"}
          </Text>
        </View>
      </Pressable>

      <Pressable style={styles.hostCard} onPress={() => router.push("/host/list")}>
        <View style={styles.hostContent}>
          <Text style={styles.hostTitle}>Become a host</Text>
          <Text style={styles.hostCopy}>
            Join the first wave of Eve Rides hosts and earn from your bike, scooter, or moped.
          </Text>
          <View style={styles.hostButton}>
            <Text style={styles.hostButtonText}>
              {isAuthenticated ? "List a vehicle" : "Learn more"}
            </Text>
          </View>
        </View>

        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"
          }}
          style={styles.hostImage}
        />
      </Pressable>

      {isAuthenticated ? (
        <View style={styles.statsCard}>
          <Stat label="This week" value={formatCurrency(earnings.weekToDate)} />
          <Stat label="Pending payout" value={formatCurrency(earnings.pendingPayout)} />
        </View>
      ) : null}

      <View style={styles.section}>
        <MoreListRow
          icon="◌"
          label={isAuthenticated ? "Account" : "Account access"}
          value={isAuthenticated ? "Profile" : "Sign in"}
          onPress={() =>
            router.push(isAuthenticated ? "/host/dashboard" : "/(auth)/sign-in")
          }
        />
        <MoreListRow
          icon="⌁"
          label="Host dashboard"
          value={isAuthenticated ? "Earnings and rides" : "Preview"}
          onPress={() => router.push("/host/dashboard")}
        />
        <MoreListRow
          icon="▣"
          label="Payment methods"
          value={
            paymentMethods.length > 0
              ? `${paymentMethods.length} mock ${paymentMethods.length === 1 ? "card" : "cards"}`
              : "Add one"
          }
          onPress={createMockPaymentMethod}
          last
        />
      </View>

      <View style={styles.section}>
        {!isAuthenticated ? (
          <MoreListRow
            icon="+"
            label="Create account"
            badge="New"
            onPress={() => router.push("/(auth)/sign-up")}
          />
        ) : null}
        <MoreListRow
          icon="★"
          label="Why choose Eve Rides"
          onPress={() => undefined}
        />
        <MoreListRow
          icon="?"
          label="Get help"
          onPress={() => undefined}
        />
        <MoreListRow
          icon="≡"
          label="Legal"
          onPress={() => undefined}
          last={isAuthenticated}
        />
        {isAuthenticated ? (
          <MoreListRow
            icon="↗"
            label="Log out"
            destructive
            onPress={async () => {
              await signOut();
              router.replace("/(app)/(tabs)/more");
            }}
            last
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: 2
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EDE9E2",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: colors.inkMuted,
    fontSize: 22,
    fontWeight: "700"
  },
  profileCopy: {
    gap: 2
  },
  profileName: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800"
  },
  profileLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700"
  },
  hostCard: {
    minHeight: 170,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E6DED4",
    flexDirection: "row"
  },
  hostContent: {
    flex: 1,
    padding: spacing.md,
    gap: 10,
    justifyContent: "space-between"
  },
  hostTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800"
  },
  hostCopy: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  hostButton: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  hostButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800"
  },
  hostImage: {
    width: 112,
    height: "100%"
  },
  statsCard: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E6DED4",
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md
  },
  section: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E6DED4",
    overflow: "hidden"
  },
  row: {
    minHeight: 58,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#ECE4D9"
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2EEE8"
  },
  iconText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700"
  },
  rowLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "600"
  },
  rowLabelDestructive: {
    color: colors.ink
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  rowValue: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  rowBadge: {
    color: colors.primary,
    backgroundColor: "#EFEAFF",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    fontSize: 11,
    fontWeight: "700"
  },
  chevron: {
    color: "#A89FB5",
    fontSize: 22,
    fontWeight: "400",
    marginTop: -2
  }
});
