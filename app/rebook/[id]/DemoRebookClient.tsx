"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Award,
  ShieldCheck,
  Languages,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Tag,
  Plus,
  RotateCw,
  CheckCircle2,
  Loader2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   DEMO DATA
   ═══════════════════════════════════════════════════════════════════════ */

interface DemoServiceData {
  serviceName: string;
  category: string;
  professional: string;
  rating: number;
  priceNum: number;
  price: string;
  avatarBg: string;
}

const DEMO_DATA: Record<string, DemoServiceData> = {
  "demo-1": { serviceName: "Full Home Deep Cleaning", category: "Cleaning", professional: "Priya Sharma", rating: 4.9, priceNum: 1299, price: "₹1,299", avatarBg: "bg-teal-600" },
  "demo-2": { serviceName: "AC Service & Deep Clean", category: "Appliance Repair", professional: "Rahul Verma", rating: 4.7, priceNum: 799, price: "₹799", avatarBg: "bg-blue-600" },
  "demo-3": { serviceName: "Bathroom & Kitchen Sanitisation", category: "Cleaning", professional: "Sunita Patel", rating: 4.8, priceNum: 649, price: "₹649", avatarBg: "bg-purple-600" },
  "demo-4": { serviceName: "Haircut & Styling at Home", category: "Beauty", professional: "Anjali Mehta", rating: 5.0, priceNum: 549, price: "₹549", avatarBg: "bg-pink-600" },
  "demo-5": { serviceName: "Electrician – Wiring & Fixtures", category: "Electrical", professional: "Vikram Singh", rating: 4.6, priceNum: 449, price: "₹449", avatarBg: "bg-orange-600" },
  "demo-6": { serviceName: "Pest Control – Full Home", category: "Pest Control", professional: "Deepak Kumar", rating: 4.8, priceNum: 999, price: "₹999", avatarBg: "bg-green-700" },
  "demo-7": { serviceName: "Sofa & Carpet Steam Cleaning", category: "Cleaning", professional: "Meena Joshi", rating: 4.7, priceNum: 849, price: "₹849", avatarBg: "bg-indigo-600" },
  "demo-8": { serviceName: "Plumbing – Pipe Repair & Fitting", category: "Plumbing", professional: "Arjun Nair", rating: 4.5, priceNum: 399, price: "₹399", avatarBg: "bg-cyan-700" },
  "demo-9": { serviceName: "Facial & Skin Care at Home", category: "Beauty", professional: "Kavita Rao", rating: 4.9, priceNum: 699, price: "₹699", avatarBg: "bg-rose-600" },
  "demo-10": { serviceName: "Water Purifier Installation", category: "Appliance", professional: "Suresh Gupta", rating: 4.6, priceNum: 349, price: "₹349", avatarBg: "bg-slate-600" },
};

const DEMO_ADDRESSES = [
  { type: "Home", addressLine: "42, Lotus Tower, Sector 15", city: "Bengaluru", state: "Karnataka", pincode: "560078" },
  { type: "Work", addressLine: "Floor 7, TechPark One, Whitefield", city: "Bengaluru", state: "Karnataka", pincode: "560066" },
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00",
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

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
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function DemoRebookClient({ demoId }: { demoId: string }) {
  const router = useRouter();
  const data = DEMO_DATA[demoId];

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isAutoAssign, setIsAutoAssign] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dates = useMemo(() => generateDates(), []);

  if (!data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Service not found. <Link href="/rebook" className="font-bold underline">Go back</Link>
      </div>
    );
  }

  const subtotal = data.priceNum;
  const taxes = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + taxes;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "REBOOK20" || couponCode.toUpperCase() === "URBAN10") {
      setDiscount(couponCode.toUpperCase() === "REBOOK20" ? Math.round(subtotal * 0.2) : Math.round(subtotal * 0.1));
    }
  };

  const handleConfirm = async () => {
    const newErrors: Record<string, string> = {};
    if (!selectedDate) newErrors.date = "Please select a date.";
    if (!selectedTime) newErrors.time = "Please select a time slot.";
    if (!selectedAddress) newErrors.address = "Please select a service location.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 1500));
    setConfirming(false);
    setConfirmed(true);
  };

  /* ── CONFIRMATION SUCCESS ───────────────────────────────────────── */
  if (confirmed) {
    return (
      <div className="mx-auto max-w-md mt-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Booking Confirmed!</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your <strong>{data.serviceName}</strong> with <strong>{isAutoAssign ? "auto-assigned professional" : data.professional}</strong> has been rebooked.
          </p>

          <div className="w-full rounded-lg bg-slate-50 border border-slate-100 p-4 text-left flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-semibold text-slate-800">{new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-semibold text-slate-800">{selectedTime}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Professional</span><span className="font-semibold text-slate-800">{isAutoAssign ? "Auto-assigned" : data.professional}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className="font-semibold text-slate-800">{paymentMethod.replace("_", " ")}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
              <span className="font-bold text-slate-900 text-sm">Total Paid</span>
              <span className="font-bold text-teal-700 text-sm">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-1 w-full">
            <Link href="/rebook" className="flex-1 rounded-lg border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">Rebook Another</Link>
            <Link href="/dashboard" className="flex-1 rounded-lg bg-teal-600 py-2.5 text-center text-xs font-bold text-white hover:bg-teal-700 transition-colors">Go to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN REBOOK FORM ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header */}
      <div>
        <Link href="/rebook" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3 transition-colors">
          <ArrowLeft size={14} /> Back to Rebooking
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">One-Click Rebook</h1>
        <p className="text-sm text-slate-500 mt-1">
          Rebooking <strong>{data.serviceName}</strong>
          {!isAutoAssign && <> with <strong>{data.professional}</strong></>}.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* 1. Professional Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            {isAutoAssign ? (
              <div className="rounded-lg bg-amber-50 p-3.5 border border-amber-200">
                <p className="text-xs text-amber-800 font-medium mb-2">Auto-assignment enabled. We'll assign the best available professional.</p>
                <button type="button" onClick={() => setIsAutoAssign(false)} className="text-xs font-semibold text-teal-700 hover:underline transition-colors">
                  Stick with {data.professional} instead
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-full ${data.avatarBg} flex-shrink-0 flex items-center justify-center text-sm font-bold text-white`}>
                    {initials(data.professional)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{data.professional}</h4>
                      <span className="flex items-center gap-0.5 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full text-[11px] font-bold border border-amber-100">
                        <Star size={10} className="fill-amber-500 text-amber-500" /> {data.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Expert in {data.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <Award size={14} className="text-teal-600 flex-shrink-0" />
                    <div><p className="text-[9px] text-slate-400 font-bold uppercase">Experience</p><p className="font-semibold text-xs">5+ Years</p></div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <ShieldCheck size={14} className="text-teal-600 flex-shrink-0" />
                    <div><p className="text-[9px] text-slate-400 font-bold uppercase">Jobs Done</p><p className="font-semibold text-xs">1,240+</p></div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <Languages size={14} className="text-teal-600 flex-shrink-0" />
                    <div><p className="text-[9px] text-slate-400 font-bold uppercase">Speaks</p><p className="font-semibold text-xs">EN, HI</p></div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button type="button" onClick={() => setIsAutoAssign(true)} className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                    Change Professional (Auto-Assign)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Date Picker */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-3">
              <CalendarIcon size={16} className="text-teal-600" /> Select Date
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: "none" }}>
              {dates.map((d, i) => {
                const dateStr = d.toISOString().split("T")[0];
                const isSelected = selectedDate === dateStr;
                const isAvailable = i % 5 !== 4;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); setErrors((e) => ({ ...e, date: "" })); }}
                    className={`flex flex-col items-center justify-center min-w-[58px] h-[70px] rounded-lg border snap-start transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                        : isAvailable
                          ? "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50 text-slate-700"
                          : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase ${isSelected ? "text-teal-100" : "text-slate-400"}`}>
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className="text-lg font-black leading-tight">{d.getDate()}</span>
                    <span className={`text-[9px] font-bold ${isSelected ? "text-teal-100" : "text-slate-400"}`}>
                      {d.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.date && <p className="text-xs font-medium text-red-500 mt-1.5">{errors.date}</p>}
          </div>

          {/* 3. Time Slots */}
          <div className={`rounded-xl border shadow-sm p-4 transition-all duration-300 ${!selectedDate ? "opacity-50 pointer-events-none border-slate-200 bg-slate-50" : "border-slate-200 bg-white"}`}>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-3">
              <Clock size={16} className="text-teal-600" /> Select Time
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
              {TIME_SLOTS.map((t, i) => {
                const isSelected = selectedTime === t;
                const isAvailable = selectedDate ? (t.charCodeAt(1) + selectedDate.charCodeAt(selectedDate.length - 1) + i) % 4 !== 0 : true;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => { setSelectedTime(t); setErrors((e) => ({ ...e, time: "" })); }}
                    className={`py-2 rounded-lg border text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
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
            {errors.time && <p className="text-xs font-medium text-red-500 mt-2">{errors.time}</p>}
          </div>

          {/* 4. Address */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin size={16} className="text-teal-600" /> Service Location
              </h3>
              <button type="button" onClick={() => setIsNewAddress(!isNewAddress)} className="text-xs font-bold text-teal-600 flex items-center gap-1 hover:text-teal-800 transition-colors">
                {isNewAddress ? "Use Saved" : <><Plus size={14} /> Add New</>}
              </button>
            </div>
            {isNewAddress ? (
              <textarea
                className="w-full rounded-lg border border-slate-200 p-3 text-xs font-medium focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 min-h-[80px] outline-none transition-all placeholder:text-slate-400"
                placeholder="Enter full address, landmark, and pincode..."
                value={selectedAddress}
                onChange={(e) => { setSelectedAddress(e.target.value); setErrors((er) => ({ ...er, address: "" })); }}
              />
            ) : (
              <div className="flex flex-col gap-2.5">
                {DEMO_ADDRESSES.map((addr, i) => {
                  const str = `${addr.addressLine}, ${addr.city}, ${addr.state} ${addr.pincode}`.trim();
                  const isSelected = selectedAddress === str;
                  return (
                    <label
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected ? "border-teal-600 bg-teal-50/50 shadow-sm" : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                      }`}
                    >
                      <input type="radio" className="mt-0.5 flex-shrink-0 w-3.5 h-3.5 accent-teal-600" value={str} checked={isSelected} onChange={() => { setSelectedAddress(str); setErrors((er) => ({ ...er, address: "" })); }} />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{addr.type}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{str}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {errors.address && <p className="text-xs font-bold text-red-500 mt-2">{errors.address}</p>}
          </div>

          {/* 5. Special Instructions */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Special Instructions</h3>
            <p className="text-xs text-slate-500 mb-2">Any details the professional should know?</p>
            <textarea
              className="w-full rounded-lg border border-slate-200 p-3 text-xs font-medium focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none resize-none transition-all placeholder:text-slate-400"
              placeholder="E.g., Call before reaching, bring specific tools..."
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN: Price Summary ──────────────────────────── */}
        <div className="lg:w-[280px] flex-shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 sticky top-20">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-3">Booking Summary</h3>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-slate-600 leading-tight font-medium max-w-[140px]">{data.serviceName}</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-teal-600 font-bold">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Taxes & Fee (18%)</span>
                <span>{formatCurrency(taxes)}</span>
              </div>

              {selectedDate && selectedTime && (
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 mt-1">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px]">
                    <CalendarIcon size={12} className="text-teal-600" />
                    {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px] mt-1">
                    <Clock size={12} className="text-teal-600" />
                    {selectedTime}
                  </p>
                </div>
              )}

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm uppercase tracking-wide">Total</span>
                <span className="font-bold text-teal-700 text-base">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-4">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Promo code"
                    disabled={discount > 0}
                    className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-2 text-xs font-semibold uppercase outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                {discount > 0 ? (
                  <button type="button" onClick={() => { setDiscount(0); setCouponCode(""); }} className="rounded-lg bg-red-50 text-red-600 border border-red-200 px-3 py-2 text-xs font-bold hover:bg-red-100 transition-colors">
                    Remove
                  </button>
                ) : (
                  <button type="button" onClick={handleApplyCoupon} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors">
                    Apply
                  </button>
                )}
              </div>
              {discount === 0 && (
                <p className="text-[10px] text-slate-400 mt-1 ml-0.5">Try <span className="font-bold">REBOOK20</span> or <span className="font-bold">URBAN10</span></p>
              )}
            </div>

            {/* Payment */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Pay With</p>
              <div className="grid grid-cols-2 gap-2">
                {["CREDIT_CARD", "UPI"].map((method) => (
                  <label
                    key={method}
                    className={`flex cursor-pointer items-center justify-center rounded-lg border py-2 transition-all ${
                      paymentMethod === method
                        ? "border-teal-600 bg-teal-50 text-teal-800"
                        : "border-slate-200 bg-white hover:border-teal-200 text-slate-600"
                    }`}
                  >
                    <input type="radio" value={method} className="hidden" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                    <span className="text-[10px] font-bold tracking-wide">{method.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Confirm */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirming}
              className="mt-4 w-full rounded-lg bg-teal-600 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {confirming ? (
                <><Loader2 size={14} className="animate-spin" /> Confirming…</>
              ) : (
                <><RotateCw size={14} /> Confirm Rebooking</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
