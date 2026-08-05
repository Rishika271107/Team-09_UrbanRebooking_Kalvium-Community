"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { rebookAction } from "@/lib/actions/booking.actions";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ErrorComponents";

import { BookingSummary } from "@/components/rebook/BookingSummary";
import { ProfessionalCard } from "@/components/rebook/ProfessionalCard";
import { SlotCalendar } from "@/components/rebook/SlotCalendar";
import { ConfirmationCard } from "@/components/rebook/ConfirmationCard";
import { PriceBreakdown } from "@/components/rebook/PriceBreakdown";

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
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isAutoAssign, setIsAutoAssign] = useState(false);

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
  const defaultAddressStr = defaultAddress 
    ? `${defaultAddress.addressLine}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.pincode}`.trim()
    : "";

  const { handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<RebookFormValues>({
    resolver: zodResolver(rebookSchema),
    defaultValues: {
      originalBookingId,
      addressId: defaultAddressStr,
      phone: "9876543210", 
      paymentMethod: "CREDIT_CARD",
      date: "",
      time: "",
      specialInstructions: "",
    },
  });

  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const selectedAddress = watch("addressId");
  const specialInstructions = watch("specialInstructions") || "";
  const paymentMethod = watch("paymentMethod");

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) isValid = true;
    else if (currentStep === 2) isValid = await trigger(["date", "time"]);
    else if (currentStep === 3) isValid = await trigger(["addressId", "phone"]);

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
      toast({ type: "success", title: "Coupon Applied", message: "20% discount applied." });
    } else {
      toast({ type: "error", title: "Invalid Coupon", message: "Try coupon code URBAN20." });
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponCode("");
    toast({ type: "info", title: "Coupon Removed", message: "Discount removed from booking." });
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

  const subtotal = servicePrice;
  const taxes = subtotal * 0.18;
  const total = subtotal - discount + taxes;

  return (
    <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-8">
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-teal-600 px-6 py-3 font-bold text-white shadow-xl transition-all animate-in fade-in slide-in-from-bottom-5">
          🎉 Your booking has been successfully confirmed!
        </div>
      )}

      <BookingSummary 
        serviceName={serviceName} 
        price={servicePrice} 
        originalBookingId={originalBookingId} 
      />

      {/* Stepper */}
      <div className="mb-10 px-4">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-slate-100 rounded-full -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-[#047260] rounded-full transition-all duration-500 ease-in-out -z-10"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>
          
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-3 py-1">
              <div 
                className={`flex h-10 w-10 items-center justify-center rounded-full border-4 text-sm font-bold transition-all duration-300 ${
                  currentStep >= step.id 
                    ? "border-teal-100 bg-[#047260] text-white shadow-md" 
                    : "border-slate-100 bg-white text-slate-400"
                }`}
              >
                {currentStep > step.id ? <CheckCircle2 size={18} /> : step.id}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= step.id ? "text-slate-900" : "text-slate-400"}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        <div className={currentStep === 1 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
          <ProfessionalCard 
            professionalName={professionalName || "Aarav Sharma"}
            serviceName={serviceName}
            isActive={isProfessionalActive}
            isAutoAssign={isAutoAssign}
            onToggleAutoAssign={setIsAutoAssign}
          />
        </div>

        {/* STEP 2 */}
        <div className={currentStep === 2 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
          <SlotCalendar 
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={(date) => setValue("date", date, { shouldValidate: true })}
            onTimeSelect={(time) => setValue("time", time, { shouldValidate: true })}
            dateError={errors.date?.message}
            timeError={errors.time?.message}
          />
        </div>

        {/* STEP 3 */}
        <div className={currentStep === 3 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-3">
              <ConfirmationCard 
                addresses={addresses}
                selectedAddress={selectedAddress}
                onAddressSelect={(addr) => setValue("addressId", addr, { shouldValidate: true })}
                addressError={errors.addressId?.message}
                specialInstructions={specialInstructions}
                onInstructionsChange={(val) => setValue("specialInstructions", val)}
              />
            </div>
            <div className="lg:col-span-2">
              <PriceBreakdown 
                serviceName={serviceName}
                subtotal={subtotal}
                discount={discount}
                taxes={taxes}
                total={total}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                couponCode={couponCode}
                onCouponCodeChange={setCouponCode}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={(val) => setValue("paymentMethod", val as any)}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t-2 border-slate-100 pt-8">
          <button
            type="button"
            onClick={currentStep === 1 ? () => router.back() : handleBack}
            className="flex items-center gap-2 rounded-xl px-5 sm:px-6 py-3 font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={18} />
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 sm:px-8 py-3.5 font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:scale-[1.02]"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-8 sm:px-10 py-3.5 font-bold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
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
