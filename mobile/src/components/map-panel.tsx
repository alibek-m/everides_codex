import type { LocationPoint, Vehicle } from "@everides/shared";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme/tokens";

export function MapPanel({
  vehicles,
  points,
  title
}: {
  vehicles?: Vehicle[];
  points?: LocationPoint[];
  title?: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title ?? "Map preview"}</Text>
      <Text style={styles.subtitle}>
        Native map rendering is enabled on iOS and Android development builds.
      </Text>
      <View style={styles.pinGrid}>
        {(vehicles ?? []).slice(0, 4).map((vehicle) => (
          <View key={vehicle.id} style={styles.pin}>
            <Text style={styles.pinLabel}>{vehicle.location.neighborhood}</Text>
          </View>
        ))}
        {(points ?? []).slice(-2).map((point) => (
          <View key={point.id} style={[styles.pin, styles.pinAccent]}>
            <Text style={styles.pinLabel}>
              {point.latitude.toFixed(3)}, {point.longitude.toFixed(3)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    gap: spacing.sm
  },
  title: {
    color: colors.ink,
    ...typography.title
  },
  subtitle: {
    color: colors.inkMuted,
    ...typography.body
  },
  pinGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  pin: {
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  pinAccent: {
    backgroundColor: colors.accentSoft
  },
  pinLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "700"
  }
});
