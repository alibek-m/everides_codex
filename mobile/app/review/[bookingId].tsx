import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Chip, LabeledInput, PrimaryButton, Screen, SectionHeader } from "../../src/components/ui";
import { useApp } from "../../src/providers/app-provider";
import { colors, spacing } from "../../src/theme/tokens";

export default function ReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { bookings, submitReview } = useApp();
  const booking = bookings.find((item) => item.id === bookingId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState(
    "Smooth pickup, clean vehicle, and easy communication throughout the ride."
  );

  if (!booking) {
    return null;
  }

  return (
    <Screen>
      <SectionHeader title="Leave a review" back backHref="/(app)/(tabs)/trips" />
      <Text style={styles.title}>{booking.vehicle.title}</Text>
      <Text style={styles.copy}>
        Reviews are visible on the vehicle and host profile to build marketplace trust.
      </Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Chip
            key={value}
            label={`${value}★`}
            active={rating === value}
            onPress={() => setRating(value)}
          />
        ))}
      </View>
      <LabeledInput
        label="Comment"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <PrimaryButton
        label="Submit review"
        onPress={async () => {
          await submitReview({
            bookingId: booking.id,
            revieweeId: booking.hostId,
            vehicleId: booking.vehicleId,
            rating,
            comment
          });
          Alert.alert("Review saved", "Thanks for the feedback.");
          router.replace("/(app)/(tabs)/trips");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "800"
  },
  copy: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 20
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap"
  }
});
