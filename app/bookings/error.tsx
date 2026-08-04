"use client";

import { ErrorDisplay } from "@/components/ErrorComponents";

export default function BookingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      type="booking-failed"
      description="We had trouble loading your booking history. Please try again."
      onRetry={reset}
      retryLabel="Reload Bookings"
    />
  );
}
