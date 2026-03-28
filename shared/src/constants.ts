export const appName = "Eve Rides";
export const marketCity = "Miami";
export const locationConsentVersion = "2026-03-01";
export const currencyCode = "USD";

export const vehicleTypes = [
  "ELECTRIC_SCOOTER",
  "ELECTRIC_BIKE",
  "ELECTRIC_MOPED"
] as const;

export const vehicleStatuses = [
  "DRAFT",
  "PENDING_REVIEW",
  "ACTIVE",
  "SUSPENDED",
  "DELISTED"
] as const;

export const bookingStatuses = [
  "PENDING",
  "APPROVED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED"
] as const;

export const userRoles = [
  "RIDER",
  "HOST",
  "BOTH",
  "ADMIN"
] as const;

export const notificationTypes = [
  "BOOKING",
  "PAYMENT",
  "MESSAGE",
  "LOCATION",
  "PROMO",
  "REVIEW"
] as const;

export const miamiNeighborhoods = [
  "Wynwood",
  "Brickell",
  "Miami Beach",
  "Edgewater",
  "Little Havana",
  "Coconut Grove",
  "Downtown Miami",
  "Design District"
] as const;

export const defaultServiceFeeRate = 0.12;
export const defaultInsuranceFee = 9;
