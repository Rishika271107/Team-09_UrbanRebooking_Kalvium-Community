"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { rebookAction } from "@/lib/actions/booking.actions";
import { formatCurrency } from "@/lib/format";
import { 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  Star, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Award,
  Languages,
  Plus,
  Tag,
  User,
  Loader2
} from "lucide-react";
import { toast } from "@/components/ErrorComponents";

/* ── Zod Schema ──────────────────────────────────────────────────────── */
const rebookSchema = z.object({
  originalBookingId: z.string().min(1),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  addressId: z.string().min(5, "Please enter your full address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI", "CASH"]),
  specialInstructions: z.string().optional(),
});

type RebookFormValues = z.infer<typeof rebookSchema>;

const STEPS = [
  { id: 1, title: "Professional" },
  { id: 2, title: "Schedule" },
  { id: 3, title: "Review" }
];

/* ── Mocks ──────────────────────────────────────────────────────────── */
const generateMockDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", 
  "18:00"
];

/* ── Main Component ─────────────────────────────────────────────────── */
export default function RebookFormClient({
  originalBookingId,
  addresses,
  serviceName,
  servicePrice,
  professionalName,
  isProfessionalActive,
}: {
  originalBookingId: string;
  addresses: any[];
  serviceName: string;
  servicePrice: number;
  professionalName: string;
  isProfessionalActive?: boolean;
}) {
  const router = useRouter();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [isAutoAssign, setIsAutoAssign] = useState(false);

  const dates = useMemo(() => generateMockDates(), []);

  // Form Setup
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
  const defaultAddressStr = defaultAddress 
    ? `${defaultAddress.addressLine}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.pincode}`.trim()
    : "";

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<RebookFormValues>({
    resolver: zodResolver(rebookSchema),
    defaultValues: {
      originalBookingId,
      addressId: defaultAddressStr,
      phone: "9876543210", // Mock phone since it's not strictly passed in props for this phase
      paymentMethod: "CREDIT_CARD",
      date: "",
      time: "",
      specialInstructions: "",
    },
  });

  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const selectedAddress = watch("addressId");

  const handleNext = async () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = true;
    } else if (currentStep === 2) {
      isValid = await trigger(["date", "time"]);
    } else if (currentStep === 3) {
      isValid = await trigger(["addressId", "phone"]);
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "URBAN20") {
      setDiscount(servicePrice * 0.20);
      toast({
        type: "success",
        title: "Coupon Applied",
        message: "20% discount applied."
      });
    } else {
      toast({
        type: "error",
        title: "Invalid Coupon",
        message: "Try coupon code URBAN20."
      });
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponCode("");
    toast({
      type: "info",
      title: "Coupon Removed",
      message: "Discount removed from booking."
    });
  };

  const onSubmit = async (data: RebookFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      
      const result = await rebookAction(formData);
      
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else if (result.success) {
        setShowToast(true);
        setTimeout(() => {
          router.push(`/bookings/${result.newBookingId}`);
        }, 2000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  // Derived styling helpers
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const avatarInitials = getInitials(professionalName || "Pro");
  const subtotal = servicePrice;
  const taxes = subtotal * 0.18; // 18% tax mock
  const total = subtotal - discount + taxes;

  return (
    <div className="relative mx-auto max-w-3xl">
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-teal-600 px-6 py-3 text-white shadow-lg transition-all animate-in fade-in slide-in-from-bottom-5">
          Your booking has been successfully rebooked.
        </div>
      )}

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-200 -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#047260] transition-all duration-300 -z-10"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>
          
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
              <div 
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                  currentStep >= step.id 
                    ? "border-[#047260] bg-[#047260] text-white" 
                    : "border-slate-300 bg-white text-slate-400"
                }`}
              >
                {currentStep > step.id ? <CheckCircle2 size={16} /> : step.id}
              </div>
              <span className={`text-xs font-semibold ${currentStep >= step.id ? "text-slate-900" : "text-slate-400"}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* ── STEP 1: Professional & Service ── */}
        <div className={currentStep === 1 ? "block animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Rebooking Service</h2>
                <p className="text-slate-500 mt-1">{serviceName}</p>
              </div>
                   {isProfessionalActive === false || isAutoAssign ? (
                 <div className="rounded-xl bg-amber-50 p-5 border border-amber-200">
                  <p className="text-sm text-amber-850 font-medium mb-3">
                    {isAutoAssign 
                      ? "Auto-assignment enabled. We will assign the next best highly-rated professional for this service." 
                      : `Your previous professional (${professionalName}) is currently unavailable. We will assign the next best highly-rated professional for this service.`}
                  </p>
                  {isProfessionalActive !== false && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsAutoAssign(false);
                        toast({ type: "info", title: "Professional Assigned", message: `Stick with ${professionalName}` });
                      }}
                      className="text-xs font-semibold text-[#047260] hover:underline"
                    >
                      Stick with {professionalName} instead
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Photo/Avatar */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-24 w-24 rounded-full bg-teal-100 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-teal-700">
                        {avatarInitials}
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-sm font-bold">
                        <Star size={14} className="fill-yellow-600" />
                        4.9
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div>
                        <h4 className="text-2xl font-bold text-slate-900">{professionalName || "Aarav Sharma"}</h4>
                        <p className="text-slate-500">Expert in {serviceName.split(" ")[0]}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Award size={18} className="text-teal-600" />
                          <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase">Experience</p>
                            <p className="font-medium text-sm">5+ Years</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <ShieldCheck size={18} className="text-teal-600" />
                          <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase">Jobs Done</p>
                            <p className="font-medium text-sm">1,240+</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 col-span-2">
                          <Languages size={18} className="text-teal-600" />
                          <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase">Speaks</p>
                            <p className="font-medium text-sm">English, Hindi</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsAutoAssign(true);
                        toast({ type: "info", title: "Switched to Auto-Assign", message: "We'll search for available professionals." });
                      }}
                      className="text-xs font-semibold text-[#047260] hover:underline"
                    >
                      Change Professional (Auto-Assign next best)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STEP 2: Interactive Calendar ── */}
        <div className={currentStep === 2 ? "block animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
          <div className="flex flex-col gap-6">
            
            {/* Date Picker */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <CalendarIcon className="text-teal-600" /> Select Date
              </h3>
              
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x no-scrollbar">
                {dates.map((d, i) => {
                  const dateStr = d.toISOString().split('T')[0];
                  const isSelected = selectedDate === dateStr;
                  // Mock availability: Make every 5th date unavailable
                  const isAvailable = i % 5 !== 4; 
                  
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setValue("date", dateStr, { shouldValidate: true })}
                      className={`flex flex-col items-center justify-center min-w-[72px] h-20 rounded-xl border snap-start transition-all ${
                        isSelected 
                          ? "border-[#047260] bg-[#047260] text-white shadow-md" 
                          : isAvailable
                            ? "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50 text-slate-700"
                            : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                      <span className="text-xl font-bold mt-0.5">{d.getDate()}</span>
                      <span className="text-[10px] mt-1">{d.toLocaleDateString("en-US", { month: "short" })}</span>
                    </button>
                  );
                })}
              </div>
              {errors.date && <p className="text-sm text-red-500 mt-2">{errors.date.message}</p>}
            </div>

            {/* Time Picker */}
            <div className={`rounded-2xl border shadow-sm p-6 transition-all ${!selectedDate ? "opacity-50 pointer-events-none border-slate-200 bg-slate-50" : "border-slate-200 bg-white"}`}>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Clock className="text-teal-600" /> Select Time
              </h3>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {TIME_SLOTS.map((t, i) => {
                  const isSelected = selectedTime === t;
                  // Mock some unavailable times based on date string length trick
                  const isAvailable = selectedDate ? (t.charCodeAt(1) + selectedDate.charCodeAt(selectedDate.length-1) + i) % 4 !== 0 : true;

                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setValue("time", t, { shouldValidate: true })}
                      className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                        isSelected 
                          ? "border-[#047260] bg-[#047260] text-white shadow-md" 
                          : isAvailable
                            ? "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                            : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through decoration-slate-300"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              {errors.time && <p className="text-sm text-red-500 mt-4">{errors.time.message}</p>}
            </div>

          </div>
        </div>

        {/* ── STEP 3: Address & Details ── */}
        <div className={currentStep === 3 ? "block animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Col: Forms */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              
              {/* Address */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="text-teal-600" /> Service Location
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setIsNewAddress(!isNewAddress)}
                    className="text-sm font-semibold text-teal-600 flex items-center gap-1 hover:underline"
                  >
                    {isNewAddress ? "Use Saved" : <><Plus size={14} /> Add New</>}
                  </button>
                </div>
                
                {isNewAddress ? (
                  <textarea 
                    className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 min-h-[100px] outline-none"
                    placeholder="Enter full address, landmark, and pincode..."
                    {...register("addressId")}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {addresses.map((addr, i) => {
                      const str = `${addr.addressLine}, ${addr.city}, ${addr.state} ${addr.pincode}`.trim();
                      return (
                        <label key={i} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedAddress === str ? "border-[#047260] bg-teal-50/30" : "border-slate-200 hover:bg-slate-50"}`}>
                          <input 
                            type="radio" 
                            className="mt-1 accent-teal-600"
                            value={str}
                            {...register("addressId")}
                          />
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{addr.type || "Home"}</p>
                            <p className="text-sm text-slate-500 mt-1">{str}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
                {errors.addressId && <p className="text-sm text-red-500 mt-2">{errors.addressId.message}</p>}
              </div>

              {/* Instructions */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                 <h3 className="text-lg font-bold text-slate-900 mb-2">Special Instructions</h3>
                 <p className="text-sm text-slate-500 mb-4">Any specific details the professional should know?</p>
                 <textarea 
                    className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
                    placeholder="E.g., Call before reaching, bring specific tools..."
                    rows={2}
                    {...register("specialInstructions")}
                  />
              </div>

            </div>

            {/* Right Col: Price Summary */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">Booking Summary</h3>
                
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-600 max-w-[150px] leading-tight">{serviceName}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-teal-600 font-medium">
                      <span>Discount (URBAN20)</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Taxes & Fee (18%)</span>
                    <span>{formatCurrency(taxes)}</span>
                  </div>
                  
                  {selectedDate && selectedTime && (
                    <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1"><CalendarIcon size={12}/> {new Date(selectedDate).toLocaleDateString("en-US", { weekday:"long", month: "long", day: "numeric" })}</p>
                      <p className="flex items-center gap-1.5"><Clock size={12}/> {selectedTime}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-lg">Total</span>
                    <span className="font-bold text-[#047260] text-2xl">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Promo code" 
                        disabled={discount > 0}
                        className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm uppercase outline-none focus:border-teal-500 disabled:bg-slate-50"
                      />
                    </div>
                    {discount > 0 ? (
                      <button 
                        type="button" 
                        onClick={removeCoupon}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                      >
                        Remove
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={applyCoupon}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pay With</p>
                   <div className="grid grid-cols-2 gap-2">
                    {["CREDIT_CARD", "UPI"].map((method) => (
                      <label key={method} className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 hover:bg-slate-50 [&:has(:checked)]:border-teal-500 [&:has(:checked)]:bg-teal-50">
                        <input type="radio" value={method} className="accent-teal-600 hidden" {...register("paymentMethod")} />
                        <span className="text-xs font-bold text-slate-700">{method.replace("_", " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Buttons ── */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={currentStep === 1 ? () => router.back() : handleBack}
            className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={18} />
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-[#047260] px-8 py-3 font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[#047260] px-10 py-3 font-bold text-white shadow-md hover:bg-teal-700 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                "Confirm Booking"
              )}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
