"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  WifiOff,
  CalendarX2,
  UserX,
  ShieldOff,
  CreditCard,
  MapPinOff,
  Timer,
  SearchX,
  ServerCrash,
  AlertTriangle,
  RefreshCcw,
  Home,
  HeadphonesIcon,
  X,
  CheckCircle2,
  Info,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1: TOAST SYSTEM
   ═══════════════════════════════════════════════════════════════════════ */

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error:   <AlertTriangle size={18} className="text-red-500" />,
  info:    <Info size={18} className="text-blue-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: "border-l-4 border-emerald-500",
  error:   "border-l-4 border-red-500",
  info:    "border-l-4 border-blue-500",
  warning: "border-l-4 border-amber-500",
};

export interface ToastFunction {
  (opts: Omit<Toast, "id">): void;
  success(title: string, message?: string): void;
  error(title: string, message?: string): void;
  info(title: string, message?: string): void;
  warning(title: string, message?: string): void;
}

/* Global toast dispatcher — works without React context */
let _toastDispatch: ((toast: Omit<Toast, "id">) => void) | null = null;

export const toast: ToastFunction = Object.assign(
  (opts: Omit<Toast, "id">) => {
    if (_toastDispatch) {
      _toastDispatch(opts);
    }
  },
  {
    success: (title: string, message?: string) => {
      if (_toastDispatch) _toastDispatch({ type: "success" as const, title, message });
    },
    error: (title: string, message?: string) => {
      if (_toastDispatch) _toastDispatch({ type: "error" as const, title, message });
    },
    info: (title: string, message?: string) => {
      if (_toastDispatch) _toastDispatch({ type: "info" as const, title, message });
    },
    warning: (title: string, message?: string) => {
      if (_toastDispatch) _toastDispatch({ type: "warning" as const, title, message });
    },
  }
);

>>>>>>> origin/main

/** Drop-in toast container — mount once inside the root layout or DashboardLayout. */
export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    _toastDispatch = (opts) => {
      const id = Math.random().toString(36).substring(2);
      setToasts((prev) => [...prev, { ...opts, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    };
    return () => { _toastDispatch = null; };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 bg-white rounded-xl shadow-xl p-4 ${TOAST_STYLES[t.type]} animate-in slide-in-from-right-5 fade-in duration-300`}
        >
          <div className="mt-0.5 flex-shrink-0">{TOAST_ICONS[t.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">{t.title}</p>
            {t.message && <p className="text-xs text-slate-500 mt-0.5">{t.message}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2: ERROR ILLUSTRATIONS
   SVG illustrations — inline for zero image dependencies
   ═══════════════════════════════════════════════════════════════════════ */

function IllustrationNetworkFailure() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="160" fill="#f8fafc" rx="12"/>
      <circle cx="100" cy="80" r="40" fill="#e2e8f0"/>
      <path d="M70 80 Q100 50 130 80" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M80 88 Q100 65 120 88" stroke="#64748b" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="100" cy="95" r="5" fill="#0f766e"/>
      <line x1="60" y1="50" x2="140" y2="110" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
      <line x1="140" y1="50" x2="60" y2="110" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationBookingFailed() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="160" fill="#f8fafc" rx="12"/>
      <rect x="45" y="30" width="110" height="100" rx="10" fill="#e2e8f0"/>
      <rect x="55" y="20" width="20" height="20" rx="4" fill="#94a3b8"/>
      <rect x="125" y="20" width="20" height="20" rx="4" fill="#94a3b8"/>
      <rect x="55" y="60" width="90" height="8" rx="4" fill="#cbd5e1"/>
      <rect x="55" y="78" width="60" height="8" rx="4" fill="#cbd5e1"/>
      <circle cx="148" cy="115" r="22" fill="#fef2f2"/>
      <circle cx="148" cy="115" r="22" stroke="#fca5a5" strokeWidth="2"/>
      <line x1="141" y1="108" x2="155" y2="122" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="155" y1="108" x2="141" y2="122" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationProfessionalUnavailable() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="160" fill="#f8fafc" rx="12"/>
      <circle cx="100" cy="65" r="30" fill="#e2e8f0"/>
      <circle cx="100" cy="55" r="14" fill="#cbd5e1"/>
      <path d="M68 95 Q100 80 132 95 L136 130 H64 Z" fill="#e2e8f0"/>
      <circle cx="145" cy="40" r="18" fill="#fef2f2" stroke="#fca5a5" strokeWidth="2"/>
      <line x1="138" y1="33" x2="152" y2="47" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="152" y1="33" x2="138" y2="47" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationSessionExpired() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="160" fill="#f8fafc" rx="12"/>
      <rect x="55" y="45" width="90" height="70" rx="10" fill="#e2e8f0"/>
      <rect x="75" y="30" width="50" height="30" rx="8" fill="none" stroke="#94a3b8" strokeWidth="4"/>
      <circle cx="100" cy="85" r="12" fill="#0f766e"/>
      <line x1="100" y1="85" x2="100" y2="77" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="100" y1="85" x2="106" y2="85" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M155 35 Q165 50 155 65" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M162 30 Q176 50 162 70" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
    </svg>
  );
}

function IllustrationPaymentFailure() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="160" fill="#f8fafc" rx="12"/>
      <rect x="35" y="55" width="130" height="80" rx="10" fill="#e2e8f0"/>
      <rect x="35" y="55" width="130" height="25" rx="10" fill="#94a3b8"/>
      <rect x="45" y="95" width="40" height="8" rx="3" fill="#cbd5e1"/>
      <rect x="95" y="95" width="25" height="8" rx="3" fill="#cbd5e1"/>
      <rect x="130" y="95" width="25" height="8" rx="3" fill="#cbd5e1"/>
      <circle cx="148" cy="55" r="22" fill="#fef2f2" stroke="#fca5a5" strokeWidth="2"/>
      <line x1="141" y1="48" x2="155" y2="62" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="155" y1="48" x2="141" y2="62" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationNotFound() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="160" fill="#f8fafc" rx="12"/>
      <text x="38" y="115" fontSize="72" fontWeight="800" fill="#e2e8f0" fontFamily="system-ui">404</text>
      <circle cx="150" cy="50" r="24" fill="none" stroke="#94a3b8" strokeWidth="4"/>
      <line x1="166" y1="66" x2="178" y2="78" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="144" cy="46" r="3" fill="#64748b"/>
      <circle cx="156" cy="46" r="3" fill="#64748b"/>
      <path d="M143 56 Q150 52 157 56" stroke="#64748b" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function IllustrationServerError() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="160" fill="#f8fafc" rx="12"/>
      <rect x="50" y="30" width="100" height="30" rx="6" fill="#e2e8f0"/>
      <rect x="50" y="68" width="100" height="30" rx="6" fill="#e2e8f0"/>
      <rect x="50" y="106" width="100" height="30" rx="6" fill="#e2e8f0"/>
      <circle cx="130" cy="45" r="5" fill="#94a3b8"/>
      <circle cx="118" cy="45" r="5" fill="#94a3b8"/>
      <circle cx="130" cy="83" r="5" fill="#94a3b8"/>
      <circle cx="118" cy="83" r="5" fill="#ef4444"/>
      <circle cx="130" cy="121" r="5" fill="#94a3b8"/>
      <circle cx="118" cy="121" r="5" fill="#94a3b8"/>
      <path d="M155 60 L165 90" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="165" cy="97" r="4" fill="#f59e0b"/>
    </svg>
  );
}

function IllustrationGeneric() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="160" fill="#f8fafc" rx="12"/>
      <circle cx="100" cy="75" r="42" fill="#e2e8f0"/>
      <path d="M100 48 L100 82" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="100" cy="95" r="4" fill="#94a3b8"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3: ERROR TYPES & CONFIG
   ═══════════════════════════════════════════════════════════════════════ */

export type ErrorType =
  | "network"
  | "booking-failed"
  | "professional-unavailable"
  | "session-expired"
  | "payment-failure"
  | "address-unavailable"
  | "api-timeout"
  | "not-found"
  | "server-error"
  | "generic";

interface ErrorConfig {
  illustration: React.ReactNode;
  title: string;
  description: string;
  retryLabel: string;
  supportMessage: string;
  accentColor: string;
}

const ERROR_CONFIG: Record<ErrorType, ErrorConfig> = {
  "network": {
    illustration: <IllustrationNetworkFailure />,
    title: "No Internet Connection",
    description: "We couldn't reach our servers. Please check your network connection and try again.",
    retryLabel: "Retry Connection",
    supportMessage: "If this keeps happening, please contact our support team.",
    accentColor: "bg-red-50 text-red-600 border-red-200",
  },
  "booking-failed": {
    illustration: <IllustrationBookingFailed />,
    title: "Booking Failed",
    description: "We were unable to process your booking. Your payment has not been charged. Please try again.",
    retryLabel: "Try Booking Again",
    supportMessage: "If the issue persists, contact support with your booking reference.",
    accentColor: "bg-orange-50 text-orange-600 border-orange-200",
  },
  "professional-unavailable": {
    illustration: <IllustrationProfessionalUnavailable />,
    title: "Professional Unavailable",
    description: "Your chosen professional is no longer available for this time slot. Please select a different time or professional.",
    retryLabel: "Choose Another Slot",
    supportMessage: "We apologize for the inconvenience. Our team can help you find the right professional.",
    accentColor: "bg-amber-50 text-amber-600 border-amber-200",
  },
  "session-expired": {
    illustration: <IllustrationSessionExpired />,
    title: "Session Expired",
    description: "Your session has expired for security reasons. Please log in again to continue.",
    retryLabel: "Log In Again",
    supportMessage: "If you were not inactive, please contact support for assistance.",
    accentColor: "bg-blue-50 text-blue-600 border-blue-200",
  },
  "payment-failure": {
    illustration: <IllustrationPaymentFailure />,
    title: "Payment Failed",
    description: "We were unable to process your payment. Please check your card details and try again, or use a different payment method.",
    retryLabel: "Try Payment Again",
    supportMessage: "Contact your bank or our support team if the issue continues.",
    accentColor: "bg-red-50 text-red-600 border-red-200",
  },
  "address-unavailable": {
    illustration: <IllustrationGeneric />,
    title: "Address Not Available",
    description: "We were unable to confirm the service address. Please update your address and try again.",
    retryLabel: "Update Address",
    supportMessage: "Reach out to support if you need help with your address settings.",
    accentColor: "bg-slate-100 text-slate-600 border-slate-200",
  },
  "api-timeout": {
    illustration: <IllustrationGeneric />,
    title: "Request Timed Out",
    description: "Our servers took too long to respond. This is usually temporary. Please try again in a moment.",
    retryLabel: "Try Again",
    supportMessage: "If this keeps happening, our support team is happy to help.",
    accentColor: "bg-amber-50 text-amber-600 border-amber-200",
  },
  "not-found": {
    illustration: <IllustrationNotFound />,
    title: "Page Not Found",
    description: "We couldn't find the page you're looking for. It may have been moved or no longer exists.",
    retryLabel: "Go Back",
    supportMessage: "If you followed a link that should work, please report it to support.",
    accentColor: "bg-slate-100 text-slate-600 border-slate-200",
  },
  "server-error": {
    illustration: <IllustrationServerError />,
    title: "Server Error (500)",
    description: "Something went wrong on our end. Our team has been notified and is working to fix it.",
    retryLabel: "Reload Page",
    supportMessage: "Our engineers have been alerted. Contact support if this is urgent.",
    accentColor: "bg-red-50 text-red-600 border-red-200",
  },
  "generic": {
    illustration: <IllustrationGeneric />,
    title: "Something Went Wrong",
    description: "We encountered an unexpected error. Please try again or return to the dashboard.",
    retryLabel: "Try Again",
    supportMessage: "Our support team is available to assist you.",
    accentColor: "bg-red-50 text-red-600 border-red-200",
  },
};

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 4: CORE ERROR COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

interface ErrorDisplayProps {
  type?: ErrorType;
  /** Override the title */
  title?: string;
  /** Override the description */
  description?: string;
  /** Called when the retry button is clicked */
  onRetry?: () => void;
  /** Override the retry button label */
  retryLabel?: string;
  /** The href the "Go Home" button links to */
  homeHref?: string;
  /** Render inline (no full-screen centering) */
  inline?: boolean;
}

export function ErrorDisplay({
  type = "generic",
  title,
  description,
  onRetry,
  retryLabel,
  homeHref = "/dashboard",
  inline = false,
}: ErrorDisplayProps) {
  const config = ERROR_CONFIG[type];

  const handleSupport = () => {
    toast({
      type: "info",
      title: "Support",
      message: "Opening support chat… (Coming soon)",
    });
  };

  const content = (
    <div className="mx-auto w-full max-w-md text-center flex flex-col items-center gap-6">
      {/* Illustration */}
      <div className="w-56 h-44">
        {config.illustration}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {title ?? config.title}
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
          {description ?? config.description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#047260] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-teal-700"
          >
            <RefreshCcw size={16} />
            {retryLabel ?? config.retryLabel}
          </button>
        )}
        <div className="flex gap-3">
          <Link
            href={homeHref}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Home size={16} />
            Go Home
          </Link>
          <button
            onClick={handleSupport}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <HeadphonesIcon size={16} />
            Support
          </button>
        </div>
      </div>

      {/* Support message */}
      <p className="text-xs text-slate-400 max-w-xs">
        {config.supportMessage}
      </p>
    </div>
  );

  if (inline) {
    return (
      <div className="flex items-center justify-center py-16 px-4">
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      {content}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 5: INLINE ERROR BANNER (for form/API errors inside pages)
   ═══════════════════════════════════════════════════════════════════════ */

interface ErrorBannerProps {
  type?: ErrorType;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const BANNER_STYLES: Record<ErrorType, string> = {
  "network":                "bg-red-50   border-red-200   text-red-700",
  "booking-failed":         "bg-orange-50 border-orange-200 text-orange-700",
  "professional-unavailable":"bg-amber-50  border-amber-200  text-amber-700",
  "session-expired":        "bg-blue-50  border-blue-200  text-blue-700",
  "payment-failure":        "bg-red-50   border-red-200   text-red-700",
  "address-unavailable":    "bg-slate-50 border-slate-200 text-slate-700",
  "api-timeout":            "bg-amber-50 border-amber-200 text-amber-700",
  "not-found":              "bg-slate-50 border-slate-200 text-slate-700",
  "server-error":           "bg-red-50   border-red-200   text-red-700",
  "generic":                "bg-red-50   border-red-200   text-red-700",
};

export function ErrorBanner({
  type = "generic",
  message,
  onRetry,
  onDismiss,
}: ErrorBannerProps) {
  const config = ERROR_CONFIG[type];
  const style = BANNER_STYLES[type];

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${style}`}>
      <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">{config.title}</p>
        <p className="mt-0.5 opacity-80">{message ?? config.description}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-bold underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
