import { router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useApp } from "../../src/providers/app-provider";
import { colors, radius, spacing } from "../../src/theme/tokens";
import { formatCurrency, formatRating, formatTripCount } from "../../src/utils/format";

function Metric({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function WebVehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicleById, getReviewsForVehicle } = useApp();
  const vehicle = getVehicleById(id);

  if (!vehicle) {
    return (
      <View style={styles.page}>
        <Text style={styles.missing}>Vehicle not found.</Text>
      </View>
    );
  }

  const reviews = getReviewsForVehicle(vehicle.id);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.breadcrumbRow}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>‹ Back to results</Text>
        </Pressable>
      </View>

      <View style={styles.heroGrid}>
        <Image source={{ uri: vehicle.photos[0] }} style={styles.heroMain} />
        <View style={styles.heroSide}>
          {vehicle.photos.slice(1, 3).map((photo) => (
            <Image key={photo} source={{ uri: photo }} style={styles.heroSideImage} />
          ))}
        </View>
      </View>

      <View style={styles.layout}>
        <View style={styles.mainColumn}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{vehicle.title}</Text>
            <Text style={styles.meta}>
              ★ {formatRating(vehicle.rating)} ({formatTripCount(vehicle.totalTrips)}) • {vehicle.location.neighborhood}, {vehicle.location.city}
            </Text>
            <Text style={styles.meta}>
              Hosted by {vehicle.host.firstName} {vehicle.host.lastName} • {vehicle.host.badges[0] ?? "Top host"}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Metric label="Range" value={`${vehicle.specs.maxRange} mi`} />
            <Metric label="Top speed" value={`${vehicle.specs.topSpeed} mph`} />
            <Metric label="Helmets" value={`${vehicle.specs.helmetsIncluded}`} />
            <Metric
              label="License"
              value={vehicle.specs.requiresLicense ? "Required" : "Not needed"}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this ride</Text>
            <Text style={styles.copy}>{vehicle.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why riders book this one</Text>
            <View style={styles.badgeRow}>
              {vehicle.badges.map((badge) => (
                <View key={badge} style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Host details</Text>
            <Text style={styles.copy}>
              {vehicle.host.firstName} responds fast, keeps a high rating, and has handled {vehicle.host.totalTrips} trips on the platform.
            </Text>
            <Text style={styles.copy}>
              Response rate: {vehicle.host.responseRate}% • Member since {vehicle.host.memberSince}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent reviews</Text>
            <View style={styles.reviewsGrid}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <Text style={styles.reviewRating}>★ {review.rating}</Text>
                  <Text style={styles.copy}>{review.comment ?? "Great trip."}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.sideColumn}>
          <View style={styles.bookingCard}>
            <Text style={styles.rateLine}>
              {formatCurrency(vehicle.pricing.pricePerDay)}
              <Text style={styles.rateSuffix}> / day</Text>
            </Text>
            <Text style={styles.bookingMeta}>Also {formatCurrency(vehicle.pricing.pricePerHour)} / hour</Text>
            {vehicle.pricing.pricePerWeek ? (
              <Text style={styles.bookingMeta}>
                {formatCurrency(vehicle.pricing.pricePerWeek)} / week
              </Text>
            ) : null}

            <View style={styles.bookingDivider} />

            <Text style={styles.sectionTitle}>Pickup area</Text>
            <Text style={styles.copy}>{vehicle.location.neighborhood}, Miami</Text>
            <Text style={styles.copy}>Flexible pickup and mock host messaging included.</Text>

            <Pressable
              style={styles.primaryCta}
              onPress={() =>
                router.push({
                  pathname: "/booking/[vehicleId]",
                  params: {
                    vehicleId: vehicle.id
                  }
                })
              }
            >
              <Text style={styles.primaryCtaText}>Book this ride</Text>
            </Pressable>

            <Text style={styles.sideFinePrint}>
              Payments remain mocked for now, but the booking flow is fully usable.
            </Text>
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
    gap: 22
  },
  breadcrumbRow: {
    paddingTop: 8
  },
  backLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  },
  heroGrid: {
    flexDirection: "row",
    gap: 16
  },
  heroMain: {
    flex: 1,
    height: 420,
    borderRadius: 24
  },
  heroSide: {
    width: 300,
    gap: 16
  },
  heroSideImage: {
    width: "100%",
    height: 202,
    borderRadius: 24
  },
  layout: {
    flexDirection: "row",
    gap: 28,
    alignItems: "flex-start"
  },
  mainColumn: {
    flex: 1,
    gap: 20
  },
  sideColumn: {
    width: 340
  },
  titleBlock: {
    gap: 8
  },
  title: {
    color: colors.ink,
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1.6
  },
  meta: {
    color: colors.inkMuted,
    fontSize: 15,
    fontWeight: "600"
  },
  metricRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap"
  },
  metric: {
    minWidth: 140,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E6DED3",
    padding: spacing.md,
    gap: 4
  },
  metricValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800"
  },
  metricLabel: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800"
  },
  copy: {
    color: colors.inkMuted,
    fontSize: 15,
    lineHeight: 24
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  badge: {
    borderRadius: radius.pill,
    backgroundColor: "#EEF0FF",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700"
  },
  reviewsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14
  },
  reviewCard: {
    width: 280,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E6DED3",
    padding: spacing.md,
    gap: 8
  },
  reviewRating: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  bookingCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E6DED3",
    padding: 22,
    gap: 12,
    position: "sticky" as never,
    top: 24
  },
  rateLine: {
    color: colors.ink,
    fontSize: 36,
    fontWeight: "900"
  },
  rateSuffix: {
    color: colors.inkMuted,
    fontSize: 18,
    fontWeight: "700"
  },
  bookingMeta: {
    color: colors.inkMuted,
    fontSize: 14,
    fontWeight: "600"
  },
  bookingDivider: {
    height: 1,
    backgroundColor: "#ECE4D9",
    marginVertical: 8
  },
  primaryCta: {
    marginTop: 8,
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryCtaText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800"
  },
  sideFinePrint: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 18
  },
  missing: {
    padding: 32,
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800"
  }
});
