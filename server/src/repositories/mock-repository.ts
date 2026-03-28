import {
  bookings as seedBookings,
  calculateBookingPrice,
  currentUser,
  earnings as seedEarnings,
  identityVerification,
  locationTrail as seedLocationTrail,
  locationConsentVersion,
  messages as seedMessages,
  notifications as seedNotifications,
  paymentMethods as seedPaymentMethods,
  profileUpdateSchema,
  reviewSchema,
  reviews as seedReviews,
  searchFiltersSchema,
  type AvailabilityWindow,
  type Booking,
  type ConversationThread,
  type EarningsSnapshot,
  type IdentityVerificationStatus,
  type LocationAlert,
  type LocationPoint,
  type Message,
  type NotificationItem,
  type PaymentMethod,
  type PublicProfile,
  type Review,
  type SearchFilters,
  type UserProfile,
  type Vehicle,
  createBookingSchema,
  createVehicleSchema,
  identityUploadSchema,
  messageSchema,
  vehicles as seedVehicles
} from "@everides/shared";
import { nanoid } from "nanoid";
import { buildNotification } from "../services/notifications/notification-service";

type ViewerSeed = {
  userId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const deriveThreadKey = (bookingId: string) => bookingId;

export class MockRepository {
  private users = new Map<string, UserProfile>();
  private vehicles: Vehicle[] = clone(seedVehicles);
  private bookings: Booking[] = clone(seedBookings);
  private locationPoints: LocationPoint[] = clone(seedLocationTrail);
  private messages: Message[] = clone(seedMessages);
  private reviews: Review[] = clone(seedReviews);
  private paymentMethods = new Map<string, PaymentMethod[]>();
  private notifications = new Map<string, NotificationItem[]>();
  private favorites = new Map<string, Set<string>>();
  private availabilityBlocks = new Map<string, { startDate: string; endDate: string }[]>();
  private locationAlerts: LocationAlert[] = [];
  private identity = new Map<string, IdentityVerificationStatus>();
  private hostEarnings = new Map<string, EarningsSnapshot>();

  constructor() {
    this.users.set(currentUser.id, clone(currentUser));
    this.paymentMethods.set(currentUser.id, clone(seedPaymentMethods));
    this.notifications.set(currentUser.id, clone(seedNotifications));
    this.favorites.set(
      currentUser.id,
      new Set(currentUser.favoriteVehicleIds)
    );
    this.identity.set(currentUser.id, clone(identityVerification));
    this.hostEarnings.set(currentUser.id, clone(seedEarnings));

    for (const vehicle of this.vehicles) {
      if (!this.users.has(vehicle.host.id)) {
        this.users.set(vehicle.host.id, {
          ...vehicle.host,
          email: `${vehicle.host.firstName.toLowerCase()}@everides.app`,
          favoriteVehicleIds: [],
          idVerified: true,
          driversLicenseVerified: true
        });
      }

      if (!this.hostEarnings.has(vehicle.host.id)) {
        this.hostEarnings.set(vehicle.host.id, clone(seedEarnings));
      }
    }
  }

  getDefaultViewerId() {
    return currentUser.id;
  }

  ensureUserFromViewer(viewer: ViewerSeed) {
    if (this.users.has(viewer.userId)) {
      return;
    }

    this.users.set(viewer.userId, {
      id: viewer.userId,
      firstName: viewer.firstName ?? "Eve",
      lastName: viewer.lastName ?? "Rider",
      avatarUrl:
        viewer.avatarUrl ??
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80",
      role: "RIDER",
      rating: 5,
      totalTrips: 0,
      responseRate: 100,
      memberSince: new Date().toISOString().slice(0, 10),
      badges: ["New rider"],
      email: viewer.email ?? `${viewer.userId}@everides.app`,
      favoriteVehicleIds: [],
      idVerified: false,
      driversLicenseVerified: false
    });
    this.paymentMethods.set(viewer.userId, []);
    this.notifications.set(viewer.userId, []);
    this.favorites.set(viewer.userId, new Set());
    this.identity.set(viewer.userId, {
      provider: "manual",
      status: "NOT_STARTED"
    });
  }

  getCurrentUser(userId: string) {
    const profile = this.users.get(userId);
    if (!profile) {
      return null;
    }

    return clone({
      ...profile,
      favoriteVehicleIds: Array.from(this.favorites.get(userId) ?? [])
    });
  }

  updateCurrentUser(userId: string, input: unknown) {
    const profile = this.users.get(userId);
    if (!profile) {
      return null;
    }

    const patch = profileUpdateSchema.parse(input);
    const next = {
      ...profile,
      ...patch
    };
    this.users.set(userId, next);
    return clone(next);
  }

  updateAvatar(userId: string, avatarUrl: string) {
    const profile = this.users.get(userId);
    if (!profile) {
      return null;
    }

    profile.avatarUrl = avatarUrl;
    this.users.set(userId, profile);
    return clone(profile);
  }

  updateIdentity(userId: string, input: unknown) {
    identityUploadSchema.parse(input);
    const next: IdentityVerificationStatus = {
      provider: "manual",
      status: "PENDING",
      lastUpdatedAt: new Date().toISOString()
    };
    this.identity.set(userId, next);
    this.pushNotification(
      userId,
      buildNotification(
        "BOOKING",
        "Identity review started",
        "We received your verification documents and will review them shortly."
      )
    );
    return clone(next);
  }

  getIdentityStatus(userId: string) {
    return clone(this.identity.get(userId) ?? { provider: "manual", status: "NOT_STARTED" });
  }

  getPublicProfile(userId: string): PublicProfile | null {
    const profile = this.users.get(userId);
    if (!profile) {
      return null;
    }

    const { email, favoriteVehicleIds, idVerified, driversLicenseVerified, phone, ...publicFields } =
      profile;

    return clone(publicFields);
  }

  listVehicles(filters?: SearchFilters, userId?: string) {
    const parsed = filters ? searchFiltersSchema.parse(filters) : undefined;
    const favorites = userId ? this.favorites.get(userId) ?? new Set() : new Set<string>();

    let items = this.vehicles.filter(
      (vehicle) => vehicle.status === "ACTIVE" && vehicle.isAvailable
    );

    if (parsed?.query) {
      const query = parsed.query.toLowerCase();
      items = items.filter((vehicle) =>
        [vehicle.title, vehicle.make, vehicle.model, vehicle.location.neighborhood]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (parsed?.type) {
      items = items.filter((vehicle) => vehicle.type === parsed.type);
    }

    if (parsed?.maxPricePerDay) {
      items = items.filter(
        (vehicle) => vehicle.pricing.pricePerDay <= parsed.maxPricePerDay!
      );
    }

    if (parsed?.favoritesOnly) {
      items = items.filter((vehicle) => favorites.has(vehicle.id));
    }

    if (parsed?.sortBy === "PRICE") {
      items = [...items].sort(
        (left, right) => left.pricing.pricePerDay - right.pricing.pricePerDay
      );
    } else if (parsed?.sortBy === "DISTANCE") {
      items = [...items].sort((left, right) => left.distanceMiles - right.distanceMiles);
    } else if (parsed?.sortBy === "RATING") {
      items = [...items].sort((left, right) => right.rating - left.rating);
    }

    return clone(items);
  }

  getVehicle(vehicleId: string) {
    return clone(this.vehicles.find((vehicle) => vehicle.id === vehicleId) ?? null);
  }

  createVehicle(hostId: string, input: unknown) {
    const parsed = createVehicleSchema.parse(input);
    const host = this.getPublicProfile(hostId);

    if (!host) {
      return null;
    }

    const vehicle: Vehicle = {
      id: nanoid(),
      hostId,
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
      distanceMiles: 0.5,
      specs: {
        maxRange: parsed.maxRange,
        topSpeed: parsed.topSpeed,
        helmetsIncluded: parsed.helmetsIncluded,
        requiresLicense: parsed.requiresLicense
      },
      badges: ["Pending review"],
      host
    };

    this.vehicles.unshift(vehicle);
    return clone(vehicle);
  }

  updateVehicle(hostId: string, vehicleId: string, input: Partial<Vehicle>) {
    const vehicle = this.vehicles.find((item) => item.id === vehicleId && item.hostId === hostId);
    if (!vehicle) {
      return null;
    }

    Object.assign(vehicle, input);
    return clone(vehicle);
  }

  delistVehicle(hostId: string, vehicleId: string) {
    const vehicle = this.vehicles.find((item) => item.id === vehicleId && item.hostId === hostId);
    if (!vehicle) {
      return null;
    }

    vehicle.status = "DELISTED";
    vehicle.isAvailable = false;
    return clone(vehicle);
  }

  listVehicleAvailability(vehicleId: string, startDate = new Date()) {
    const blocks = this.availabilityBlocks.get(vehicleId) ?? [];

    const windows: AvailabilityWindow[] = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      const dateKey = date.toISOString().slice(0, 10);
      const blocked = blocks.some(
        (item) =>
          dateKey >= item.startDate.slice(0, 10) &&
          dateKey <= item.endDate.slice(0, 10)
      );

      return {
        date: dateKey,
        isAvailable: !blocked
      };
    });

    return clone(windows);
  }

  blockVehicleAvailability(vehicleId: string, startDate: string, endDate: string) {
    const blocks = this.availabilityBlocks.get(vehicleId) ?? [];
    blocks.push({
      startDate,
      endDate
    });
    this.availabilityBlocks.set(vehicleId, blocks);
    return this.listVehicleAvailability(vehicleId);
  }

  quoteBooking(vehicleId: string, startTime: string, endTime: string) {
    const vehicle = this.getVehicle(vehicleId);
    if (!vehicle) {
      return null;
    }

    return calculateBookingPrice(vehicle.pricing, startTime, endTime);
  }

  createBooking(userId: string, input: unknown) {
    const parsed = createBookingSchema.parse(input);
    const vehicle = this.getVehicle(parsed.vehicleId);
    const rider = this.getPublicProfile(userId);

    if (!vehicle || !rider) {
      return null;
    }

    const host = this.getPublicProfile(vehicle.hostId);
    if (!host) {
      return null;
    }

    const pricing = calculateBookingPrice(
      vehicle.pricing,
      parsed.startTime,
      parsed.endTime
    );

    const booking: Booking = {
      id: nanoid(),
      riderId: userId,
      hostId: vehicle.hostId,
      vehicleId: vehicle.id,
      status: "PENDING",
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      pickupInstructions:
        "Pickup details will appear here after the host approves your request.",
      riderLocationConsentGranted: true,
      riderLocationConsentAt: new Date().toISOString(),
      pricing,
      vehicle,
      rider,
      host
    };

    this.bookings.unshift(booking);
    this.pushNotification(
      userId,
      buildNotification(
        "BOOKING",
        "Booking requested",
        `${vehicle.title} has been requested and is waiting on host approval.`
      )
    );
    this.pushNotification(
      vehicle.hostId,
      buildNotification(
        "BOOKING",
        "New booking request",
        `${rider.firstName} requested ${vehicle.title}.`
      )
    );

    return clone(booking);
  }

  listBookings(userId: string, scope?: "rider" | "host") {
    const items = this.bookings.filter((booking) => {
      if (scope === "host") {
        return booking.hostId === userId;
      }

      if (scope === "rider") {
        return booking.riderId === userId;
      }

      return booking.riderId === userId || booking.hostId === userId;
    });

    return clone(items);
  }

  getBooking(bookingId: string) {
    return clone(this.bookings.find((booking) => booking.id === bookingId) ?? null);
  }

  updateBookingStatus(
    bookingId: string,
    userId: string,
    nextStatus: Booking["status"],
    cancellationReason?: string
  ) {
    const booking = this.bookings.find((item) => item.id === bookingId);
    if (!booking) {
      return null;
    }

    const isHost = booking.hostId === userId;
    const isRider = booking.riderId === userId;
    if (!isHost && !isRider) {
      return null;
    }

    booking.status = nextStatus;
    if (nextStatus === "ACTIVE") {
      booking.actualStartTime = new Date().toISOString();
    }
    if (nextStatus === "COMPLETED") {
      booking.actualEndTime = new Date().toISOString();
    }
    if (nextStatus === "CANCELLED" && cancellationReason) {
      booking.pickupInstructions = cancellationReason;
    }

    const notification =
      nextStatus === "APPROVED"
        ? buildNotification(
            "BOOKING",
            "Booking approved",
            `${booking.host.firstName} approved ${booking.vehicle.title}.`
          )
        : nextStatus === "ACTIVE"
          ? buildNotification(
              "LOCATION",
              "Trip started",
              "Location tracking is now active for this ride."
            )
          : nextStatus === "COMPLETED"
            ? buildNotification(
                "BOOKING",
                "Trip complete",
                "Thanks for riding with Eve Rides. Leave a review when you’re ready."
              )
            : buildNotification(
                "BOOKING",
                "Booking updated",
                `${booking.vehicle.title} status changed to ${nextStatus}.`
              );

    this.pushNotification(booking.riderId, notification);
    this.pushNotification(
      booking.hostId,
      buildNotification(
        "BOOKING",
        "Booking changed",
        `${booking.vehicle.title} is now ${nextStatus.toLowerCase()}.`
      )
    );

    return clone(booking);
  }

  appendLocationPoints(points: LocationPoint[]) {
    for (const point of points) {
      this.locationPoints.push(point);
    }
  }

  listLocationPoints(bookingId: string) {
    return clone(
      this.locationPoints.filter((point) => point.bookingId === bookingId)
    );
  }

  createLocationAlert(alert: LocationAlert) {
    this.locationAlerts.push(alert);
    this.pushNotification(
      alert.userId,
      buildNotification(
        "LOCATION",
        "Location action required",
        "Your trip requires location access to remain active."
      )
    );
    return clone(alert);
  }

  listLocationAlerts() {
    return clone(this.locationAlerts);
  }

  listThreads(userId: string) {
    const bookings = this.listBookings(userId);
    const threads = bookings
      .map((booking): ConversationThread | null => {
        const bookingMessages = this.messages
          .filter((message) => deriveThreadKey(message.bookingId) === booking.id)
          .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

        const lastMessage = bookingMessages.at(-1);
        if (!lastMessage) {
          return null;
        }

        const otherUser =
          booking.riderId === userId ? booking.host : booking.rider;

        return {
          bookingId: booking.id,
          otherUser,
          vehicle: {
            id: booking.vehicle.id,
            title: booking.vehicle.title,
            photos: booking.vehicle.photos
          },
          lastMessage,
          unreadCount: bookingMessages.filter(
            (message) => message.receiverId === userId && !message.isRead
          ).length
        };
      })
      .filter(Boolean) as ConversationThread[];

    return clone(
      threads.sort((left, right) =>
        right.lastMessage.createdAt.localeCompare(left.lastMessage.createdAt)
      )
    );
  }

  listMessages(bookingId: string) {
    return clone(
      this.messages
        .filter((message) => message.bookingId === bookingId)
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    );
  }

  createMessage(senderId: string, input: unknown) {
    const parsed = messageSchema.parse(input);
    const message: Message = {
      id: nanoid(),
      bookingId: parsed.bookingId,
      senderId,
      receiverId: parsed.receiverId,
      content: parsed.content,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    this.messages.push(message);
    this.pushNotification(
      parsed.receiverId,
      buildNotification(
        "MESSAGE",
        "New message",
        "You have a new message in Eve Rides."
      )
    );
    return clone(message);
  }

  markMessageRead(messageId: string, userId: string) {
    const message = this.messages.find(
      (item) => item.id === messageId && item.receiverId === userId
    );

    if (!message) {
      return null;
    }

    message.isRead = true;
    return clone(message);
  }

  listNotifications(userId: string) {
    return clone(this.notifications.get(userId) ?? []);
  }

  markNotificationRead(userId: string, notificationId: string) {
    const items = this.notifications.get(userId) ?? [];
    const item = items.find((entry) => entry.id === notificationId);
    if (!item) {
      return null;
    }
    item.isRead = true;
    return clone(item);
  }

  getPaymentMethods(userId: string) {
    return clone(this.paymentMethods.get(userId) ?? []);
  }

  createMockPaymentMethod(userId: string) {
    const items = this.paymentMethods.get(userId) ?? [];
    const method: PaymentMethod = {
      id: `pm_${nanoid(10)}`,
      brand: "visa",
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      expMonth: 12,
      expYear: 2029,
      isDefault: items.length === 0,
      provider: "mock"
    };
    items.push(method);
    this.paymentMethods.set(userId, items);
    return clone(method);
  }

  removePaymentMethod(userId: string, paymentMethodId: string) {
    const next = (this.paymentMethods.get(userId) ?? []).filter(
      (item) => item.id !== paymentMethodId
    );
    this.paymentMethods.set(userId, next);
    return clone(next);
  }

  getEarnings(userId: string) {
    return clone(this.hostEarnings.get(userId) ?? seedEarnings);
  }

  listReviewsForVehicle(vehicleId: string) {
    return clone(this.reviews.filter((review) => review.vehicleId === vehicleId));
  }

  listReviewsForUser(userId: string) {
    return clone(this.reviews.filter((review) => review.revieweeId === userId));
  }

  createReview(reviewerId: string, input: unknown) {
    const parsed = reviewSchema.parse(input);
    const review = {
      id: nanoid(),
      ...parsed,
      reviewerId,
      createdAt: new Date().toISOString()
    };

    this.reviews.push(review);
    this.pushNotification(
      parsed.revieweeId,
      buildNotification(
        "REVIEW",
        "New review submitted",
        "A recent ride just received a new review."
      )
    );
    return clone(review);
  }

  listFavorites(userId: string) {
    const favoriteIds = this.favorites.get(userId) ?? new Set<string>();
    return clone(
      this.vehicles.filter((vehicle) => favoriteIds.has(vehicle.id))
    );
  }

  toggleFavorite(userId: string, vehicleId: string) {
    const favorites = this.favorites.get(userId) ?? new Set<string>();
    if (favorites.has(vehicleId)) {
      favorites.delete(vehicleId);
    } else {
      favorites.add(vehicleId);
    }

    this.favorites.set(userId, favorites);
    return this.listFavorites(userId);
  }

  listPendingVehicles() {
    return clone(
      this.vehicles.filter((vehicle) => vehicle.status === "PENDING_REVIEW")
    );
  }

  listActiveBookings() {
    return clone(
      this.bookings.filter((booking) => booking.status === "ACTIVE")
    );
  }

  approveVehicle(vehicleId: string) {
    const vehicle = this.vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) {
      return null;
    }
    vehicle.status = "ACTIVE";
    vehicle.badges = vehicle.badges.filter((badge) => badge !== "Pending review");
    return clone(vehicle);
  }

  private pushNotification(userId: string, notification: NotificationItem) {
    const items = this.notifications.get(userId) ?? [];
    items.unshift(notification);
    this.notifications.set(userId, items);
  }
}
