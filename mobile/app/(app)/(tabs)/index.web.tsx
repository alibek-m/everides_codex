import { Link } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { VehicleCard } from "../../../src/components/vehicle-card";
import { useApp } from "../../../src/providers/app-provider";
import { colors, radius, spacing } from "../../../src/theme/tokens";

function SearchField({
  label,
  value,
  wide = false
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.searchField, wide && styles.searchFieldWide]}>
      <Text style={styles.searchFieldLabel}>{label}</Text>
      <Text style={styles.searchFieldValue}>{value}</Text>
    </View>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionArrows}>
          <View style={styles.arrowButton}>
            <Text style={styles.arrowText}>‹</Text>
          </View>
          <View style={styles.arrowButton}>
            <Text style={styles.arrowText}>›</Text>
          </View>
        </View>
      </View>
      {children}
    </View>
  );
}

export default function WebSearchHomeScreen() {
  const { vehicles, favoriteIds, toggleFavorite } = useApp();
  const [type, setType] = useState<string>("All");

  const visibleVehicles = useMemo(() => {
    if (type === "All") {
      return vehicles;
    }

    return vehicles.filter((vehicle) =>
      vehicle.type ===
      (type === "E-Scooters"
        ? "ELECTRIC_SCOOTER"
        : type === "E-Bikes"
          ? "ELECTRIC_BIKE"
          : "ELECTRIC_MOPED")
    );
  }, [type, vehicles]);

  const featured = visibleVehicles.slice(0, 4);
  const scenic = visibleVehicles.slice(1, 5);
  const fast = visibleVehicles
    .filter((vehicle) => vehicle.type === "ELECTRIC_MOPED")
    .slice(0, 4);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1800&q=80"
        }}
        imageStyle={styles.heroImage}
        style={styles.hero}
      >
        <View style={styles.heroOverlay} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Ride reinvented</Text>
          <Text style={styles.heroSubtitle}>
            Book the right scooter, bike, or moped in Miami for hours, days, or a full weekend.
          </Text>
        </View>

        <View style={styles.heroSearch}>
          <SearchField label="Where" value="City, beach, airport, hotel" wide />
          <SearchField label="From" value="Add dates" />
          <SearchField label="Until" value="Add dates" />
          <Link href="/search/results" style={styles.searchCta}>
            <Text style={styles.searchCtaText}>Search</Text>
          </Link>
        </View>
      </ImageBackground>

      <View style={styles.filterRow}>
        {["All", "E-Scooters", "E-Bikes", "Mopeds", "Nearby"].map((label) => (
          <Pressable
            key={label}
            onPress={() => setType(label)}
            style={[
              styles.filterChip,
              type === label && styles.filterChipActive
            ]}
          >
            <Text
              style={[
                styles.filterText,
                type === label && styles.filterTextActive
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Section title="Popular rides around Miami Beach">
        <View style={styles.grid}>
          {featured.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              favorite={favoriteIds.includes(vehicle.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </View>
      </Section>

      <Section title="Long-range picks for Wynwood and Edgewater">
        <View style={styles.grid}>
          {scenic.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              favorite={favoriteIds.includes(vehicle.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </View>
      </Section>

      <Section title="Quick moped rentals when you need more speed">
        <View style={styles.grid}>
          {fast.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              favorite={favoriteIds.includes(vehicle.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FCFBF8"
  },
  content: {
    paddingHorizontal: 32,
    paddingBottom: 56,
    gap: 28
  },
  hero: {
    minHeight: 392,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "space-between",
    padding: 36
  },
  heroImage: {
    borderRadius: 24
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 28, 49, 0.36)"
  },
  heroCopy: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingTop: 18
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -2
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 20,
    fontWeight: "500"
  },
  heroSearch: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.98)",
    minHeight: 82,
    flexDirection: "row",
    alignItems: "stretch",
    alignSelf: "center",
    width: "86%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E3DDD5"
  },
  searchField: {
    minWidth: 190,
    paddingHorizontal: 18,
    paddingVertical: 14,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#ECE5DA",
    gap: 5
  },
  searchFieldWide: {
    flex: 1
  },
  searchFieldLabel: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  searchFieldValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "600"
  },
  searchCta: {
    minWidth: 120,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  searchCtaText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "800"
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12
  },
  filterChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#E4DDD2",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  filterChipActive: {
    backgroundColor: "#1B1821",
    borderColor: "#1B1821"
  },
  filterText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700"
  },
  filterTextActive: {
    color: colors.surface
  },
  section: {
    gap: 18
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.4
  },
  sectionArrows: {
    flexDirection: "row",
    gap: 10
  },
  arrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#E5DDD1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  arrowText: {
    color: colors.inkMuted,
    fontSize: 24,
    marginTop: -2
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18
  }
});
