export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

export const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(value));

export const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));

export const formatDateTime = (value: string) =>
  `${formatShortDate(value)} at ${formatTime(value)}`;

export const formatRating = (value: number) => value.toFixed(2).replace(/\.00$/, "");

export const formatTripCount = (value: number) =>
  `${value} trip${value === 1 ? "" : "s"}`;
