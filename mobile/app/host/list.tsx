import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { LabeledInput, PrimaryButton, Screen, SectionHeader } from "../../src/components/ui";
import { useApp } from "../../src/providers/app-provider";
import { colors, spacing } from "../../src/theme/tokens";

export default function HostListVehicleScreen() {
  const { createVehicle } = useApp();
  const [type, setType] = useState("ELECTRIC_SCOOTER");
  const [make, setMake] = useState("Apollo");
  const [model, setModel] = useState("Go 2026");
  const [year, setYear] = useState("2026");
  const [description, setDescription] = useState(
    "Clean, reliable electric scooter set up for a polished pickup in Miami Beach with helmet and charger included."
  );
  const [photos, setPhotos] = useState(
    "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?auto=format&fit=crop&w=1200&q=80, https://images.unsplash.com/photo-1582639510494-c80b5de9f148?auto=format&fit=crop&w=1200&q=80, https://images.unsplash.com/photo-1606220588911-5117f8f4b17d?auto=format&fit=crop&w=1200&q=80"
  );
  const [pricePerHour, setPricePerHour] = useState("16");
  const [pricePerDay, setPricePerDay] = useState("76");
  const [pricePerWeek, setPricePerWeek] = useState("420");
  const [maxRange, setMaxRange] = useState("41");
  const [topSpeed, setTopSpeed] = useState("25");
  const [helmetsIncluded, setHelmetsIncluded] = useState("1");
  const [addressLine, setAddressLine] = useState("1200 Ocean Dr");
  const [neighborhood, setNeighborhood] = useState("Miami Beach");
  const [city, setCity] = useState("Miami Beach");
  const [state, setState] = useState("FL");
  const [zipCode, setZipCode] = useState("33139");
  const [lat, setLat] = useState("25.7818");
  const [lng, setLng] = useState("-80.1340");

  const handleSubmit = async () => {
    try {
      await createVehicle({
        type,
        make,
        model,
        year: Number(year),
        description,
        photos: photos.split(",").map((item) => item.trim()),
        pricePerHour: Number(pricePerHour),
        pricePerDay: Number(pricePerDay),
        pricePerWeek: Number(pricePerWeek),
        maxRange: Number(maxRange),
        topSpeed: Number(topSpeed),
        helmetsIncluded: Number(helmetsIncluded),
        requiresLicense: type === "ELECTRIC_MOPED",
        addressLine,
        neighborhood,
        city,
        state,
        zipCode,
        lat: Number(lat),
        lng: Number(lng)
      });
      Alert.alert(
        "Vehicle submitted",
        "Your listing is now in pending review and will appear in the host dashboard."
      );
      router.replace("/host/dashboard");
    } catch (cause) {
      Alert.alert(
        "Unable to submit",
        cause instanceof Error ? cause.message : "Please fix the form and try again."
      );
    }
  };

  return (
    <Screen>
      <SectionHeader title="List a vehicle" back backHref="/(app)/(tabs)/more" />
      <Text style={styles.copy}>
        Hardware onboarding was removed with the kill-switch scope. This flow focuses on listing quality, safety review, pricing, and pickup logistics.
      </Text>

      <LabeledInput label="Type" value={type} onChangeText={setType} />
      <LabeledInput label="Make" value={make} onChangeText={setMake} />
      <LabeledInput label="Model" value={model} onChangeText={setModel} />
      <LabeledInput label="Year" value={year} onChangeText={setYear} keyboardType="numeric" />
      <LabeledInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <LabeledInput
        label="Photo URLs"
        value={photos}
        onChangeText={setPhotos}
        multiline
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <LabeledInput
            label="Price / hour"
            value={pricePerHour}
            onChangeText={setPricePerHour}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.half}>
          <LabeledInput
            label="Price / day"
            value={pricePerDay}
            onChangeText={setPricePerDay}
            keyboardType="numeric"
          />
        </View>
      </View>
      <LabeledInput
        label="Price / week"
        value={pricePerWeek}
        onChangeText={setPricePerWeek}
        keyboardType="numeric"
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <LabeledInput
            label="Max range"
            value={maxRange}
            onChangeText={setMaxRange}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.half}>
          <LabeledInput
            label="Top speed"
            value={topSpeed}
            onChangeText={setTopSpeed}
            keyboardType="numeric"
          />
        </View>
      </View>
      <LabeledInput
        label="Helmets included"
        value={helmetsIncluded}
        onChangeText={setHelmetsIncluded}
        keyboardType="numeric"
      />
      <LabeledInput label="Address" value={addressLine} onChangeText={setAddressLine} />
      <LabeledInput
        label="Neighborhood"
        value={neighborhood}
        onChangeText={setNeighborhood}
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <LabeledInput label="City" value={city} onChangeText={setCity} />
        </View>
        <View style={styles.half}>
          <LabeledInput label="State" value={state} onChangeText={setState} />
        </View>
      </View>
      <LabeledInput label="ZIP code" value={zipCode} onChangeText={setZipCode} />
      <View style={styles.row}>
        <View style={styles.half}>
          <LabeledInput label="Latitude" value={lat} onChangeText={setLat} />
        </View>
        <View style={styles.half}>
          <LabeledInput label="Longitude" value={lng} onChangeText={setLng} />
        </View>
      </View>
      <PrimaryButton label="Submit for review" onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: {
    color: colors.inkMuted,
    lineHeight: 20
  },
  row: {
    flexDirection: "row",
    gap: spacing.md
  },
  half: {
    flex: 1
  }
});
