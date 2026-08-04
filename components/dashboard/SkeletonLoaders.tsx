/**
 * SkeletonLoaders.tsx — Central skeleton component library for the Urban Rebooking app.
 * All skeletons follow the existing design tokens: rounded-xl, border-slate-100,
 * bg-white, shadow-sm. Animations use Tailwind's animate-pulse.
 */

/* ── Base Primitive ─────────────────────────────────────────────────── */

/** A single pulsing block. Use for any rectangular placeholder. */
export function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
  );
}

/** A circular pulsing avatar placeholder. */
export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeMap = { sm: "h-6 w-6", md: "h-10 w-10", lg: "h-14 w-14", xl: "h-20 w-20" };
  return (
    <div className={`animate-pulse rounded-full bg-slate-200 flex-shrink-0 ${sizeMap[size]}`} />
  );
}

/** A full-width pulsing text line. */
export function SkeletonText({
  width = "full",
  height = "h-4",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <div className={`animate-pulse rounded bg-slate-200 ${height} ${width === "full" ? "w-full" : width}`} />
  );
}

/** A pulsing button placeholder. */
export function SkeletonButton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 h-10 ${className || "w-28"}`} />
  );
}

/** A pulsing badge/pill placeholder. */
export function SkeletonBadge() {
  return (
    <div className="animate-pulse rounded-full bg-slate-200 h-5 w-16" />
  );
}

/* ── Composite Card Skeletons ───────────────────────────────────────── */

/** Stats card skeleton — for the 4-column stat grid on the dashboard. */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex h-[100px] flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
          <div className="flex items-start justify-between">
            <SkeletonText width="w-20" height="h-4" />
            <div className="h-9 w-9 rounded-xl bg-slate-200" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <SkeletonText width="w-16" height="h-8" />
            <SkeletonText width="w-12" height="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Quick rebook card skeleton — 3-column grid. */
export function QuickRebookSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex h-36 flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
          <div className="flex gap-4">
            <SkeletonAvatar size="md" />
            <div className="flex flex-col gap-2 w-full">
              <SkeletonText width="w-3/4" />
              <SkeletonText width="w-1/2" height="h-3" />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <SkeletonText width="w-12" height="h-4" />
            <SkeletonButton className="w-20 h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Recent activity skeleton — vertical timeline. */
export function RecentActivitySkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
      <SkeletonText width="w-32" height="h-6" />
      <div className="relative pl-6 flex flex-col gap-6">
        <div className="absolute left-1.5 top-1 bottom-0 w-px bg-slate-200"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="absolute left-0 h-3 w-3 rounded-full bg-slate-200" style={{ top: `${(i - 1) * 56}px` }} />
            <SkeletonText width="w-3/4" />
            <SkeletonText width="w-1/2" height="h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full dashboard page skeleton — mirrors the exact DashboardClient layout. */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-pulse">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-slate-200 h-32 w-full" />

      {/* Stats */}
      <StatsSkeleton />

      {/* Quick Actions */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <SkeletonText width="w-32" height="h-5" />
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>

      {/* Quick Rebook Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <SkeletonText width="w-40" height="h-5" />
          <SkeletonText width="w-16" height="h-4" />
        </div>
        <QuickRebookSkeleton />
      </div>

      {/* Recommended */}
      <div>
        <SkeletonText width="w-48" height="h-5" />
        <div className="mt-4 flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-shrink-0 w-44 h-44 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>

      {/* Activity / Upcoming */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-white border border-slate-100 shadow-sm" />
        <RecentActivitySkeleton />
      </div>
    </div>
  );
}

/** Booking history card skeleton — matches the Phase 2 grid card layout. */
export function BookingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-pulse">
      {/* Image area */}
      <div className="h-32 w-full bg-slate-200" />
      <div className="flex flex-col p-5 flex-1 gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2 flex-1">
            <SkeletonText width="w-3/4" height="h-5" />
            <SkeletonText width="w-1/3" height="h-3" />
          </div>
          <SkeletonBadge />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonText width="w-2/3" height="h-4" />
          <SkeletonText width="w-1/2" height="h-4" />
          <SkeletonText width="w-5/6" height="h-4" />
          <SkeletonText width="w-3/5" height="h-4" />
        </div>
        <div className="mt-auto pt-4 flex gap-2 border-t border-slate-100">
          <SkeletonButton className="flex-1 h-9" />
          <SkeletonButton className="flex-1 h-9" />
        </div>
      </div>
    </div>
  );
}

/** Booking history grid skeleton — 3-column grid of cards. */
export function BookingHistorySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 w-20 rounded-lg bg-slate-200" />)}
          </div>
          <div className="h-9 w-56 rounded-full bg-slate-200" />
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <div className="h-9 w-36 rounded-lg bg-slate-200" />
          <div className="h-9 w-36 rounded-lg bg-slate-200" />
        </div>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => <BookingCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

/** Booking details page skeleton — 2/3 + 1/3 layout. */
export function BookingDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-10 animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <SkeletonText width="w-28" height="h-4" />
        <div className="flex justify-between items-center">
          <SkeletonText width="w-48" height="h-8" />
          <SkeletonButton className="w-36 h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main card */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b pb-6">
              <SkeletonAvatar size="xl" />
              <div className="flex flex-col gap-2">
                <SkeletonText width="w-40" height="h-6" />
                <SkeletonText width="w-32" height="h-4" />
                <SkeletonBadge />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded bg-slate-200" />
                  <div className="flex flex-col gap-1.5">
                    <SkeletonText width="w-16" height="h-3" />
                    <SkeletonText width="w-28" height="h-5" />
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 md:col-span-2">
                <div className="h-5 w-5 rounded bg-slate-200" />
                <div className="flex flex-col gap-1.5 w-full">
                  <SkeletonText width="w-24" height="h-3" />
                  <SkeletonText width="w-3/4" height="h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment card */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-4 h-fit">
          <SkeletonText width="w-36" height="h-6" />
          <div className="h-px w-full bg-slate-100" />
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <SkeletonText width="w-20" height="h-4" />
              <SkeletonText width="w-16" height="h-4" />
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-100">
              <SkeletonText width="w-12" height="h-5" />
              <SkeletonText width="w-20" height="h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Rebooking page multi-step skeleton. */
export function RebookPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-pulse">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200" />
            <SkeletonText width="w-16" height="h-3" />
          </div>
        ))}
      </div>

      {/* Professional card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-slate-100 p-6 border-b border-slate-100">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <SkeletonText width="w-40" height="h-6" />
              <SkeletonText width="w-28" height="h-4" />
            </div>
            <SkeletonText width="w-20" height="h-8" />
          </div>
        </div>
        <div className="p-6 flex gap-6">
          <SkeletonAvatar size="xl" />
          <div className="flex flex-col gap-3 flex-1">
            <SkeletonText width="w-48" height="h-6" />
            <SkeletonText width="w-32" height="h-4" />
            <div className="grid grid-cols-2 gap-4 mt-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-slate-200" />
                  <SkeletonText width="w-20" height="h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t pt-6">
        <SkeletonButton className="w-24" />
        <SkeletonButton className="w-32" />
      </div>
    </div>
  );
}

/** Notification panel skeleton. */
export function NotificationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-0 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-slate-100">
          <div className="mt-1 h-2 w-2 rounded-full bg-slate-200 flex-shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <SkeletonText width="w-full" height="h-4" />
            <SkeletonText width="w-2/3" height="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Profile page skeleton. */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-10 animate-pulse">
      {/* Profile header */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
        <SkeletonAvatar size="xl" />
        <div className="flex flex-col gap-3 flex-1">
          <SkeletonText width="w-48" height="h-7" />
          <SkeletonText width="w-64" height="h-4" />
          <SkeletonText width="w-40" height="h-4" />
          <SkeletonButton className="mt-2 w-28" />
        </div>
      </div>
      {/* Form section */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <SkeletonText width="w-36" height="h-6" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col gap-2">
              <SkeletonText width="w-24" height="h-3" />
              <div className="h-10 rounded-lg bg-slate-100 w-full" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <SkeletonButton className="w-32" />
        </div>
      </div>
    </div>
  );
}

/** Form fields skeleton — for any generic form layout. */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <SkeletonText width="w-24" height="h-3" />
          <div className="h-10 rounded-lg bg-slate-100 w-full" />
        </div>
      ))}
      <div className="flex justify-end mt-2">
        <SkeletonButton className="w-32" />
      </div>
    </div>
  );
}

/** List items skeleton — for any vertical list. */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-0 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-100">
          <SkeletonAvatar size="md" />
          <div className="flex flex-col gap-1.5 flex-1">
            <SkeletonText width="w-3/4" />
            <SkeletonText width="w-1/2" height="h-3" />
          </div>
          <SkeletonButton className="w-20 h-8" />
        </div>
      ))}
    </div>
  );
}
