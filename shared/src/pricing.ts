import { defaultInsuranceFee, defaultServiceFeeRate } from "./constants";
import type { BookingPriceBreakdown, VehiclePricing } from "./types";

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export const calculateBookingPrice = (
  pricing: VehiclePricing,
  startIso: string,
  endIso: string
): BookingPriceBreakdown => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const durationMs = Math.max(end.getTime() - start.getTime(), 60 * 60 * 1000);
  const totalHours = durationMs / (60 * 60 * 1000);
  const wholeDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours - wholeDays * 24;

  const weeklyBlocks = pricing.pricePerWeek
    ? Math.floor(totalHours / (24 * 7))
    : 0;

  const weeklyPrice = weeklyBlocks * (pricing.pricePerWeek ?? 0);
  const weeklyHours = weeklyBlocks * 24 * 7;
  const remainingAfterWeeks = Math.max(totalHours - weeklyHours, 0);
  const daysAfterWeeks = Math.floor(remainingAfterWeeks / 24);
  const hoursAfterWeeks = remainingAfterWeeks - daysAfterWeeks * 24;

  const dailyPrice =
    (weeklyBlocks > 0 ? daysAfterWeeks : wholeDays) * pricing.pricePerDay;
  const hourlyPrice =
    (weeklyBlocks > 0 ? hoursAfterWeeks : remainingHours) * pricing.pricePerHour;
  const basePrice = roundMoney(weeklyPrice + dailyPrice + hourlyPrice);
  const serviceFee = roundMoney(basePrice * defaultServiceFeeRate);
  const insuranceFee = roundMoney(defaultInsuranceFee);

  return {
    basePrice,
    serviceFee,
    insuranceFee,
    totalPrice: roundMoney(basePrice + serviceFee + insuranceFee)
  };
};
