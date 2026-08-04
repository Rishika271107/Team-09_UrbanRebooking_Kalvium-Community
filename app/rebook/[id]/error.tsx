"use client";

import { ErrorDisplay } from "@/components/ErrorComponents";

export default function RebookError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isProfessionalError = error?.message?.toLowerCase().includes("professional") ||
                              error?.message?.toLowerCase().includes("unavailable");

  return (
    <ErrorDisplay
      type={isProfessionalError ? "professional-unavailable" : "booking-failed"}
      onRetry={reset}
      retryLabel="Try Again"
    />
  );
}
