import type { LocationPoint, Vehicle } from "@everides/shared";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { radius } from "../theme/tokens";

export function MapPanel({
  vehicles,
  points
}: {
  vehicles?: Vehicle[];
  points?: LocationPoint[];
  title?: string;
}) {
  const firstVehicle = vehicles?.[0];
  const initialLatitude =
    firstVehicle?.location.lat ?? points?.[0]?.latitude ?? 25.7617;
  const initialLongitude =
    firstVehicle?.location.lng ?? points?.[0]?.longitude ?? -80.1918;

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08
        }}
      >
        {(vehicles ?? []).map((vehicle) => (
          <Marker
            key={vehicle.id}
            coordinate={{
              latitude: vehicle.location.lat,
              longitude: vehicle.location.lng
            }}
            title={vehicle.title}
            description={vehicle.location.neighborhood}
          />
        ))}
        {points && points.length > 1 ? (
          <Polyline
            coordinates={points.map((point) => ({
              latitude: point.latitude,
              longitude: point.longitude
            }))}
            strokeWidth={4}
            strokeColor="#4D4AE8"
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 240,
    overflow: "hidden",
    borderRadius: radius.lg
  }
});
