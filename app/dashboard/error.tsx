"use client";

import { ErrorDisplay } from "@/components/ErrorComponents";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isNetworkError = error?.message?.toLowerCase().includes("fetch") ||
                         error?.message?.toLowerCase().includes("network");

  return (
    <ErrorDisplay
      type={isNetworkError ? "network" : "server-error"}
      onRetry={reset}
      retryLabel="Reload Dashboard"
    />
  );
}
