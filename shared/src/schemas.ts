import { z } from "zod";
import {
  bookingStatuses,
  locationConsentVersion,
  notificationTypes,
  userRoles,
  vehicleStatuses,
  vehicleTypes
} from "./constants";

export const vehicleTypeSchema = z.enum(vehicleTypes);
export const vehicleStatusSchema = z.enum(vehicleStatuses);
export const bookingStatusSchema = z.enum(bookingStatuses);
export const userRoleSchema = z.enum(userRoles);
export const notificationTypeSchema = z.enum(notificationTypes);

export const searchFiltersSchema = z.object({
  query: z.string().trim().min(1).optional(),
  dateStart: z.string().datetime().optional(),
  dateEnd: z.string().datetime().optional(),
  maxPricePerDay: z.coerce.number().positive().optional(),
  type: vehicleTypeSchema.optional(),
  sortBy: z.enum(["RELEVANCE", "PRICE", "DISTANCE", "RATING"]).optional(),
  favoritesOnly: z.coerce.boolean().optional()
});

export const createVehicleSchema = z.object({
  type: vehicleTypeSchema,
  make: z.string().trim().min(2),
  model: z.string().trim().min(1),
  year: z.number().int().min(2015).max(2035),
  description: z.string().trim().min(40),
  photos: z.array(z.string().url()).min(3),
  pricePerHour: z.number().positive(),
  pricePerDay: z.number().positive(),
  pricePerWeek: z.number().positive().optional(),
  maxRange: z.number().int().positive(),
  topSpeed: z.number().int().positive(),
  helmetsIncluded: z.number().int().min(0),
  requiresLicense: z.boolean(),
  addressLine: z.string().trim().min(5),
  neighborhood: z.string().trim().min(2),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  zipCode: z.string().trim().min(5),
  lat: z.number(),
  lng: z.number()
});

export const bookingQuoteSchema = z.object({
  vehicleId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime()
});

export const createBookingSchema = bookingQuoteSchema.extend({
  paymentMethodId: z.string().min(1),
  consentVersion: z.literal(locationConsentVersion),
  locationConsentGranted: z.literal(true)
});

export const locationPointSchema = z.object({
  bookingId: z.string(),
  userId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  battery: z.number().optional(),
  source: z.literal("RIDER_PHONE"),
  timestamp: z.string().datetime()
});

export const locationLogBatchSchema = z.object({
  points: z.array(locationPointSchema).min(1)
});

export const locationAlertSchema = z.object({
  bookingId: z.string(),
  userId: z.string(),
  kind: z.enum(["LOCATION_DISABLED", "LOW_BATTERY", "TRACKING_RECOVERED"]),
  durationMinutes: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime()
});

export const messageSchema = z.object({
  bookingId: z.string(),
  receiverId: z.string(),
  content: z.string().trim().min(1).max(1000)
});

export const reviewSchema = z.object({
  bookingId: z.string(),
  revieweeId: z.string(),
  vehicleId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(500).optional()
});

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(2).optional(),
  lastName: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(10).optional(),
  bio: z.string().trim().max(300).optional()
});

export const identityUploadSchema = z.object({
  driversLicenseUrl: z.string().url(),
  selfieUrl: z.string().url().optional(),
  provider: z.enum(["manual", "persona"]).default("manual")
});
