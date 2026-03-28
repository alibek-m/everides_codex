import { useLocalSearchParams } from "expo-router";
import { useDeferredValue, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MapPanel } from "../../src/components/map-panel";
import { VehicleCard } from "../../src/components/vehicle-card";
import { Chip, Screen, SectionHeader } from "../../src/components/ui";
import { useApp } from "../../src/providers/app-provider";
import { colors, radius, spacing } from "../../src/theme/tokens";

export default function SearchResultsScreen() {
  const { query = "" } = useLocalSearchParams<{ query?: string }>();
  const { vehicles, favoriteIds, toggleFavorite } = useApp();
  const [sortBy, setSortBy] = useState<"RELEVANCE" | "PRICE" | "DISTANCE" | "RATING">(
    "RELEVANCE"
  );
  const [type, setType] = useState<"All" | "ELECTRIC_SCOOTER" | "ELECTRIC_BIKE" | "ELECTRIC_MOPED">(
    "All"
  );
  const [showMap, setShowMap] = useState(false);
  const deferredQuery = useDeferredValue(query);

  let results = vehicles.filter((vehicle) =>
    [vehicle.title, vehicle.location.neighborhood, vehicle.make, vehicle.model]
      .join(" ")
      .toLowerCase()
      .includes(String(deferredQuery).toLowerCase())
  );

  if (type !== "All") {
    results = results.filter((vehicle) => vehicle.type === type);
  }

  if (sortBy === "PRICE") {
    results = [...results].sort(
      (left, right) => left.pricing.pricePerDay - right.pricing.pricePerDay
    );
  } else if (sortBy === "DISTANCE") {
    results = [...results].sort((left, right) => left.distanceMiles - right.distanceMiles);
  } else if (sortBy === "RATING") {
    results = [...results].sort((left, right) => right.rating - left.rating);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <SectionHeader title="Miami results" back backHref="/(app)/(tabs)" />
        <Text style={styles.subtitle}>
          Flexible dates • {results.length} vehicles available
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {[
          ["All", "All"],
          ["Scooters", "ELECTRIC_SCOOTER"],
          ["E-Bikes", "ELECTRIC_BIKE"],
          ["Mopeds", "ELECTRIC_MOPED"]
        ].map(([label, value]) => (
          <Chip
            key={value}
            label={label}
            active={type === value}
            onPress={() => setType(value as typeof type)}
          />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {["RELEVANCE", "PRICE", "DISTANCE", "RATING"].map((value) => (
          <Chip
            key={value}
            label={value === "RELEVANCE" ? "Relevance" : value}
            active={sortBy === value}
            onPress={() => setSortBy(value as typeof sortBy)}
          />
        ))}
      </ScrollView>

      {showMap ? <MapPanel vehicles={results} title="Available rides near Miami" /> : null}

      <View style={styles.stack}>
        {results.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            favorite={favoriteIds.includes(vehicle.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </View>

      <Pressable style={styles.mapToggle} onPress={() => setShowMap((current) => !current)}>
        <Text style={styles.mapToggleText}>{showMap ? "Hide map" : "Show map"}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 14,
    fontWeight: "600"
  },
  chips: {
    gap: spacing.sm
  },
  stack: {
    gap: spacing.md
  },
  mapToggle: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 14
  },
  mapToggleText: {
    color: colors.surface,
    fontWeight: "800"
  }
});
