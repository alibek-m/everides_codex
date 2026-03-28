import type {
  bookingStatuses,
  notificationTypes,
  userRoles,
  vehicleStatuses,
  vehicleTypes
} from "./constants";

export type UserRole = (typeof userRoles)[number];
export type VehicleType = (typeof vehicleTypes)[number];
export type VehicleStatus = (typeof vehicleStatuses)[number];
export type BookingStatus = (typeof bookingStatuses)[number];
export type NotificationType = (typeof notificationTypes)[number];

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address extends Coordinates {
  addressLine: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: UserRole;
  rating: number;
  totalTrips: number;
  responseRate: number;
  memberSince: string;
  bio?: string;
  badges: string[];
}

export interface UserProfile extends PublicProfile {
  email: string;
  phone?: string;
  favoriteVehicleIds: string[];
  idVerified: boolean;
  driversLicenseVerified: boolean;
}

export interface VehiclePricing {
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek?: number;
}

export interface VehicleSpecs {
  maxRange: number;
  topSpeed: number;
  helmetsIncluded: number;
  weightKg?: number;
  requiresLicense: boolean;
}

export interface Vehicle {
  id: string;
  hostId: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  title: string;
  description: string;
  photos: string[];
  pricing: VehiclePricing;
  location: Address;
  status: VehicleStatus;
  isAvailable: boolean;
  rating: number;
  totalTrips: number;
  distanceMiles: number;
  specs: VehicleSpecs;
  badges: string[];
  host: PublicProfile;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  vehicleId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface BookingPriceBreakdown {
  basePrice: number;
  serviceFee: number;
  insuranceFee: number;
  totalPrice: number;
}

export interface Booking {
  id: string;
  riderId: string;
  hostId: string;
  vehicleId: string;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  pickupInstructions: string;
  riderLocationConsentGranted: boolean;
  riderLocationConsentAt?: string;
  pricing: BookingPriceBreakdown;
  vehicle: Vehicle;
  rider: PublicProfile;
  host: PublicProfile;
}

export interface SearchFilters {
  query?: string;
  dateStart?: string;
  dateEnd?: string;
  maxPricePerDay?: number;
  type?: VehicleType;
  sortBy?: "RELEVANCE" | "PRICE" | "DISTANCE" | "RATING";
  favoritesOnly?: boolean;
}

export interface LocationPoint {
  id: string;
  bookingId: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  battery?: number;
  source: "RIDER_PHONE";
  timestamp: string;
}

export interface LocationAlert {
  bookingId: string;
  userId: string;
  kind: "LOCATION_DISABLED" | "LOW_BATTERY" | "TRACKING_RECOVERED";
  durationMinutes?: number;
  createdAt: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface ConversationThread {
  bookingId: string;
  otherUser: PublicProfile;
  vehicle: Pick<Vehicle, "id" | "title" | "photos">;
  lastMessage: Message;
  unreadCount: number;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

export interface PaymentMethod {
  id: string;
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  provider: "mock";
}

export interface EarningsSnapshot {
  weekToDate: number;
  monthToDate: number;
  totalLifetime: number;
  pendingPayout: number;
}

export interface AvailabilityWindow {
  date: string;
  isAvailable: boolean;
}

export interface IdentityVerificationStatus {
  provider: "manual" | "persona";
  status: "NOT_STARTED" | "PENDING" | "VERIFIED" | "REJECTED";
  lastUpdatedAt?: string;
}
