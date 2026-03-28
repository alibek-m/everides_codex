import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { Chip, PrimaryButton, Screen, SectionHeader } from "../../src/components/ui";
import { useApp } from "../../src/providers/app-provider";
import { colors, spacing } from "../../src/theme/tokens";
import { formatCurrency, formatDateTime } from "../../src/utils/format";

export default function BookingScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const {
    getVehicleById,
    paymentMethods,
    createMockPaymentMethod,
    createBooking
  } = useApp();
  const vehicle = getVehicleById(vehicleId);
  const [step, setStep] = useState(0);
  const [dayOffset, setDayOffset] = useState(1);
  const [durationHours, setDurationHours] = useState(4);
  const [consentGranted, setConsentGranted] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id ?? "");

  if (!vehicle) {
    return null;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + dayOffset);
  startDate.setHours(10, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + durationHours);

  const handleCreateBooking = async () => {
    try {
      if (!paymentMethodId) {
        await createMockPaymentMethod();
        return;
      }

      await createBooking({
        vehicleId: vehicle.id,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        paymentMethodId
      });
      Alert.alert(
        "Booking requested",
        "Your booking request was created and is waiting for host approval."
      );
      router.replace("/(app)/(tabs)/trips");
    } catch (cause) {
      Alert.alert(
        "Booking failed",
        cause instanceof Error ? cause.message : "Please try again."
      );
    }
  };

  return (
    <Screen>
      <SectionHeader title="Booking flow" back backHref={`/vehicle/${vehicle.id}`} />
      <Text style={styles.title}>{vehicle.title}</Text>
      <Text style={styles.copy}>
        Step {step + 1} of 4
      </Text>

      {step === 0 ? (
        <View style={styles.stack}>
          <Text style={styles.label}>When do you want it?</Text>
          <View style={styles.row}>
            {[1, 2, 3].map((value) => (
              <Chip
                key={value}
                label={value === 1 ? "Tomorrow" : `+${value} days`}
                active={dayOffset === value}
                onPress={() => setDayOffset(value)}
              />
            ))}
          </View>
          <View style={styles.row}>
            {[2, 4, 8, 24].map((value) => (
              <Chip
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
      ) : null}

      {step === 1 ? (
        <View style={styles.stack}>
          <Text style={styles.label}>Location consent</Text>
          <Text style={styles.copy}>
            Eve Rides tracks your location during active rentals for safety and vehicle security. Tracking starts only when the trip starts and stops when you end the trip.
          </Text>
          <View style={styles.switchRow}>
            <Text style={styles.copy}>Grant ride-time location consent</Text>
            <Switch value={consentGranted} onValueChange={setConsentGranted} />
          </View>
          <Text style={styles.legal}>
            Privacy note: trip logs are retained for a limited period and should be disclosed in your live privacy policy before launch.
          </Text>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.stack}>
          <Text style={styles.label}>Payment method</Text>
          {paymentMethods.map((method) => (
            <Chip
              key={method.id}
              label={`${method.brand.toUpperCase()} •••• ${method.last4}`}
              active={paymentMethodId === method.id}
              onPress={() => setPaymentMethodId(method.id)}
            />
          ))}
          <PrimaryButton label="Add mock card" onPress={createMockPaymentMethod} />
          <Text style={styles.legal}>
            Stripe Connect is intentionally not connected yet. This screen uses mock methods so the booking flow remains testable.
          </Text>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.stack}>
          <Text style={styles.label}>Confirm booking</Text>
          <Text style={styles.copy}>{formatDateTime(startDate.toISOString())}</Text>
          <Text style={styles.copy}>{formatCurrency(vehicle.pricing.pricePerHour)}/hour</Text>
          <Text style={styles.copy}>Payment method: {paymentMethodId || "Add one first"}</Text>
          <Text style={styles.copy}>Location consent: {consentGranted ? "Granted" : "Missing"}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        {step > 0 ? <PrimaryButton label="Back" onPress={() => setStep(step - 1)} /> : null}
        {step < 3 ? (
          <PrimaryButton
            label="Next"
            onPress={() => setStep(step + 1)}
            disabled={step === 1 && !consentGranted}
          />
        ) : (
          <PrimaryButton
            label="Confirm booking"
            onPress={handleCreateBooking}
            disabled={!consentGranted || !paymentMethodId}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "800"
  },
  stack: {
    gap: spacing.md
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap"
  },
  label: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  copy: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 20
  },
  legal: {
    color: colors.primaryDeep,
    fontSize: 13,
    lineHeight: 19
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  footer: {
    gap: spacing.md
  }
});
