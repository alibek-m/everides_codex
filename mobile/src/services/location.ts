import type { LocationPoint } from "@everides/shared";
import BackgroundGeolocation, {
  type State,
  type ProviderChangeEvent,
  type Subscription
} from "react-native-background-geolocation";
import { apiConfig, apiFetch } from "./api";
import { scheduleLocalAlert } from "./notifications";

let subscriptions: Subscription[] = [];
let readyPromise: Promise<State> | null = null;
let listenersAttached = false;

type TrackingOptions = {
  bookingId: string;
  userId: string;
  authToken?: string;
};

const clearSubscriptions = () => {
  subscriptions.forEach((subscription) => subscription.remove());
  subscriptions = [];
  listenersAttached = false;
};

const postLocation = async (point: LocationPoint, authToken?: string) => {
  if (!apiConfig.useRemote) {
    return;
  }

  await apiFetch("/api/location/log", {
    method: "POST",
    authToken,
    body: JSON.stringify({
      points: [point]
    })
  });
};

const postProviderAlert = async (
  bookingId: string,
  userId: string,
  event: ProviderChangeEvent,
  authToken?: string
) => {
  if (!apiConfig.useRemote || event.enabled) {
    return;
  }

  await apiFetch("/api/location/alert", {
    method: "POST",
    authToken,
    body: JSON.stringify({
      bookingId,
      userId,
      kind: "LOCATION_DISABLED",
      createdAt: new Date().toISOString()
    })
  });
};

const ensureLocationReady = () => {
  if (!readyPromise) {
    readyPromise = BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      preventSuspend: true,
      heartbeatInterval: 60,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      locationAuthorizationRequest: "Always"
    });
  }

  return readyPromise;
};

const attachTrackingListeners = ({
  bookingId,
  userId,
  authToken
}: TrackingOptions) => {
  if (listenersAttached) {
    clearSubscriptions();
  }

  listenersAttached = true;

  subscriptions.push(
    BackgroundGeolocation.onLocation(async (location) => {
      const point: LocationPoint = {
        id: `${bookingId}:${Date.now()}`,
        bookingId,
        userId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
        battery: location.battery?.level,
        source: "RIDER_PHONE",
        timestamp: new Date(location.timestamp).toISOString()
      };

      await postLocation(point, authToken);
    })
  );

  subscriptions.push(
    BackgroundGeolocation.onProviderChange(async (event) => {
      if (event.enabled) {
        return;
      }

      await scheduleLocalAlert(
        "Location access required",
        "Your Eve Rides trip requires location services while the ride is active."
      );
      await postProviderAlert(bookingId, userId, event, authToken);
    })
  );
};

export const startTripTracking = async (options: TrackingOptions) => {
  await ensureLocationReady();
  attachTrackingListeners(options);

  const permissionState = await BackgroundGeolocation.requestPermission();
  if (permissionState !== BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS) {
    throw new Error(
      "Always-on location permission is required to start a trip."
    );
  }

  await BackgroundGeolocation.start();
};

export const stopTripTracking = async () => {
  clearSubscriptions();
  await BackgroundGeolocation.stop();
};
