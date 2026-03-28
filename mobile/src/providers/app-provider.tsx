import {
  bookings as seedBookings,
  calculateBookingPrice,
  createVehicleSchema,
  currentUser as seedCurrentUser,
  earnings as seedEarnings,
  locationConsentVersion,
  locationTrail as seedLocationTrail,
  messages as seedMessages,
  notifications as seedNotifications,
  paymentMethods as seedPaymentMethods,
  reviews as seedReviews,
  type Booking,
  type ConversationThread,
  type EarningsSnapshot,
  type LocationPoint,
  type Message,
  type NotificationItem,
  type PaymentMethod,
  type Review,
  type UserProfile,
  type Vehicle,
  vehicles as seedVehicles
} from "@everides/shared";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { Alert } from "react-native";
import { apiConfig, apiFetch } from "../services/api";
import { startTripTracking, stopTripTracking } from "../services/location";
import {
  ensureNotificationPermissions,
  registerForPushToken
} from "../services/notifications";
import {
  getFirebaseToken,
  isFirebaseConfigured,
  signInWithFirebase,
  signOutFirebase,
  signUpWithFirebase,
  subscribeToAuth
} from "../lib/firebase";

type AppContextValue = {
  ready: boolean;
  firebaseConfigured: boolean;
  usingRemoteApi: boolean;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  vehicles: Vehicle[];
  bookings: Booking[];
  messages: Message[];
  notifications: NotificationItem[];
  paymentMethods: PaymentMethod[];
  reviews: Review[];
  locationTrail: LocationPoint[];
  earnings: EarningsSnapshot;
  pushToken: string | null;
  favoriteIds: string[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  continueWithDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshRemoteData: () => Promise<void>;
  toggleFavorite: (vehicleId: string) => Promise<void>;
  createBooking: (input: {
    vehicleId: string;
    startTime: string;
    endTime: string;
    paymentMethodId: string;
  }) => Promise<Booking>;
  createVehicle: (input: unknown) => Promise<Vehicle>;
  sendMessage: (input: {
    bookingId: string;
    receiverId: string;
    content: string;
  }) => Promise<Message>;
  startTrip: (bookingId: string) => Promise<void>;
  endTrip: (bookingId: string) => Promise<void>;
  createMockPaymentMethod: () => Promise<void>;
  submitReview: (input: {
    bookingId: string;
    revieweeId: string;
    vehicleId: string;
    rating: number;
    comment?: string;
  }) => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  getVehicleById: (vehicleId: string) => Vehicle | undefined;
  getMessagesForBooking: (bookingId: string) => Message[];
  getThreads: () => ConversationThread[];
  getReviewsForVehicle: (vehicleId: string) => Review[];
};

const AppContext = createContext<AppContextValue | null>(null);

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const buildSeedState = () => ({
  profile: clone(seedCurrentUser),
  vehicles: clone(seedVehicles),
  bookings: clone(seedBookings),
  messages: clone(seedMessages),
  notifications: clone(seedNotifications),
  paymentMethods: clone(seedPaymentMethods),
  reviews: clone(seedReviews),
  locationTrail: clone(seedLocationTrail),
  earnings: clone(seedEarnings),
  pushToken: null as string | null
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(clone(seedCurrentUser));
  const [vehicles, setVehicles] = useState<Vehicle[]>(clone(seedVehicles));
  const [bookings, setBookings] = useState<Booking[]>(clone(seedBookings));
  const [messages, setMessages] = useState<Message[]>(clone(seedMessages));
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(clone(seedNotifications));
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(clone(seedPaymentMethods));
  const [reviews, setReviews] = useState<Review[]>(clone(seedReviews));
  const [locationTrail, setLocationTrail] =
    useState<LocationPoint[]>(clone(seedLocationTrail));
  const [earnings, setEarnings] = useState<EarningsSnapshot>(clone(seedEarnings));
  const [pushToken, setPushToken] = useState<string | null>(null);

  const runRemoteSync = async (work: () => Promise<void>) => {
    if (!apiConfig.useRemote) {
      return;
    }

    try {
      await work();
    } catch (error) {
      console.warn("Remote sync failed. Keeping local mock state.", error);
    }
  };

  const hydrateSeed = () => {
    const seed = buildSeedState();
    setProfile(seed.profile);
    setVehicles(seed.vehicles);
    setBookings(seed.bookings);
    setMessages(seed.messages);
    setNotifications(seed.notifications);
    setPaymentMethods(seed.paymentMethods);
    setReviews(seed.reviews);
    setLocationTrail(seed.locationTrail);
    setEarnings(seed.earnings);
  };

  const refreshRemoteData = async () => {
    if (!apiConfig.useRemote) {
      return;
    }

    const token = await getFirebaseToken();

    try {
      const [
        me,
        vehicleResponse,
        bookingResponse,
        paymentResponse,
        earningsResponse,
        notificationResponse
      ] =
        await Promise.all([
          apiFetch<{
            profile: UserProfile;
          }>("/api/users/me", {
            authToken: token ?? undefined
          }),
          apiFetch<{
            items: Vehicle[];
          }>("/api/vehicles", {
            authToken: token ?? undefined
          }),
          apiFetch<{
            bookings: Booking[];
          }>("/api/bookings", {
            authToken: token ?? undefined
          }),
          apiFetch<{
            methods: PaymentMethod[];
          }>("/api/payments/methods", {
            authToken: token ?? undefined
          }),
          apiFetch<{
            earnings: EarningsSnapshot;
          }>("/api/payments/earnings", {
            authToken: token ?? undefined
          }),
          apiFetch<{
            notifications: NotificationItem[];
          }>("/api/users/me/notifications", {
            authToken: token ?? undefined
          })
        ]);

      setProfile(me.profile);
      setVehicles(vehicleResponse.items);
      setBookings(bookingResponse.bookings);
      setPaymentMethods(paymentResponse.methods);
      setEarnings(earningsResponse.earnings);
      setNotifications(notificationResponse.notifications);
    } catch (error) {
      console.warn("Remote sync failed, using local mock data.", error);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      await ensureNotificationPermissions();
      const token = await registerForPushToken();
      setPushToken(token);
    };

    bootstrap().catch(() => undefined);

    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        hydrateSeed();
        if (apiConfig.useRemote) {
          await refreshRemoteData();
        }
      } else {
        setIsAuthenticated(false);
      }
      setReady(true);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithFirebase(email, password);
    setIsAuthenticated(true);
    hydrateSeed();
    await refreshRemoteData();
  };

  const signUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    await signUpWithFirebase(firstName, lastName, email, password);
    setIsAuthenticated(true);
    setProfile((current) =>
      current
        ? {
            ...current,
            firstName,
            lastName,
            email
          }
        : current
    );
    await refreshRemoteData();
  };

  const continueWithDemo = async () => {
    hydrateSeed();
    setIsAuthenticated(false);
    if (apiConfig.useRemote) {
      await refreshRemoteData();
    }
  };

  const signOut = async () => {
    await signOutFirebase();
    setIsAuthenticated(false);
    hydrateSeed();
  };

  const toggleFavorite = async (vehicleId: string) => {
    if (!profile) {
      return;
    }

    const nextFavorites = profile.favoriteVehicleIds.includes(vehicleId)
      ? profile.favoriteVehicleIds.filter((id) => id !== vehicleId)
      : [...profile.favoriteVehicleIds, vehicleId];

    setProfile({
      ...profile,
      favoriteVehicleIds: nextFavorites
    });

    await runRemoteSync(async () => {
      const token = await getFirebaseToken();
      const method = profile.favoriteVehicleIds.includes(vehicleId) ? "DELETE" : "POST";
      await apiFetch("/api/favorites/" + vehicleId, {
        method,
        authToken: token ?? undefined
      });
    });
  };

  const createBooking = async ({
    vehicleId,
    startTime,
    endTime,
    paymentMethodId
  }: {
    vehicleId: string;
    startTime: string;
    endTime: string;
    paymentMethodId: string;
  }) => {
    if (!profile) {
      throw new Error("You need a profile to create a booking.");
    }

    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found.");
    }

    const nextBooking: Booking = {
      id: `booking-${Date.now()}`,
      riderId: profile.id,
      hostId: vehicle.hostId,
      vehicleId,
      status: "PENDING",
      startTime,
      endTime,
      pickupInstructions: "Pickup details will appear after host approval.",
      riderLocationConsentGranted: true,
      riderLocationConsentAt: new Date().toISOString(),
      pricing: calculateBookingPrice(vehicle.pricing, startTime, endTime),
      vehicle,
      rider: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        role: profile.role,
        rating: profile.rating,
        totalTrips: profile.totalTrips,
        responseRate: profile.responseRate,
        memberSince: profile.memberSince,
        badges: profile.badges
      },
      host: vehicle.host
    };

    setBookings((current) => [nextBooking, ...current]);
    setNotifications((current) => [
      {
        id: `notif-${Date.now()}`,
        type: "BOOKING",
        title: "Booking requested",
        body: `${vehicle.title} is waiting on host approval.`,
        createdAt: new Date().toISOString(),
        isRead: false
      },
      ...current
    ]);

    await runRemoteSync(async () => {
      const token = await getFirebaseToken();
      await apiFetch("/api/bookings", {
        method: "POST",
        authToken: token ?? undefined,
        body: JSON.stringify({
          vehicleId,
          startTime,
          endTime,
          paymentMethodId,
          consentVersion: locationConsentVersion,
          locationConsentGranted: true
        })
      });
    });

    return nextBooking;
  };

  const createVehicle = async (input: unknown) => {
    if (!profile) {
      throw new Error("Sign in first.");
    }

    const parsed = createVehicleSchema.parse(input);
    const vehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      hostId: profile.id,
      type: parsed.type,
      make: parsed.make,
      model: parsed.model,
      year: parsed.year,
      title: `${parsed.make} ${parsed.model}`,
      description: parsed.description,
      photos: parsed.photos,
      pricing: {
        pricePerHour: parsed.pricePerHour,
        pricePerDay: parsed.pricePerDay,
        pricePerWeek: parsed.pricePerWeek
      },
      location: {
        lat: parsed.lat,
        lng: parsed.lng,
        addressLine: parsed.addressLine,
        neighborhood: parsed.neighborhood,
        city: parsed.city,
        state: parsed.state,
        zipCode: parsed.zipCode
      },
      status: "PENDING_REVIEW",
      isAvailable: true,
      rating: 0,
      totalTrips: 0,
      distanceMiles: 0.2,
      specs: {
        maxRange: parsed.maxRange,
        topSpeed: parsed.topSpeed,
        helmetsIncluded: parsed.helmetsIncluded,
        requiresLicense: parsed.requiresLicense
      },
      badges: ["Pending review"],
      host: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        role: profile.role,
        rating: profile.rating,
        totalTrips: profile.totalTrips,
        responseRate: profile.responseRate,
        memberSince: profile.memberSince,
        badges: profile.badges
      }
    };

    setVehicles((current) => [vehicle, ...current]);

    await runRemoteSync(async () => {
      const token = await getFirebaseToken();
      await apiFetch("/api/vehicles", {
        method: "POST",
        authToken: token ?? undefined,
        body: JSON.stringify(parsed)
      });
    });

    return vehicle;
  };

  const sendMessage = async ({
    bookingId,
    receiverId,
    content
  }: {
    bookingId: string;
    receiverId: string;
    content: string;
  }) => {
    if (!profile) {
      throw new Error("Sign in first.");
    }

    const message: Message = {
      id: `message-${Date.now()}`,
      bookingId,
      senderId: profile.id,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages((current) => [...current, message]);

    await runRemoteSync(async () => {
      const token = await getFirebaseToken();
      await apiFetch("/api/messages", {
        method: "POST",
        authToken: token ?? undefined,
        body: JSON.stringify({
          bookingId,
          receiverId,
          content
        })
      });
    });

    return message;
  };

  const updateBookingLocally = (bookingId: string, status: Booking["status"]) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status,
              actualStartTime:
                status === "ACTIVE"
                  ? new Date().toISOString()
                  : booking.actualStartTime,
              actualEndTime:
                status === "COMPLETED"
                  ? new Date().toISOString()
                  : booking.actualEndTime
            }
          : booking
      )
    );
  };

  const startTrip = async (bookingId: string) => {
    if (!profile) {
      return;
    }

    try {
      const token = await getFirebaseToken();
      await startTripTracking({
        bookingId,
        userId: profile.id,
        authToken: token ?? undefined
      });
      updateBookingLocally(bookingId, "ACTIVE");

      await runRemoteSync(async () => {
        await apiFetch(`/api/bookings/${bookingId}/start`, {
          method: "PATCH",
          authToken: token ?? undefined
        });
      });
    } catch (error) {
      Alert.alert(
        "Trip could not start",
        error instanceof Error
          ? error.message
          : "Location tracking failed to initialize."
      );
    }
  };

  const endTrip = async (bookingId: string) => {
    const token = await getFirebaseToken();
    updateBookingLocally(bookingId, "COMPLETED");
    await stopTripTracking();

    await runRemoteSync(async () => {
      await apiFetch(`/api/bookings/${bookingId}/end`, {
        method: "PATCH",
        authToken: token ?? undefined
      });
    });
  };

  const createMockPaymentMethod = async () => {
    if (!profile) {
      return;
    }

    const paymentMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      brand: "visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2029,
      isDefault: paymentMethods.length === 0,
      provider: "mock"
    };

    setPaymentMethods((current) => [...current, paymentMethod]);

    await runRemoteSync(async () => {
      const token = await getFirebaseToken();
      await apiFetch("/api/payments/setup-intent", {
        method: "POST",
        authToken: token ?? undefined
      });
    });
  };

  const submitReview = async ({
    bookingId,
    revieweeId,
    vehicleId,
    rating,
    comment
  }: {
    bookingId: string;
    revieweeId: string;
    vehicleId: string;
    rating: number;
    comment?: string;
  }) => {
    if (!profile) {
      return;
    }

    const review: Review = {
      id: `review-${Date.now()}`,
      bookingId,
      reviewerId: profile.id,
      revieweeId,
      vehicleId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    setReviews((current) => [review, ...current]);
    Alert.alert("Review submitted", "Thanks for helping the next rider.");

    await runRemoteSync(async () => {
      const token = await getFirebaseToken();
      await apiFetch("/api/reviews", {
        method: "POST",
        authToken: token ?? undefined,
        body: JSON.stringify({
          bookingId,
          revieweeId,
          vehicleId,
          rating,
          comment
        })
      });
    });
  };

  const updateProfile = async (patch: Partial<UserProfile>) => {
    if (!profile) {
      return;
    }

    setProfile({
      ...profile,
      ...patch
    });

    await runRemoteSync(async () => {
      const token = await getFirebaseToken();
      await apiFetch("/api/users/me", {
        method: "PATCH",
        authToken: token ?? undefined,
        body: JSON.stringify(patch)
      });
    });
  };

  const favoriteIds = profile?.favoriteVehicleIds ?? [];

  const getThreads = () => {
    if (!profile) {
      return [];
    }

    return bookings
      .filter(
        (booking) => booking.riderId === profile.id || booking.hostId === profile.id
      )
      .map((booking) => {
        const bookingMessages = messages
          .filter((message) => message.bookingId === booking.id)
          .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
        const lastMessage = bookingMessages.at(-1);
        if (!lastMessage) {
          return null;
        }

        return {
          bookingId: booking.id,
          otherUser:
            booking.riderId === profile.id ? booking.host : booking.rider,
          vehicle: {
            id: booking.vehicle.id,
            title: booking.vehicle.title,
            photos: booking.vehicle.photos
          },
          lastMessage,
          unreadCount: bookingMessages.filter(
            (message) => message.receiverId === profile.id && !message.isRead
          ).length
        };
      })
      .filter(Boolean) as ConversationThread[];
  };

  const value: AppContextValue = {
    ready,
    firebaseConfigured: isFirebaseConfigured,
    usingRemoteApi: apiConfig.useRemote,
    isAuthenticated,
    profile,
    vehicles,
    bookings,
    messages,
    notifications,
    paymentMethods,
    reviews,
    locationTrail,
    earnings,
    pushToken,
    favoriteIds,
    signIn,
    signUp,
    continueWithDemo,
    signOut,
    refreshRemoteData,
    toggleFavorite,
    createBooking,
    createVehicle,
    sendMessage,
    startTrip,
    endTrip,
    createMockPaymentMethod,
    submitReview,
    updateProfile,
    getVehicleById: (vehicleId) => vehicles.find((vehicle) => vehicle.id === vehicleId),
    getMessagesForBooking: (bookingId) =>
      messages.filter((message) => message.bookingId === bookingId),
    getThreads,
    getReviewsForVehicle: (vehicleId) =>
      reviews.filter((review) => review.vehicleId === vehicleId)
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider.");
  }

  return context;
}
