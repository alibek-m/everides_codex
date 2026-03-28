import type { Booking } from "@everides/shared";
import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";
import { formatCurrency, formatDateTime } from "../utils/format";

export function TripCard({
  booking,
  actionLabel,
  actionHref,
  onPressAction
}: {
  booking: Booking;
  actionLabel?: string;
  actionHref?: string;
  onPressAction?: () => void;
}) {
  const content = (
    <View style={styles.card}>
      <Image source={{ uri: booking.vehicle.photos[0] }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{booking.vehicle.title}</Text>
        <Text style={styles.meta}>{booking.status}</Text>
        <Text style={styles.meta}>{formatDateTime(booking.startTime)}</Text>
        <Text style={styles.meta}>{formatCurrency(booking.pricing.totalPrice)} total</Text>
        {actionLabel ? (
          <Pressable onPress={onPressAction} style={styles.button}>
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  if (actionHref) {
    return (
      <Link href={actionHref as never} asChild>
        <Pressable>{content}</Pressable>
      </Link>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: 132
  },
  content: {
    padding: spacing.md,
    gap: 6
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  meta: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  button: {
    marginTop: 10,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800"
  }
});
