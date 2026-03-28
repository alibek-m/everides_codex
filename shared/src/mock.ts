import { calculateBookingPrice } from "./pricing";
import type {
  Booking,
  ConversationThread,
  EarningsSnapshot,
  Message,
  NotificationItem,
  PaymentMethod,
  PublicProfile,
  Review,
  UserProfile,
  Vehicle
} from "./types";

const iso = (value: string) => new Date(value).toISOString();

const hosts: PublicProfile[] = [
  {
    id: "host-1",
    firstName: "Camila",
    lastName: "Reyes",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    role: "HOST",
    rating: 4.92,
    totalTrips: 138,
    responseRate: 99,
    memberSince: "2023-02-14",
    badges: ["All-Star Host", "Fast replies"]
  },
  {
    id: "host-2",
    firstName: "Jordan",
    lastName: "Lee",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    role: "BOTH",
    rating: 4.87,
    totalTrips: 92,
    responseRate: 96,
    memberSince: "2023-09-03",
    badges: ["Top rated"]
  },
  {
    id: "host-3",
    firstName: "Nadia",
    lastName: "Flores",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    role: "HOST",
    rating: 4.95,
    totalTrips: 174,
    responseRate: 100,
    memberSince: "2022-06-18",
    badges: ["Superhost", "5-star pickup"]
  }
];

export const currentUser: UserProfile = {
  id: "user-1",
  firstName: "Avery",
  lastName: "Morgan",
  avatarUrl:
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80",
  role: "BOTH",
  rating: 4.89,
  totalTrips: 14,
  responseRate: 98,
  memberSince: "2024-05-11",
  badges: ["Verified rider"],
  email: "avery@everides.app",
  phone: "+1 305 555 0146",
  favoriteVehicleIds: ["vehicle-1", "vehicle-4", "vehicle-6"],
  idVerified: true,
  driversLicenseVerified: true,
  bio: "Weekend rider and occasional host based in Edgewater."
};

export const vehicles: Vehicle[] = [
  {
    id: "vehicle-1",
    hostId: "host-1",
    type: "ELECTRIC_SCOOTER",
    make: "Segway",
    model: "Ninebot Max G2",
    year: 2025,
    title: "Segway Ninebot Max G2",
    description:
      "Reliable long-range scooter staged for Miami Beach pickups. Great for quick rides, daily commuting, and hotel-to-boardwalk trips.",
    photos: [
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1617692855027-33b14f061079?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1593941707882-a56bbc8df3e1?auto=format&fit=crop&w=1200&q=80"
    ],
    pricing: {
      pricePerHour: 12,
      pricePerDay: 58,
      pricePerWeek: 320
    },
    location: {
      lat: 25.7907,
      lng: -80.130,
      addressLine: "1501 Collins Ave",
      neighborhood: "Miami Beach",
      city: "Miami Beach",
      state: "FL",
      zipCode: "33139"
    },
    status: "ACTIVE",
    isAvailable: true,
    rating: 4.94,
    totalTrips: 62,
    distanceMiles: 1.4,
    specs: {
      maxRange: 43,
      topSpeed: 22,
      helmetsIncluded: 1,
      weightKg: 24,
      requiresLicense: false
    },
    badges: ["Popular near you", "Affordable daily rental"],
    host: hosts[0]
  },
  {
    id: "vehicle-2",
    hostId: "host-2",
    type: "ELECTRIC_BIKE",
    make: "Rad Power",
    model: "RadRunner 3 Plus",
    year: 2024,
    title: "Rad Power RadRunner 3 Plus",
    description:
      "Comfort-focused utility e-bike with cargo rack, ideal for Wynwood errands, coffee runs, and all-day neighborhood exploring.",
    photos: [
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80"
    ],
    pricing: {
      pricePerHour: 16,
      pricePerDay: 74,
      pricePerWeek: 428
    },
    location: {
      lat: 25.8005,
      lng: -80.1995,
      addressLine: "2520 NW 2nd Ave",
      neighborhood: "Wynwood",
      city: "Miami",
      state: "FL",
      zipCode: "33127"
    },
    status: "ACTIVE",
    isAvailable: true,
    rating: 4.88,
    totalTrips: 44,
    distanceMiles: 2.8,
    specs: {
      maxRange: 45,
      topSpeed: 20,
      helmetsIncluded: 2,
      weightKg: 34,
      requiresLicense: false
    },
    badges: ["Inspired by your recent searches"],
    host: hosts[1]
  },
  {
    id: "vehicle-3",
    hostId: "host-3",
    type: "ELECTRIC_MOPED",
    make: "NIU",
    model: "NQi GTS",
    year: 2024,
    title: "NIU NQi GTS",
    description:
      "Fast, clean, and easy to ride electric moped with room for a second helmet. Best suited for longer downtown and Brickell routes.",
    photos: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
    ],
    pricing: {
      pricePerHour: 24,
      pricePerDay: 118,
      pricePerWeek: 670
    },
    location: {
      lat: 25.7652,
      lng: -80.1936,
      addressLine: "701 S Miami Ave",
      neighborhood: "Brickell",
      city: "Miami",
      state: "FL",
      zipCode: "33131"
    },
    status: "ACTIVE",
    isAvailable: true,
    rating: 4.96,
    totalTrips: 71,
    distanceMiles: 3.2,
    specs: {
      maxRange: 62,
      topSpeed: 43,
      helmetsIncluded: 2,
      weightKg: 97,
      requiresLicense: true
    },
    badges: ["All-Star Host"],
    host: hosts[2]
  },
  {
    id: "vehicle-4",
    hostId: "host-1",
    type: "ELECTRIC_SCOOTER",
    make: "Apollo",
    model: "City 2025",
    year: 2025,
    title: "Apollo City 2025",
    description:
      "Premium suspension scooter for smooth rides along the beach path and through South Beach. Strong brakes and easy folding frame.",
    photos: [
      "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582639510494-c80b5de9f148?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1606220588911-5117f8f4b17d?auto=format&fit=crop&w=1200&q=80"
    ],
    pricing: {
      pricePerHour: 14,
      pricePerDay: 66,
      pricePerWeek: 372
    },
    location: {
      lat: 25.7827,
      lng: -80.1340,
      addressLine: "1220 Ocean Dr",
      neighborhood: "Miami Beach",
      city: "Miami Beach",
      state: "FL",
      zipCode: "33139"
    },
    status: "ACTIVE",
    isAvailable: true,
    rating: 4.9,
    totalTrips: 55,
    distanceMiles: 1.9,
    specs: {
      maxRange: 38,
      topSpeed: 27,
      helmetsIncluded: 1,
      weightKg: 29,
      requiresLicense: false
    },
    badges: ["Popular near you"],
    host: hosts[0]
  },
  {
    id: "vehicle-5",
    hostId: "host-2",
    type: "ELECTRIC_BIKE",
    make: "Specialized",
    model: "Turbo Vado",
    year: 2024,
    title: "Specialized Turbo Vado",
    description:
      "A fast commuter e-bike with upright handling and enough range for a full day in Coconut Grove and Coral Way.",
    photos: [
      "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508973379184-7517410fb0f9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80"
    ],
    pricing: {
      pricePerHour: 18,
      pricePerDay: 82,
      pricePerWeek: 470
    },
    location: {
      lat: 25.7281,
      lng: -80.2437,
      addressLine: "2980 McFarlane Rd",
      neighborhood: "Coconut Grove",
      city: "Miami",
      state: "FL",
      zipCode: "33133"
    },
    status: "ACTIVE",
    isAvailable: true,
    rating: 4.85,
    totalTrips: 31,
    distanceMiles: 5.4,
    specs: {
      maxRange: 52,
      topSpeed: 28,
      helmetsIncluded: 1,
      weightKg: 27,
      requiresLicense: false
    },
    badges: ["Weekend favorite"],
    host: hosts[1]
  },
  {
    id: "vehicle-6",
    hostId: "host-3",
    type: "ELECTRIC_MOPED",
    make: "Vespa",
    model: "Elettrica",
    year: 2023,
    title: "Vespa Elettrica",
    description:
      "Style-forward electric moped with premium pickup experience and easy parking in Design District and Midtown.",
    photos: [
      "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80"
    ],
    pricing: {
      pricePerHour: 26,
      pricePerDay: 124,
      pricePerWeek: 715
    },
    location: {
      lat: 25.8133,
      lng: -80.1938,
      addressLine: "140 NE 39th St",
      neighborhood: "Design District",
      city: "Miami",
      state: "FL",
      zipCode: "33137"
    },
    status: "ACTIVE",
    isAvailable: true,
    rating: 4.97,
    totalTrips: 83,
    distanceMiles: 2.3,
    specs: {
      maxRange: 50,
      topSpeed: 43,
      helmetsIncluded: 2,
      weightKg: 111,
      requiresLicense: true
    },
    badges: ["Luxury pickup"],
    host: hosts[2]
  }
];

export const reviews: Review[] = [
  {
    id: "review-1",
    bookingId: "booking-past-1",
    reviewerId: "user-2",
    revieweeId: "host-1",
    vehicleId: "vehicle-1",
    rating: 5,
    comment: "Pickup was smooth and the scooter battery lasted the entire day.",
    createdAt: iso("2026-02-14T18:30:00-05:00")
  },
  {
    id: "review-2",
    bookingId: "booking-past-2",
    reviewerId: "user-3",
    revieweeId: "host-3",
    vehicleId: "vehicle-6",
    rating: 5,
    comment: "Excellent host communication and the moped was spotless.",
    createdAt: iso("2026-03-04T10:15:00-05:00")
  },
  {
    id: "review-3",
    bookingId: "booking-past-3",
    reviewerId: "user-4",
    revieweeId: "host-2",
    vehicleId: "vehicle-2",
    rating: 4,
    comment: "Great bike for Wynwood, just a little heavy at slower speeds.",
    createdAt: iso("2026-03-12T16:40:00-05:00")
  }
];

const riderProfile: PublicProfile = {
  id: currentUser.id,
  firstName: currentUser.firstName,
  lastName: currentUser.lastName,
  avatarUrl: currentUser.avatarUrl,
  role: currentUser.role,
  rating: currentUser.rating,
  totalTrips: currentUser.totalTrips,
  responseRate: currentUser.responseRate,
  memberSince: currentUser.memberSince,
  badges: currentUser.badges
};

export const bookings: Booking[] = [
  {
    id: "booking-upcoming-1",
    riderId: currentUser.id,
    hostId: "host-2",
    vehicleId: "vehicle-2",
    status: "APPROVED",
    startTime: iso("2026-03-29T10:00:00-05:00"),
    endTime: iso("2026-03-29T18:00:00-05:00"),
    pickupInstructions: "Meet Jordan at the Wynwood Walls parking entrance.",
    riderLocationConsentGranted: true,
    riderLocationConsentAt: iso("2026-03-27T14:00:00-05:00"),
    pricing: calculateBookingPrice(
      vehicles[1].pricing,
      iso("2026-03-29T10:00:00-05:00"),
      iso("2026-03-29T18:00:00-05:00")
    ),
    vehicle: vehicles[1],
    rider: riderProfile,
    host: hosts[1]
  },
  {
    id: "booking-active-1",
    riderId: currentUser.id,
    hostId: "host-1",
    vehicleId: "vehicle-4",
    status: "ACTIVE",
    startTime: iso("2026-03-27T15:00:00-05:00"),
    endTime: iso("2026-03-27T21:00:00-05:00"),
    actualStartTime: iso("2026-03-27T15:07:00-05:00"),
    pickupInstructions: "Unlock code shared in chat once you arrive.",
    riderLocationConsentGranted: true,
    riderLocationConsentAt: iso("2026-03-27T14:50:00-05:00"),
    pricing: calculateBookingPrice(
      vehicles[3].pricing,
      iso("2026-03-27T15:00:00-05:00"),
      iso("2026-03-27T21:00:00-05:00")
    ),
    vehicle: vehicles[3],
    rider: riderProfile,
    host: hosts[0]
  },
  {
    id: "booking-past-1",
    riderId: currentUser.id,
    hostId: "host-3",
    vehicleId: "vehicle-6",
    status: "COMPLETED",
    startTime: iso("2026-03-10T09:00:00-05:00"),
    endTime: iso("2026-03-10T14:00:00-05:00"),
    actualStartTime: iso("2026-03-10T09:02:00-05:00"),
    actualEndTime: iso("2026-03-10T13:49:00-05:00"),
    pickupInstructions: "Curbside handoff in Design District.",
    riderLocationConsentGranted: true,
    riderLocationConsentAt: iso("2026-03-10T08:48:00-05:00"),
    pricing: calculateBookingPrice(
      vehicles[5].pricing,
      iso("2026-03-10T09:00:00-05:00"),
      iso("2026-03-10T14:00:00-05:00")
    ),
    vehicle: vehicles[5],
    rider: riderProfile,
    host: hosts[2]
  }
];

export const locationTrail = [
  {
    id: "loc-1",
    bookingId: "booking-active-1",
    userId: currentUser.id,
    latitude: 25.7827,
    longitude: -80.1340,
    accuracy: 8,
    speed: 0,
    heading: 92,
    battery: 0.76,
    source: "RIDER_PHONE" as const,
    timestamp: iso("2026-03-27T15:07:00-05:00")
  },
  {
    id: "loc-2",
    bookingId: "booking-active-1",
    userId: currentUser.id,
    latitude: 25.7798,
    longitude: -80.1315,
    accuracy: 6,
    speed: 7.6,
    heading: 125,
    battery: 0.71,
    source: "RIDER_PHONE" as const,
    timestamp: iso("2026-03-27T15:27:00-05:00")
  },
  {
    id: "loc-3",
    bookingId: "booking-active-1",
    userId: currentUser.id,
    latitude: 25.7750,
    longitude: -80.1280,
    accuracy: 4,
    speed: 8.9,
    heading: 164,
    battery: 0.67,
    source: "RIDER_PHONE" as const,
    timestamp: iso("2026-03-27T15:42:00-05:00")
  }
];

export const messages: Message[] = [
  {
    id: "message-1",
    bookingId: "booking-active-1",
    senderId: "host-1",
    receiverId: currentUser.id,
    content: "The scooter is charged to 92%. Ping me if you want a longer route suggestion.",
    createdAt: iso("2026-03-27T14:58:00-05:00"),
    isRead: true
  },
  {
    id: "message-2",
    bookingId: "booking-active-1",
    senderId: currentUser.id,
    receiverId: "host-1",
    content: "Perfect. I’m heading over now.",
    createdAt: iso("2026-03-27T15:00:00-05:00"),
    isRead: true
  },
  {
    id: "message-3",
    bookingId: "booking-upcoming-1",
    senderId: "host-2",
    receiverId: currentUser.id,
    content: "Helmet is included and pickup is flexible within a 30-minute window.",
    createdAt: iso("2026-03-28T08:30:00-05:00"),
    isRead: false
  }
];

export const threads: ConversationThread[] = [
  {
    bookingId: "booking-active-1",
    otherUser: hosts[0],
    vehicle: {
      id: vehicles[3].id,
      title: vehicles[3].title,
      photos: vehicles[3].photos
    },
    lastMessage: messages[1],
    unreadCount: 0
  },
  {
    bookingId: "booking-upcoming-1",
    otherUser: hosts[1],
    vehicle: {
      id: vehicles[1].id,
      title: vehicles[1].title,
      photos: vehicles[1].photos
    },
    lastMessage: messages[2],
    unreadCount: 1
  }
];

export const notifications: NotificationItem[] = [
  {
    id: "notif-1",
    type: "BOOKING",
    title: "Booking approved",
    body: "Jordan approved your RadRunner booking for Saturday at 10:00 AM.",
    createdAt: iso("2026-03-27T14:05:00-05:00"),
    isRead: false
  },
  {
    id: "notif-2",
    type: "LOCATION",
    title: "Location tracking active",
    body: "Your ride is live and trip tracking will stop automatically when you end the trip.",
    createdAt: iso("2026-03-27T15:08:00-05:00"),
    isRead: true
  },
  {
    id: "notif-3",
    type: "REVIEW",
    title: "Leave a review",
    body: "Tell other riders how your Vespa Elettrica trip went.",
    createdAt: iso("2026-03-11T09:20:00-05:00"),
    isRead: true
  }
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "pm-1",
    brand: "visa",
    last4: "4242",
    expMonth: 4,
    expYear: 2028,
    isDefault: true,
    provider: "mock"
  },
  {
    id: "pm-2",
    brand: "mastercard",
    last4: "4444",
    expMonth: 7,
    expYear: 2027,
    isDefault: false,
    provider: "mock"
  }
];

export const earnings: EarningsSnapshot = {
  weekToDate: 186,
  monthToDate: 742,
  totalLifetime: 6648,
  pendingPayout: 214
};

export const identityVerification = {
  provider: "manual" as const,
  status: "VERIFIED" as const,
  lastUpdatedAt: iso("2026-02-20T11:15:00-05:00")
};
