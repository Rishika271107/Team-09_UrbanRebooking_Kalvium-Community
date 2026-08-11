"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  Loader2,
  Plus,
  ChevronRight,
  Tag,
  AlertCircle,
} from "lucide-react";

interface ServiceInfo {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

function generateDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function NewBookingClient({ service }: { service: ServiceInfo }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState("");
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [savedAddressText, setSavedAddressText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [serverError, setServerError] = useState("");

  const dates = useMemo(() => generateDates(), []);

  const SAVED_ADDRESSES = [
    "42, Lotus Tower, Sector 15, Bengaluru, Karnataka 560078",
    "Floor 7, TechPark One, Whitefield, Bengaluru, Karnataka 560066",
  ];

  const taxes = Math.round(service.price * 0.18);
  const total = service.price + taxes;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedDate) newErrors.date = "Please select a date.";
    if (!selectedTime) newErrors.time = "Please select a time slot.";
    const finalAddress = isNewAddress ? address : savedAddressText;
    if (!finalAddress.trim()) newErrors.address = "Please select or enter a service location.";
    return newErrors;
  };

  const handleConfirm = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setServerError("");

    const finalAddress = isNewAddress ? address : savedAddressText;
    const [hour, minute] = selectedTime.split(":").map(Number);
    const slotStart = new Date(`${selectedDate}T${selectedTime}:00`);
    const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60 * 1000);

    startTransition(async () => {
      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: service.id,
            address: finalAddress,
            slotStart: slotStart.toISOString(),
            slotEnd: slotEnd.toISOString(),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Booking failed. Please try again.");
        setConfirmed(true);
        // Redirect to history after 3 seconds
        setTimeout(() => router.push("/bookings"), 3000);
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  /* ── CONFIRMED STATE ───────────────────────────────────────── */
  if (confirmed) {
    return (
      <div className="mx-auto max-w-md mt-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Booking Requested!</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your request for <strong>{service.name}</strong> on{" "}
            <strong>
              {new Date(selectedDate).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>{" "}
            at <strong>{selectedTime}</strong> has been received.
          </p>
          <div className="w-full rounded-xl bg-slate-50 border border-slate-100 p-4 text-left flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Service</span>
              <span className="font-semibold text-slate-800">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-800">
                {new Date(selectedDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time</span>
              <span className="font-semibold text-slate-800">{selectedTime}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-teal-700">{formatCurrency(total)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Redirecting you to Booking History...
          </p>
          <div className="flex gap-3 w-full">
            <Link
              href="/services"
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-center text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Browse More
            </Link>
            <Link
              href="/bookings"
              className="flex-1 rounded-lg bg-teal-600 py-2.5 text-center text-sm font-bold text-white hover:bg-teal-700 transition-colors"
            >
              View History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── BOOKING FORM ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header */}
      <div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 mb-3 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Services
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Book a Service</h1>
        <p className="text-sm text-slate-500 mt-1">
          You&apos;re booking <strong>{service.name}</strong> &mdash; {service.category}
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700">{serverError}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── LEFT COLUMN ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* 1. Service Info Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
              <Tag size={22} className="text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 truncate">{service.name}</h3>
              <p className="text-xs text-slate-500">{service.category} &bull; {service.durationMinutes} mins</p>
            </div>
            <div className="text-lg font-bold text-slate-900 flex-shrink-0">
              {formatCurrency(service.price)}
            </div>
          </div>

          {/* 2. Date Picker */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-3">
              <CalendarIcon size={16} className="text-teal-600" /> Select Date
            </h3>
            <div
              className="flex gap-2 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {dates.map((d, i) => {
                const dateStr = d.toISOString().split("T")[0];
                const isSelected = selectedDate === dateStr;
                const isUnavailable = i % 7 === 6; // Sundays unavailable (demo)
                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedTime("");
                      setErrors((e) => ({ ...e, date: "" }));
                    }}
                    className={`flex flex-col items-center justify-center min-w-[58px] h-[70px] rounded-xl border snap-start transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                        : isUnavailable
                        ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-60"
                        : "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50 text-slate-700"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        isSelected ? "text-teal-100" : "text-slate-400"
                      }`}
                    >
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className="text-lg font-black leading-tight">{d.getDate()}</span>
                    <span
                      className={`text-[9px] font-bold ${
                        isSelected ? "text-teal-100" : "text-slate-400"
                      }`}
                    >
                      {d.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.date && (
              <p className="text-xs font-medium text-red-500 mt-1.5">{errors.date}</p>
            )}
          </div>

          {/* 3. Time Slots */}
          <div
            className={`rounded-xl border shadow-sm p-4 transition-all duration-300 ${
              !selectedDate
                ? "opacity-50 pointer-events-none border-slate-200 bg-slate-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-3">
              <Clock size={16} className="text-teal-600" /> Select Time
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
              {TIME_SLOTS.map((t, i) => {
                const isSelected = selectedTime === t;
                const isAvailable = selectedDate
                  ? (t.charCodeAt(1) + selectedDate.charCodeAt(selectedDate.length - 1) + i) % 4 !== 0
                  : true;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedTime(t);
                      setErrors((e) => ({ ...e, time: "" }));
                    }}
                    className={`py-2 rounded-lg border text-xs font-bold transition-all focus:outline-none ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                        : isAvailable
                        ? "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                        : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {errors.time && (
              <p className="text-xs font-medium text-red-500 mt-2">{errors.time}</p>
            )}
          </div>

          {/* 4. Address */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin size={16} className="text-teal-600" /> Service Location
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsNewAddress(!isNewAddress);
                  setAddress("");
                  setSavedAddressText("");
                  setErrors((e) => ({ ...e, address: "" }));
                }}
                className="text-xs font-bold text-teal-600 flex items-center gap-1 hover:text-teal-800 transition-colors"
              >
                {isNewAddress ? (
                  "Use Saved"
                ) : (
                  <>
                    <Plus size={14} /> Add New
                  </>
                )}
              </button>
            </div>

            {isNewAddress ? (
              <textarea
                className="w-full rounded-lg border border-slate-200 p-3 text-sm font-medium focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 min-h-[80px] outline-none transition-all placeholder:text-slate-400 resize-none"
                placeholder="Enter full address with landmark and pincode..."
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setErrors((er) => ({ ...er, address: "" }));
                }}
              />
            ) : (
              <div className="flex flex-col gap-2.5">
                {SAVED_ADDRESSES.map((addr, i) => (
                  <label
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      savedAddressText === addr
                        ? "border-teal-600 bg-teal-50/50 shadow-sm"
                        : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      className="mt-0.5 flex-shrink-0 w-3.5 h-3.5 accent-teal-600"
                      value={addr}
                      checked={savedAddressText === addr}
                      onChange={() => {
                        setSavedAddressText(addr);
                        setErrors((er) => ({ ...er, address: "" }));
                      }}
                    />
                    <p className="text-sm text-slate-700 leading-relaxed">{addr}</p>
                  </label>
                ))}
              </div>
            )}
            {errors.address && (
              <p className="text-xs font-bold text-red-500 mt-2">{errors.address}</p>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Summary ──────────────────────────────── */}
        <div className="lg:w-[280px] flex-shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 sticky top-20">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Booking Summary
            </h3>

            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-slate-600 max-w-[140px] leading-tight">{service.name}</span>
                <span className="font-bold text-slate-900">{formatCurrency(service.price)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Taxes & Fees (18%)</span>
                <span>{formatCurrency(taxes)}</span>
              </div>

              {selectedDate && selectedTime && (
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 mt-1 flex flex-col gap-1.5">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <CalendarIcon size={12} className="text-teal-600" />
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Clock size={12} className="text-teal-600" />
                    {selectedTime} ({service.durationMinutes} mins)
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900 uppercase tracking-wide text-sm">
                  Total
                </span>
                <span className="font-bold text-teal-700 text-lg">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="mt-5 w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  Confirm Booking <ChevronRight size={16} />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              You can cancel anytime before service begins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
