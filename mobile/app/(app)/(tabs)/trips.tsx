import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BikeIllustration } from "../../../src/components/bike-illustration";
import { MapPanel } from "../../../src/components/map-panel";
import { TripCard } from "../../../src/components/trip-card";
import {
  Chip,
  EmptyState,
  PrimaryButton,
  Screen,
  SectionHeader
} from "../../../src/components/ui";
import { useApp } from "../../../src/providers/app-provider";
import { colors, spacing } from "../../../src/theme/tokens";

type TripTab = "Upcoming" | "Active" | "Past";

export default function TripsScreen() {
  const { bookings, locationTrail, endTrip, startTrip } = useApp();
  const [tab, setTab] = useState<TripTab>("Upcoming");

  const filtered = bookings.filter((booking) => {
    if (tab === "Upcoming") {
      return booking.status === "APPROVED" || booking.status === "PENDING";
    }
    if (tab === "Active") {
      return booking.status === "ACTIVE";
    }
    return booking.status === "COMPLETED" || booking.status === "CANCELLED";
  });

  return (
    <Screen>
      <SectionHeader title="Trips" />
      <View style={styles.tabRow}>
        {(["Upcoming", "Active", "Past"] as const).map((label) => (
          <Chip
            key={label}
            label={label}
            active={tab === label}
            onPress={() => setTab(label)}
          />
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          art={<BikeIllustration />}
          title="No trips in this section yet"
          description="Explore the marketplace, request a ride, and your confirmed rentals will appear here."
          action={
            <PrimaryButton
              label="Start searching"
              onPress={() => router.push("/(app)/(tabs)")}
            />
          }
        />
      ) : (
        <View style={styles.stack}>
          {tab === "Active" ? (
            <>
              <MapPanel points={locationTrail} title="Live trip tracking" />
              {filtered.map((booking) => (
                <TripCard
                  key={booking.id}
                  booking={booking}
                  actionLabel="End trip"
                  onPressAction={() => endTrip(booking.id)}
                />
              ))}
            </>
          ) : tab === "Upcoming" ? (
            filtered.map((booking) => (
              <TripCard
                key={booking.id}
                booking={booking}
                actionLabel={booking.status === "APPROVED" ? "Start trip" : undefined}
                onPressAction={
                  booking.status === "APPROVED"
                    ? () => startTrip(booking.id)
                    : undefined
                }
              />
            ))
          ) : (
            filtered.map((booking) => (
              <TripCard
                key={booking.id}
                booking={booking}
                actionLabel="Leave review"
                actionHref={`/review/${booking.id}`}
              />
            ))
          )}

          {tab === "Active" ? (
            <Text style={styles.copy}>
              Emergency contact and issue reporting are represented here as part of the active-trip shell. Kill-switch controls were intentionally omitted.
            </Text>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap"
  },
  stack: {
    gap: spacing.md
  },
  copy: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 20
  }
});
