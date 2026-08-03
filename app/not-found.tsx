import { ErrorDisplay } from "@/components/ErrorComponents";

export default function NotFound() {
  return <ErrorDisplay type="not-found" homeHref="/dashboard" />;
}
