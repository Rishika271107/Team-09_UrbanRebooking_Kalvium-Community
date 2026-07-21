import Link from "next/link";
import { SearchX, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          <SearchX size={32} />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
          Page not found
        </h1>
        <p className="mb-8 text-slate-500">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
