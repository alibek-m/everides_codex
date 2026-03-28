import { Link } from "expo-router";
import { useDeferredValue, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { VehicleCard } from "../../../src/components/vehicle-card";
import { Card, Chip, Screen, SectionHeader } from "../../../src/components/ui";
import { useApp } from "../../../src/providers/app-provider";
import { colors, radius, spacing } from "../../../src/theme/tokens";

export default function SearchHomeScreen() {
  const { vehicles, favoriteIds, toggleFavorite } = useApp();
  const [type, setType] = useState<string>("All");
  const query = useDeferredValue(type);

  const visibleVehicles =
    query === "All"
      ? vehicles
      : vehicles.filter((vehicle) =>
          vehicle.type ===
          (query === "E-Scooters"
            ? "ELECTRIC_SCOOTER"
            : query === "E-Bikes"
              ? "ELECTRIC_BIKE"
              : "ELECTRIC_MOPED")
        );

  return (
    <Screen>
      <Card muted>
        <Text style={styles.searchLabel}>Search Miami</Text>
        <Text style={styles.searchMeta}>Tonight • Flexible pickup • South Beach to Brickell</Text>
        <Link href="/search/results" asChild>
          <Pressable style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Open search results</Text>
          </Pressable>
        </Link>
      </Card>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {["All", "E-Scooters", "E-Bikes", "Mopeds", "Nearby"].map((label) => (
          <Chip
            key={label}
            label={label}
            active={type === label}
            onPress={() => setType(label)}
          />
        ))}
      </ScrollView>

      <SectionHeader title="Continue searching" />
      <Card>
        <Text style={styles.continueTitle}>Miami Beach sunset ride</Text>
        <Text style={styles.continueMeta}>Sat Mar 29, 4:00 PM to 10:00 PM</Text>
        <Text style={styles.continueMeta}>8 vehicles matching your last session</Text>
      </Card>

      <SectionHeader title="Inspired by your recent searches" actionLabel="View all" href="/search/results" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {visibleVehicles.slice(0, 4).map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            compact
            favorite={favoriteIds.includes(vehicle.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </ScrollView>

      <SectionHeader title="Popular near you" />
      <View style={styles.stack}>
        {visibleVehicles.slice(0, 3).map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            favorite={favoriteIds.includes(vehicle.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </View>

      <SectionHeader title="Affordable daily rentals" />
      <View style={styles.grid}>
        {visibleVehicles.slice(3, 5).map((vehicle) => (
          <Card key={vehicle.id}>
            <Text style={styles.tileTitle}>{vehicle.title}</Text>
            <Text style={styles.tileMeta}>{vehicle.location.neighborhood}</Text>
            <Text style={styles.tilePrice}>${vehicle.pricing.pricePerDay}/day</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    gap: spacing.sm
  },
  searchLabel: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800"
  },
  searchMeta: {
    color: colors.inkMuted,
    fontSize: 14,
    fontWeight: "600"
  },
  searchButton: {
    marginTop: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    paddingVertical: 12,
    alignItems: "center"
  },
  searchButtonText: {
    color: colors.surface,
    fontWeight: "800"
  },
  continueTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  continueMeta: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  horizontalList: {
    gap: spacing.md
  },
  stack: {
    gap: spacing.md
  },
  grid: {
    flexDirection: "row",
    gap: spacing.md
  },
  tileTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  tileMeta: {
    color: colors.inkMuted,
    fontSize: 13
  },
  tilePrice: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800"
  }
});
