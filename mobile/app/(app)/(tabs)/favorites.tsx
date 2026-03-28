import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { BikeIllustration } from "../../../src/components/bike-illustration";
import { VehicleCard } from "../../../src/components/vehicle-card";
import {
  EmptyState,
  PrimaryButton,
  Screen,
  SectionHeader
} from "../../../src/components/ui";
import { useApp } from "../../../src/providers/app-provider";
import { colors, spacing } from "../../../src/theme/tokens";

export default function FavoritesScreen() {
  const { vehicles, favoriteIds, toggleFavorite } = useApp();
  const favorites = vehicles.filter((vehicle) => favoriteIds.includes(vehicle.id));

  return (
    <Screen>
      <SectionHeader title="Favorites" />
      {favorites.length === 0 ? (
        <EmptyState
          art={<BikeIllustration />}
          title="Get started with favorites"
          description="Tap the heart on any vehicle card to keep your short list close."
          action={
            <PrimaryButton
              label="Find new favorites"
              onPress={() => router.push("/(app)/(tabs)")}
            />
          }
        />
      ) : (
        <View style={styles.stack}>
          <Text style={styles.copy}>
            Swipe is not wired yet, but you can tap Save again to remove a vehicle.
          </Text>
          {favorites.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              favorite
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md
  },
  copy: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 20
  }
});
