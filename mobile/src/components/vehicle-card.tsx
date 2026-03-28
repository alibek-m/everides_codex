import type { Vehicle } from "@everides/shared";
import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadows, spacing } from "../theme/tokens";
import { formatCurrency, formatRating, formatTripCount } from "../utils/format";

export function VehicleCard({
  vehicle,
  favorite,
  onToggleFavorite,
  compact = false
}: {
  vehicle: Vehicle;
  favorite?: boolean;
  onToggleFavorite?: (vehicleId: string) => void;
  compact?: boolean;
}) {
  const cardStyle = StyleSheet.flatten([
    styles.card,
    compact ? styles.compactCard : null
  ]);

  return (
    <Link
      href={{
        pathname: "/vehicle/[id]",
        params: {
          id: vehicle.id
        }
      }}
      asChild
    >
      <Pressable style={cardStyle}>
        <Image source={{ uri: vehicle.photos[0] }} style={styles.image} />
        <Pressable
          onPress={() => onToggleFavorite?.(vehicle.id)}
          style={[
            styles.favorite,
            favorite && {
              backgroundColor: colors.primary
            }
          ]}
        >
          <Text
            style={[
              styles.favoriteText,
              favorite && {
                color: colors.surface
              }
            ]}
          >
            {favorite ? "Saved" : "Save"}
          </Text>
        </Pressable>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{vehicle.title}</Text>
            <Text style={styles.price}>{formatCurrency(vehicle.pricing.pricePerDay)}/day</Text>
          </View>
          <Text style={styles.meta}>
            {vehicle.location.neighborhood} • {vehicle.distanceMiles.toFixed(1)} mi away
          </Text>
          <Text style={styles.meta}>
            ★ {formatRating(vehicle.rating)} ({formatTripCount(vehicle.totalTrips)})
          </Text>
          <View style={styles.badges}>
            {vehicle.badges.slice(0, compact ? 1 : 2).map((badge) => (
              <View key={badge} style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
    ...shadows.card
  },
  compactCard: {
    width: 280
  },
  image: {
    width: "100%",
    height: 188
  },
  favorite: {
    position: "absolute",
    top: 14,
    right: 14,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  favoriteText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  content: {
    padding: spacing.md,
    gap: 6
  },
  header: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  title: {
    flex: 1,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  price: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800"
  },
  meta: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: 4
  },
  badge: {
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  badgeText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "700"
  }
});
