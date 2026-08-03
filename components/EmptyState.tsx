"use client";

import Link from "next/link";
import React from "react";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1: SVG ILLUSTRATIONS
   Hand-crafted, inline SVG — zero image dependencies.
   Each illustration is ~200×160 viewport with a consistent
   rounded-rect "canvas" background (slate-50).
   ═══════════════════════════════════════════════════════════════════════ */

function IllustrationNoBookings() {
  return (
    <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background */}
      <rect width="240" height="180" fill="#f8fafc" rx="16"/>
      {/* Calendar body */}
      <rect x="50" y="35" width="140" height="115" rx="12" fill="#e2e8f0"/>
      <rect x="50" y="35" width="140" height="35" rx="12" fill="#cbd5e1"/>
      {/* Calendar pins */}
      <rect x="82" y="22" width="16" height="26" rx="5" fill="#94a3b8"/>
      <rect x="142" y="22" width="16" height="26" rx="5" fill="#94a3b8"/>
      {/* Grid lines */}
      {[0,1,2].map(col =>
        [0,1,2].map(row => (
          <rect key={`${col}-${row}`}
            x={70 + col * 36} y={90 + row * 20}
            width="24" height="12" rx="3" fill="#f1f5f9"
          />
        ))
      )}
      {/* Floating plus */}
      <circle cx="185" cy="50" r="20" fill="#0f766e"/>
      <line x1="185" y1="42" x2="185" y2="58" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <line x1="177" y1="50" x2="193" y2="50" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      {/* Sparkle dots */}
      <circle cx="40" cy="60" r="4" fill="#0f766e" opacity="0.3"/>
      <circle cx="200" cy="150" r="6" fill="#0f766e" opacity="0.2"/>
      <circle cx="220" cy="80" r="3" fill="#94a3b8" opacity="0.4"/>
    </svg>
  );
}

function IllustrationNoNotifications() {
  return (
    <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="240" height="180" fill="#f8fafc" rx="16"/>
      {/* Bell body */}
      <path d="M120 35 C100 35 84 52 84 73 L80 118 H160 L156 73 C156 52 140 35 120 35Z" fill="#e2e8f0"/>
      {/* Bell top knob */}
      <circle cx="120" cy="33" r="7" fill="#cbd5e1"/>
      {/* Bell base arc */}
      <path d="M104 118 Q120 136 136 118" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2"/>
      {/* Zzz sleeping indicator */}
      <text x="148" y="72" fontSize="14" fontWeight="700" fill="#94a3b8" fontFamily="system-ui">z</text>
      <text x="158" y="60" fontSize="11" fontWeight="700" fill="#94a3b8" fontFamily="system-ui">z</text>
      <text x="166" y="50" fontSize="9" fontWeight="700" fill="#94a3b8" fontFamily="system-ui">z</text>
      {/* No-notification cross overlay (subtle) */}
      <circle cx="80" cy="55" r="16" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1.5"/>
      <line x1="74" y1="49" x2="86" y2="61" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
      <line x1="86" y1="49" x2="74" y2="61" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationNoAddresses() {
  return (
    <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="240" height="180" fill="#f8fafc" rx="16"/>
      {/* Map background */}
      <rect x="30" y="30" width="180" height="120" rx="10" fill="#e2e8f0"/>
      {/* Road lines */}
      <line x1="30" y1="100" x2="210" y2="100" stroke="#f1f5f9" strokeWidth="10"/>
      <line x1="120" y1="30" x2="120" y2="150" stroke="#f1f5f9" strokeWidth="10"/>
      {/* Map pin */}
      <path d="M120 52 C109 52 100 61 100 73 C100 88 120 110 120 110 C120 110 140 88 140 73 C140 61 131 52 120 52Z" fill="#0f766e"/>
      <circle cx="120" cy="73" r="8" fill="white"/>
      {/* Dotted outline for "add" feel */}
      <path d="M120 52 C109 52 100 61 100 73" stroke="white" strokeWidth="1" strokeDasharray="3 3" fill="none"/>
      {/* Plus icon near pin */}
      <circle cx="142" cy="52" r="14" fill="#0f766e"/>
      <line x1="142" y1="45" x2="142" y2="59" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="135" y1="52" x2="149" y2="52" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationNoSearchResults() {
  return (
    <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="240" height="180" fill="#f8fafc" rx="16"/>
      {/* Search glass circle */}
      <circle cx="105" cy="88" r="46" fill="#e2e8f0"/>
      <circle cx="105" cy="88" r="34" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="4"/>
      {/* Handle */}
      <line x1="130" y1="113" x2="156" y2="139" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round"/>
      {/* Sad face inside lens */}
      <circle cx="97" cy="84" r="4" fill="#94a3b8"/>
      <circle cx="113" cy="84" r="4" fill="#94a3b8"/>
      <path d="M96 99 Q105 94 114 99" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* X marks in bg */}
      <text x="42" y="55" fontSize="18" fill="#cbd5e1" fontFamily="system-ui">×</text>
      <text x="170" y="65" fontSize="14" fill="#cbd5e1" fontFamily="system-ui">×</text>
      <text x="55" y="150" fontSize="12" fill="#e2e8f0" fontFamily="system-ui">×</text>
    </svg>
  );
}

function IllustrationNoProfessionals() {
  return (
    <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="240" height="180" fill="#f8fafc" rx="16"/>
      {/* Three faded person silhouettes */}
      {[65, 120, 175].map((cx, i) => (
        <g key={i} opacity={i === 1 ? 0.3 : 0.15}>
          <circle cx={cx} cy="65" r="18" fill="#cbd5e1"/>
          <path d={`M${cx - 28} 110 Q${cx} 90 ${cx + 28} 110 L${cx + 32} 150 H${cx - 32} Z`} fill="#e2e8f0"/>
        </g>
      ))}
      {/* Central "unavailable" overlay */}
      <circle cx="120" cy="90" r="36" fill="#fef2f2" opacity="0.95" stroke="#fca5a5" strokeWidth="2"/>
      <line x1="108" y1="78" x2="132" y2="102" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
      <line x1="132" y1="78" x2="108" y2="102" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
      {/* Clock icon suggesting "try later" */}
      <circle cx="182" cy="40" r="16" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1.5"/>
      <line x1="182" y1="40" x2="182" y2="32" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="182" y1="40" x2="188" y2="40" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationNoRecommendations() {
  return (
    <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="240" height="180" fill="#f8fafc" rx="16"/>
      {/* Faded service cards */}
      {[30, 90, 150].map((x, i) => (
        <g key={i} opacity={0.25 - i * 0.05}>
          <rect x={x} y="50" width="55" height="80" rx="8" fill="#e2e8f0"/>
          <rect x={x + 8} y="58" width="39" height="28" rx="4" fill="#cbd5e1"/>
          <rect x={x + 8} y="94" width="28" height="6" rx="3" fill="#cbd5e1"/>
          <rect x={x + 8} y="106" width="20" height="6" rx="3" fill="#cbd5e1"/>
          <rect x={x + 8} y="118" width="39" height="4" rx="2" fill="#e2e8f0"/>
        </g>
      ))}
      {/* Central star with magic suggestion feeling */}
      <circle cx="120" cy="90" r="36" fill="#fefce8" stroke="#fde68a" strokeWidth="2"/>
      <path d="M120 68 L124 84 H140 L128 94 L132 110 L120 100 L108 110 L112 94 L100 84 H116 Z"
        fill="#f59e0b" opacity="0.7"/>
      {/* Sparkles */}
      <circle cx="68" cy="42" r="4" fill="#f59e0b" opacity="0.4"/>
      <circle cx="176" cy="148" r="5" fill="#f59e0b" opacity="0.3"/>
      <circle cx="196" cy="55" r="3" fill="#f59e0b" opacity="0.5"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2: EMPTY STATE CONFIG
   ═══════════════════════════════════════════════════════════════════════ */

export type EmptyStateType =
  | "no-bookings"
  | "no-notifications"
  | "no-addresses"
  | "no-search-results"
  | "no-professionals"
  | "no-recommendations";

interface EmptyStateConfig {
  illustration: React.ReactNode;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, EmptyStateConfig> = {
  "no-bookings": {
    illustration: <IllustrationNoBookings />,
    title: "No Bookings Yet",
    description: "You haven't booked any services yet. Explore our top-rated professionals and book your first service in minutes.",
    primaryLabel: "Browse Services",
    primaryHref: "/dashboard",
    secondaryLabel: "View Dashboard",
    secondaryHref: "/dashboard",
  },
  "no-notifications": {
    illustration: <IllustrationNoNotifications />,
    title: "You're All Caught Up!",
    description: "No notifications right now. We'll let you know when there's something important — like an upcoming booking or a special offer.",
    primaryLabel: "Go to Dashboard",
    primaryHref: "/dashboard",
    secondaryLabel: "View Bookings",
    secondaryHref: "/bookings",
  },
  "no-addresses": {
    illustration: <IllustrationNoAddresses />,
    title: "No Saved Addresses",
    description: "Add your home or office address to speed up future bookings. Your address will be securely saved for easy access.",
    primaryLabel: "Add Address",
    primaryHref: "/dashboard/profile",
    secondaryLabel: "Go Back",
    secondaryHref: "/dashboard",
  },
  "no-search-results": {
    illustration: <IllustrationNoSearchResults />,
    title: "No Results Found",
    description: "We couldn't find any bookings matching your search. Try a different keyword, or clear your filters to see all bookings.",
    primaryLabel: "Clear Filters",
    primaryHref: "#",
    secondaryLabel: "View All Bookings",
    secondaryHref: "/bookings",
  },
  "no-professionals": {
    illustration: <IllustrationNoProfessionals />,
    title: "No Professionals Available",
    description: "There are no professionals available for the selected time slot. Try a different date or time and we'll find someone for you.",
    primaryLabel: "Choose Another Time",
    primaryHref: "#",
    secondaryLabel: "Contact Support",
    secondaryHref: "#",
  },
  "no-recommendations": {
    illustration: <IllustrationNoRecommendations />,
    title: "No Recommendations Yet",
    description: "Book a few services and we'll start personalizing recommendations just for you based on your history and preferences.",
    primaryLabel: "Explore Services",
    primaryHref: "/dashboard",
    secondaryLabel: "View Bookings",
    secondaryHref: "/bookings",
  },
};

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3: COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

interface EmptyStateProps {
  type: EmptyStateType;
  /** Override the title */
  title?: string;
  /** Override the description */
  description?: string;
  /** Override the primary CTA label */
  primaryLabel?: string;
  /** Override the primary CTA href */
  primaryHref?: string;
  /** Called when primary CTA is clicked (if you need JS logic instead of routing) */
  onPrimary?: () => void;
  /** Override the secondary CTA label */
  secondaryLabel?: string;
  /** Override the secondary CTA href */
  secondaryHref?: string;
  /** Called when secondary CTA is clicked */
  onSecondary?: () => void;
  /**
   * 'page'   — full vertical center, no card wrap (for empty route pages)
   * 'card'   — wrapped in a white rounded card with dashed border (default)
   * 'inline' — minimal, compact, no padding/card
   */
  variant?: "page" | "card" | "inline";
  className?: string;
}

export function EmptyState({
  type,
  title,
  description,
  primaryLabel,
  primaryHref,
  onPrimary,
  secondaryLabel,
  secondaryHref,
  onSecondary,
  variant = "card",
  className = "",
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];

  const resolvedTitle       = title       ?? config.title;
  const resolvedDescription = description ?? config.description;
  const resolvedPrimaryLabel  = primaryLabel  ?? config.primaryLabel;
  const resolvedPrimaryHref   = primaryHref   ?? config.primaryHref;
  const resolvedSecondaryLabel = secondaryLabel ?? config.secondaryLabel;
  const resolvedSecondaryHref  = secondaryHref  ?? config.secondaryHref;

  const primaryBtn = (
    <PrimaryButton label={resolvedPrimaryLabel} href={resolvedPrimaryHref} onClick={onPrimary} />
  );

  const secondaryBtn = (
    <SecondaryButton label={resolvedSecondaryLabel} href={resolvedSecondaryHref} onClick={onSecondary} />
  );

  const inner = (
    <div className="flex flex-col items-center text-center gap-5 w-full max-w-xs mx-auto">
      {/* Illustration */}
      <div className={`w-full ${variant === "inline" ? "max-w-[140px]" : "max-w-[200px]"}`}>
        {config.illustration}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <h3 className={`font-bold text-slate-900 ${variant === "inline" ? "text-base" : "text-lg"}`}>
          {resolvedTitle}
        </h3>
        <p className={`text-slate-500 leading-relaxed ${variant === "inline" ? "text-xs" : "text-sm"}`}>
          {resolvedDescription}
        </p>
      </div>

      {/* CTAs */}
      {variant !== "inline" && (
        <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
          {primaryBtn}
          {secondaryBtn}
        </div>
      )}
      {variant === "inline" && (
        <div className="flex gap-2">
          {primaryBtn}
        </div>
      )}
    </div>
  );

  if (variant === "page") {
    return (
      <div className={`flex min-h-[60vh] items-center justify-center p-8 ${className}`}>
        {inner}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 ${className}`}>
        {inner}
      </div>
    );
  }

  // inline
  return (
    <div className={`flex items-center justify-center p-6 ${className}`}>
      {inner}
    </div>
  );
}

/* ── Button helpers ─────────────────────────────────────────────────── */

function PrimaryButton({
  label,
  href,
  onClick,
}: {
  label: string;
  href: string;
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl bg-[#047260] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 min-w-[120px]"
      >
        {label}
      </button>
    );
  }
  if (href === "#") {
    return (
      <button
        className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl bg-[#047260] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 min-w-[120px]"
      >
        {label}
      </button>
    );
  }
  return (
    <Link
      href={href}
      className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl bg-[#047260] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 min-w-[120px]"
    >
      {label}
    </Link>
  );
}

function SecondaryButton({
  label,
  href,
  onClick,
}: {
  label: string;
  href: string;
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 min-w-[120px]"
      >
        {label}
      </button>
    );
  }
  if (href === "#") {
    return (
      <button
        className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 min-w-[120px]"
      >
        {label}
      </button>
    );
  }
  return (
    <Link
      href={href}
      className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 min-w-[120px]"
    >
      {label}
    </Link>
  );
}
