import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../../src/providers/app-provider";
import { colors, radius, spacing } from "../../src/theme/tokens";
import { formatCurrency, formatDateTime } from "../../src/utils/format";

function SelectChip({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function WebBookingScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const { getVehicleById, paymentMethods, createMockPaymentMethod, createBooking } = useApp();
  const vehicle = getVehicleById(vehicleId);
  const [dayOffset, setDayOffset] = useState(1);
  const [durationHours, setDurationHours] = useState(4);
  const [consentGranted, setConsentGranted] = useState(true);
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!vehicle) {
    return null;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + dayOffset);
  startDate.setHours(10, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + durationHours);

  const quote = {
    hourly: vehicle.pricing.pricePerHour,
    daily: vehicle.pricing.pricePerDay
  };

  const handleBooking = async () => {
    setSubmitting(true);
    setStatus(null);

    try {
      if (!paymentMethodId) {
        await createMockPaymentMethod();
        setStatus("A mock card was added. Select it, then confirm again.");
        return;
      }

      await createBooking({
        vehicleId: vehicle.id,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        paymentMethodId
      });

      setStatus("Booking request sent. The host can now approve it.");
      router.push("/(app)/(tabs)/trips");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.content}>
        <View style={styles.mainColumn}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>‹ Back to vehicle</Text>
          </Pressable>

          <Text style={styles.title}>Book {vehicle.title}</Text>
          <Text style={styles.subtitle}>
            Choose the dates, confirm ride-time tracking consent, and complete the mocked payment setup.
          </Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1. Pick your timing</Text>
            <View style={styles.row}>
              {[1, 2, 3].map((value) => (
                <SelectChip
                  key={value}
                  label={value === 1 ? "Tomorrow" : `+${value} days`}
                  active={dayOffset === value}
                  onPress={() => setDayOffset(value)}
                />
              ))}
            </View>
            <View style={styles.row}>
              {[2, 4, 8, 24].map((value) => (
                <SelectChip
                  key={value}
                  label={value === 24 ? "1 day" : `${value} hours`}
                  active={durationHours === value}
                  onPress={() => setDurationHours(value)}
                />
              ))}
            </View>
            <Text style={styles.copy}>Start: {formatDateTime(startDate.toISOString())}</Text>
            <Text style={styles.copy}>End: {formatDateTime(endDate.toISOString())}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>2. Ride-time location consent</Text>
            <Text style={styles.copy}>
              Eve Rides tracks your location only during active rentals for rider safety and vehicle security.
            </Text>
            <Pressable
              onPress={() => setConsentGranted((current) => !current)}
              style={[styles.consentBox, consentGranted && styles.consentBoxActive]}
            >
              <Text style={[styles.consentText, consentGranted && styles.consentTextActive]}>
                {consentGranted ? "Consent granted" : "Grant consent to continue"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>3. Payment method</Text>
            <View style={styles.row}>
              {paymentMethods.map((method) => (
                <SelectChip
                  key={method.id}
                  label={`${method.brand.toUpperCase()} •••• ${method.last4}`}
                  active={paymentMethodId === method.id}
                  onPress={() => setPaymentMethodId(method.id)}
                />
              ))}
            </View>
            <Pressable style={styles.secondaryCta} onPress={createMockPaymentMethod}>
              <Text style={styles.secondaryCtaText}>Add mock card</Text>
            </Pressable>
            <Text style={styles.copy}>
              Stripe is intentionally not connected yet. This flow stays mocked for product testing.
            </Text>
          </View>
        </View>

        <View style={styles.sideColumn}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Trip summary</Text>
            <Text style={styles.summaryRate}>{formatCurrency(quote.daily)} / day</Text>
            <Text style={styles.copy}>{formatCurrency(quote.hourly)} / hour</Text>
            <Text style={styles.copy}>{vehicle.location.neighborhood}, Miami</Text>

            <View style={styles.summaryDivider} />

            <Text style={styles.copy}>{formatDateTime(startDate.toISOString())}</Text>
            <Text style={styles.copy}>{formatDateTime(endDate.toISOString())}</Text>
            <Text style={styles.copy}>Consent: {consentGranted ? "Granted" : "Missing"}</Text>
            <Text style={styles.copy}>Payment: {paymentMethodId || "No card selected"}</Text>

            <Pressable
              onPress={handleBooking}
              disabled={!consentGranted || submitting}
              style={[
                styles.primaryCta,
                (!consentGranted || submitting) && styles.primaryCtaDisabled
              ]}
            >
              <Text style={styles.primaryCtaText}>
                {submitting ? "Sending..." : "Confirm booking"}
              </Text>
            </Pressable>

            {status ? <Text style={styles.status}>{status}</Text> : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FCFBF8",
    paddingHorizontal: 32,
    paddingBottom: 56
  },
  content: {
    flexDirection: "row",
    gap: 28,
    alignItems: "flex-start"
  },
  mainColumn: {
    flex: 1,
    gap: 18
  },
  sideColumn: {
    width: 340
  },
  backLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  },
  title: {
    color: colors.ink,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1.4
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 16,
    lineHeight: 24
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E6DED3",
    padding: 22,
    gap: 14
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#E3DDD1",
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  chipActive: {
    backgroundColor: "#1A1820",
    borderColor: "#1A1820"
  },
  chipText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700"
  },
  chipTextActive: {
    color: colors.surface
  },
  copy: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 22
  },
  consentBox: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#E6DED3",
    backgroundColor: "#F7F3ED",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  consentBoxActive: {
    backgroundColor: "#E8F7F2",
    borderColor: "#CBE9DF"
  },
  consentText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700"
  },
  consentTextActive: {
    color: "#1B7B5D"
  },
  secondaryCta: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: "#EFEAFF",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  secondaryCtaText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  summaryCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E6DED3",
    padding: 22,
    gap: 12,
    position: "sticky" as never,
    top: 24
  },
  summaryTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800"
  },
  summaryRate: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "900"
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#ECE4D9",
    marginVertical: 4
  },
  primaryCta: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8
  },
  primaryCtaDisabled: {
    opacity: 0.5
  },
  primaryCtaText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800"
  },
  status: {
    color: colors.primaryDeep,
    fontSize: 13,
    lineHeight: 19
  }
});
