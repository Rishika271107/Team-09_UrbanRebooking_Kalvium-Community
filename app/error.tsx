"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/ErrorComponents";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <ErrorDisplay
      type="server-error"
      onRetry={reset}
      retryLabel="Reload Page"
    />
  );
}
