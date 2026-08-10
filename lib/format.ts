/**
 * Format a number as currency (INR by default).
 */
export function formatCurrency(
  amount: number,
  currency = "INR",
  locale = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string or Date object to a human-readable date.
 */
export function formatDate(
  date: string | Date,
  locale = "en-IN",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, options ?? { dateStyle: "medium" });
}

/**
 * Format a date string or Date object to a human-readable time.
 */
export function formatTime(date: string | Date, locale = "en-IN"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}
