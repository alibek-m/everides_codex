import { StyleSheet, Text, View } from "react-native";
import { MapPanel } from "../../src/components/map-panel";
import { VehicleCard } from "../../src/components/vehicle-card";
import { Card, Screen, SectionHeader, Stat } from "../../src/components/ui";
import { useApp } from "../../src/providers/app-provider";
import { colors, spacing } from "../../src/theme/tokens";
import { formatCurrency } from "../../src/utils/format";

export default function HostDashboardScreen() {
  const { profile, vehicles, bookings, earnings, favoriteIds, toggleFavorite, locationTrail } =
    useApp();

  if (!profile) {
    return null;
  }

  const hostVehicles = vehicles.filter((vehicle) => vehicle.hostId === profile.id);
  const bookingRequests = bookings.filter(
    (booking) => booking.hostId === profile.id && booking.status === "PENDING"
  );
  const activeBookings = bookings.filter(
    (booking) => booking.hostId === profile.id && booking.status === "ACTIVE"
  );

  return (
    <Screen>
      <SectionHeader title="Host dashboard" back backHref="/(app)/(tabs)/more" />

      <Card>
        <Text style={styles.sectionTitle}>Earnings overview</Text>
        <View style={styles.stats}>
          <Stat label="This week" value={formatCurrency(earnings.weekToDate)} />
          <Stat label="This month" value={formatCurrency(earnings.monthToDate)} />
          <Stat label="Lifetime" value={formatCurrency(earnings.totalLifetime)} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Booking requests</Text>
        {bookingRequests.length === 0 ? (
          <Text style={styles.copy}>No pending requests right now.</Text>
        ) : (
          bookingRequests.map((booking) => (
            <Text key={booking.id} style={styles.copy}>
              {booking.vehicle.title} requested by {booking.rider.firstName}
            </Text>
          ))
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Live tracking during active rentals</Text>
        <MapPanel points={locationTrail} title="Active ride map" />
        <Text style={styles.copy}>
          Active rentals: {activeBookings.length}. Host visibility into active trip locations is available here without any kill-switch controls.
        </Text>
      </Card>

      <SectionHeader title="My vehicles" />
      <View style={styles.stack}>
        {hostVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            favorite={favoriteIds.includes(vehicle.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  copy: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 20
  },
  stack: {
    gap: spacing.md
  }
});
