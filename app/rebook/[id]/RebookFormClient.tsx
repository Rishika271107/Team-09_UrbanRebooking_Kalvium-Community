"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { rebookAction } from "@/lib/actions/booking.actions";

// Note: For a real app we'd fetch this initial data server-side and pass as props, 
// but since the form is complex we'll mix Server Actions with client components.
const rebookSchema = z.object({
  originalBookingId: z.string().min(1),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  addressId: z.string().min(1, "Please select an address"),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI", "CASH"]),
});

type RebookFormValues = z.infer<typeof rebookSchema>;

export default function RebookFormClient({
  originalBookingId,
  addresses,
  serviceName,
  professionalName,
}: {
  originalBookingId: string;
  addresses: any[];
  serviceName: string;
  professionalName: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RebookFormValues>({
    resolver: zodResolver(rebookSchema),
    defaultValues: {
      originalBookingId,
      addressId: addresses.find(a => a.isDefault)?.id || (addresses.length > 0 ? addresses[0].id : ""),
      paymentMethod: "CREDIT_CARD",
    },
  });

  const onSubmit = async (data: RebookFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      
      const result = await rebookAction(formData);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push(`/bookings/confirmation/${result.newBookingId}`);
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Date & Time Selection */}
      <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-900 border-b pb-3">When do you need the service?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Date</label>
            <input 
              type="date" 
              className="rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              {...register("date")}
            />
            {errors.date && <span className="text-xs text-red-500">{errors.date.message}</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Time</label>
            <input 
              type="time" 
              className="rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              {...register("time")}
            />
            {errors.time && <span className="text-xs text-red-500">{errors.time.message}</span>}
          </div>
        </div>
      </div>

      {/* Address Selection */}
      <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Service Address</h3>
        
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <label key={address.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 [&:has(:checked)]:border-teal-500 [&:has(:checked)]:bg-teal-50">
              <input 
                type="radio" 
                value={address.id} 
                className="mt-1 accent-teal-600"
                {...register("addressId")}
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">Address</span>
                <span className="text-sm text-slate-500">{address.addressLine}, {address.city}, {address.state} {address.pincode}</span>
              </div>
            </label>
          ))}
          {errors.addressId && <span className="text-xs text-red-500">{errors.addressId.message}</span>}
        </div>
      </div>

      {/* Payment Selection */}
      <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Payment Method</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {["CREDIT_CARD", "DEBIT_CARD", "UPI", "CASH"].map((method) => (
            <label key={method} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 [&:has(:checked)]:border-teal-500 [&:has(:checked)]:bg-teal-50">
              <input 
                type="radio" 
                value={method} 
                className="accent-teal-600"
                {...register("paymentMethod")}
              />
              <span className="font-medium text-slate-700">{method.replace("_", " ")}</span>
            </label>
          ))}
        </div>
        {errors.paymentMethod && <span className="text-xs text-red-500">{errors.paymentMethod.message}</span>}
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-teal-600 px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-teal-700 disabled:opacity-70 flex items-center justify-center min-w-[200px]"
        >
          {isSubmitting ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : (
            "Confirm Rebooking"
          )}
        </button>
      </div>
    </form>
  );
}
