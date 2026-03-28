import { Link, Tabs, usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../../src/theme/tokens";

function NavLink({
  href,
  label,
  active
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href as never}
      style={[
        styles.navLink,
        active && styles.navLinkActive
      ]}
    >
      <Text
        style={[
          styles.navLinkText,
          active && styles.navLinkTextActive
        ]}
      >
        {label}
      </Text>
    </Link>
  );
}

function UtilityPill({
  href,
  label,
  inverted = false
}: {
  href: string;
  label: string;
  inverted?: boolean;
}) {
  return (
    <Link
      href={href as never}
      style={[
        styles.utilityPill,
        inverted && styles.utilityPillInverted
      ]}
    >
      <Text
        style={[
          styles.utilityText,
          inverted && styles.utilityTextInverted
        ]}
      >
        {label}
      </Text>
    </Link>
  );
}

export default function WebTabsLayout() {
  const pathname = usePathname();

  return (
    <View style={styles.page}>
      <View style={styles.chrome}>
        <View style={styles.topBar}>
          <Link href="/(app)/(tabs)" style={styles.brand}>
            <Text style={styles.brandText}>EVE RIDES</Text>
          </Link>

          <View style={styles.utilityRow}>
            <UtilityPill href="/(app)/(tabs)/more" label="Why Eve Rides" />
            <UtilityPill href="/host/list" label="Become a host" inverted />
            <UtilityPill href="/(app)/(tabs)/more" label="Account" />
          </View>
        </View>

        <View style={styles.navBar}>
          <NavLink href="/(app)/(tabs)" label="Search" active={pathname === "/(app)/(tabs)" || pathname === "/"} />
          <NavLink href="/(app)/(tabs)/favorites" label="Favorites" active={pathname.includes("/favorites")} />
          <NavLink href="/(app)/(tabs)/trips" label="Trips" active={pathname.includes("/trips")} />
          <NavLink href="/(app)/(tabs)/inbox" label="Inbox" active={pathname.includes("/inbox")} />
          <NavLink href="/(app)/(tabs)/more" label="More" active={pathname.includes("/more")} />
        </View>
      </View>

      <View style={styles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              display: "none"
            },
            sceneStyle: {
              backgroundColor: colors.background
            }
          }}
        >
          <Tabs.Screen name="index" options={{ title: "Search" }} />
          <Tabs.Screen name="favorites" options={{ title: "Favorites" }} />
          <Tabs.Screen name="trips" options={{ title: "Trips" }} />
          <Tabs.Screen name="inbox" options={{ title: "Inbox" }} />
          <Tabs.Screen name="more" options={{ title: "More" }} />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FCFBF8"
  },
  chrome: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 12,
    gap: 16
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20
  },
  brand: {
    borderRadius: 14,
    backgroundColor: "#16141A",
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  brandText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.4
  },
  utilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  utilityPill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#E3DDD3",
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  utilityPillInverted: {
    backgroundColor: "#EFEAFF",
    borderColor: "#DDD7FF"
  },
  utilityText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700"
  },
  utilityTextInverted: {
    color: colors.primary
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  navLink: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  navLinkActive: {
    backgroundColor: "#1B1821"
  },
  navLinkText: {
    color: colors.inkMuted,
    fontSize: 14,
    fontWeight: "700"
  },
  navLinkTextActive: {
    color: colors.surface
  },
  content: {
    flex: 1
  }
});
