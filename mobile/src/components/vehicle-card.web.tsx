import type { Vehicle } from "@everides/shared";
import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";
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
    compact ? styles.compactCard : styles.desktopCard
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
            favorite && styles.favoriteActive
          ]}
        >
          <Text style={[styles.favoriteText, favorite && styles.favoriteTextActive]}>
            {favorite ? "Saved" : "Save"}
          </Text>
        </Pressable>

        <View style={styles.content}>
          <Text style={styles.title}>{vehicle.title}</Text>
          <Text style={styles.meta}>
            {vehicle.year} • {vehicle.location.neighborhood}
          </Text>
          <Text style={styles.meta}>
            ★ {formatRating(vehicle.rating)} ({formatTripCount(vehicle.totalTrips)})
          </Text>

          <View style={styles.footer}>
            <View style={styles.savePill}>
              <Text style={styles.savePillText}>
                Save {formatCurrency(Math.max(vehicle.pricing.pricePerDay - vehicle.pricing.pricePerHour * 6, 14))}/day
              </Text>
            </View>
            <Text style={styles.price}>{formatCurrency(vehicle.pricing.pricePerDay)}/day</Text>
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
    borderWidth: 1,
    borderColor: "#E5DDD1"
  },
  desktopCard: {
    width: 280
  },
  compactCard: {
    width: 248
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
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  favoriteActive: {
    backgroundColor: colors.primary
  },
  favoriteText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  favoriteTextActive: {
    color: colors.surface
  },
  content: {
    padding: spacing.md,
    gap: 6
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  meta: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  footer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  savePill: {
    borderRadius: radius.pill,
    backgroundColor: "#DFF4E8",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  savePillText: {
    color: "#1E8A5F",
    fontSize: 11,
    fontWeight: "700"
  },
  price: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  }
});
