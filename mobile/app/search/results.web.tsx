import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { MapPanel } from "../../src/components/map-panel";
import { VehicleCard } from "../../src/components/vehicle-card";
import { colors, radius, spacing } from "../../src/theme/tokens";
import { useApp } from "../../src/providers/app-provider";

const typeFilters = [
  ["All", "All"],
  ["E-Scooters", "ELECTRIC_SCOOTER"],
  ["E-Bikes", "ELECTRIC_BIKE"],
  ["Mopeds", "ELECTRIC_MOPED"]
] as const;

const sorts = ["RELEVANCE", "PRICE", "DISTANCE", "RATING"] as const;

export default function WebSearchResultsScreen() {
  const { query = "" } = useLocalSearchParams<{ query?: string }>();
  const { vehicles, favoriteIds, toggleFavorite } = useApp();
  const [type, setType] = useState<(typeof typeFilters)[number][1]>("All");
  const [sortBy, setSortBy] = useState<(typeof sorts)[number]>("RELEVANCE");

  const results = useMemo(() => {
    let items = vehicles.filter((vehicle) =>
      [vehicle.title, vehicle.make, vehicle.model, vehicle.location.neighborhood]
        .join(" ")
        .toLowerCase()
        .includes(String(query).toLowerCase())
    );

    if (type !== "All") {
      items = items.filter((vehicle) => vehicle.type === type);
    }

    if (sortBy === "PRICE") {
      items = [...items].sort((left, right) => left.pricing.pricePerDay - right.pricing.pricePerDay);
    } else if (sortBy === "DISTANCE") {
      items = [...items].sort((left, right) => left.distanceMiles - right.distanceMiles);
    } else if (sortBy === "RATING") {
      items = [...items].sort((left, right) => right.rating - left.rating);
    }

    return items;
  }, [query, vehicles, type, sortBy]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View style={styles.topCopy}>
          <Text style={styles.overline}>Search results</Text>
          <Text style={styles.title}>Available rides around Miami</Text>
          <Text style={styles.subtitle}>
            {results.length} vehicles matched your filters
            {query ? ` for "${query}"` : ""}.
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Flexible pickup</Text>
          <Text style={styles.summaryValue}>Today to next week</Text>
        </View>
      </View>

      <View style={styles.chipRow}>
        {typeFilters.map(([label, value]) => (
          <Pressable
            key={value}
            onPress={() => setType(value)}
            style={[styles.chip, type === value && styles.chipActive]}
          >
            <Text style={[styles.chipText, type === value && styles.chipTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.chipRow}>
        {sorts.map((value) => (
          <Pressable
            key={value}
            onPress={() => setSortBy(value)}
            style={[styles.sortChip, sortBy === value && styles.sortChipActive]}
          >
            <Text style={[styles.sortText, sortBy === value && styles.sortTextActive]}>
              {value === "RELEVANCE" ? "Relevance" : value}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.layout}>
        <View style={styles.resultsColumn}>
          <View style={styles.resultsGrid}>
            {results.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                favorite={favoriteIds.includes(vehicle.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </View>
        </View>

        <View style={styles.mapColumn}>
          <View style={styles.mapSticky}>
            <MapPanel vehicles={results} title="Miami map view" />
          </View>
        </View>
      </View>
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
    gap: 18
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start"
  },
  topCopy: {
    gap: 8,
    flex: 1
  },
  overline: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  title: {
    color: colors.ink,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.5
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500"
  },
  summaryBox: {
    minWidth: 220,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#E6DED3",
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: 4
  },
  summaryLabel: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  summaryValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800"
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#E3DCD1",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  chipActive: {
    backgroundColor: "#1A1820",
    borderColor: "#1A1820"
  },
  chipText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700"
  },
  chipTextActive: {
    color: colors.surface
  },
  sortChip: {
    borderRadius: radius.pill,
    backgroundColor: "#F1ECE5",
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  sortChipActive: {
    backgroundColor: "#E8E9FF"
  },
  sortText: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  sortTextActive: {
    color: colors.primary
  },
  layout: {
    flexDirection: "row",
    gap: 22,
    alignItems: "flex-start"
  },
  resultsColumn: {
    flex: 1
  },
  resultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18
  },
  mapColumn: {
    width: 360
  },
  mapSticky: {
    position: "sticky" as never,
    top: 24
  }
});
