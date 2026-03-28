import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, PrimaryButton, Screen, SectionHeader } from "../../src/components/ui";
import { useApp } from "../../src/providers/app-provider";
import { colors, radius, spacing } from "../../src/theme/tokens";
import { formatCurrency, formatRating, formatTripCount } from "../../src/utils/format";

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicleById, getReviewsForVehicle } = useApp();
  const vehicle = getVehicleById(id);

  if (!vehicle) {
    return (
      <Screen>
        <Text style={styles.title}>Vehicle not found.</Text>
      </Screen>
    );
  }

  const reviews = getReviewsForVehicle(vehicle.id);

  return (
    <Screen>
      <SectionHeader title="Vehicle details" back backHref="/(app)/(tabs)" />
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {vehicle.photos.map((photo) => (
          <Image key={photo} source={{ uri: photo }} style={styles.heroImage} />
        ))}
      </ScrollView>

      <Text style={styles.title}>{vehicle.title}</Text>
      <Text style={styles.meta}>
        ★ {formatRating(vehicle.rating)} ({formatTripCount(vehicle.totalTrips)}) • {vehicle.host.badges[0] ?? "Host"}
      </Text>
      <Text style={styles.meta}>
        {vehicle.location.neighborhood}, {vehicle.location.city}
      </Text>

      <Card>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <Text style={styles.price}>{formatCurrency(vehicle.pricing.pricePerHour)}/hour</Text>
        <Text style={styles.copy}>{formatCurrency(vehicle.pricing.pricePerDay)}/day</Text>
        {vehicle.pricing.pricePerWeek ? (
          <Text style={styles.copy}>
            {formatCurrency(vehicle.pricing.pricePerWeek)}/week
          </Text>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.copy}>{vehicle.description}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Specs</Text>
        <Text style={styles.copy}>Range: {vehicle.specs.maxRange} miles</Text>
        <Text style={styles.copy}>Top speed: {vehicle.specs.topSpeed} mph</Text>
        <Text style={styles.copy}>Helmets included: {vehicle.specs.helmetsIncluded}</Text>
        <Text style={styles.copy}>
          {vehicle.specs.requiresLicense ? "Driver license required" : "No driver license required"}
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Host</Text>
        <Text style={styles.copy}>
          {vehicle.host.firstName} {vehicle.host.lastName}
        </Text>
        <Text style={styles.copy}>
          {formatRating(vehicle.host.rating)} rating • {vehicle.host.responseRate}% response rate
        </Text>
        <Text style={styles.copy}>Member since {vehicle.host.memberSince}</Text>
      </Card>

      <SectionHeader title="Recent reviews" />
      <View style={styles.reviewStack}>
        {reviews.map((review) => (
          <Card key={review.id}>
            <Text style={styles.copy}>★ {review.rating}</Text>
            <Text style={styles.copy}>{review.comment ?? "Great trip."}</Text>
          </Card>
        ))}
      </View>

      <PrimaryButton
        label="Book this ride"
        onPress={() =>
          router.push({
            pathname: "/booking/[vehicleId]",
            params: {
              vehicleId: vehicle.id
            }
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: 340,
    height: 260,
    borderRadius: radius.lg,
    marginRight: spacing.sm
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "800"
  },
  meta: {
    color: colors.inkMuted,
    fontSize: 14,
    fontWeight: "600"
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  price: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800"
  },
  copy: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 20
  },
  reviewStack: {
    gap: spacing.md
  }
});
