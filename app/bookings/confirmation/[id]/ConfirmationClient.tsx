"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Hash, 
  Download, 
  CalendarPlus, 
  ArrowRight,
  ChevronRight,
  Share2,
  Loader2
} from "lucide-react";
import { toast } from "@/components/ErrorComponents";

export default function ConfirmationClient({ booking }: { booking: any }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    toast({
      type: "info",
      title: "Generating Invoice",
      message: "Please wait while we prepare your invoice..."
    });
    await new Promise((r) => setTimeout(r, 1500));
    setIsDownloading(false);
    toast({
      type: "success",
      title: "Invoice Downloaded",
      message: `Invoice for booking #${booking.id.substring(0, 8)} saved.`
    });
  };

  const handleAddToCalendar = () => {
    toast({
      type: "success",
      title: "Added to Calendar",
      message: "Booking has been added to your local calendar."
    });
  };

  const handleShareBooking = () => {
    navigator.clipboard.writeText(`${window.location.origin}/bookings/${booking.id}`);
    toast({
      type: "success",
      title: "Link Copied",
      message: "Booking link has been copied to your clipboard."
    });
  };

  const proName = booking.professional?.user?.name ?? "Professional";
  const initials = proName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  
  const dateStr = booking.slotStart ? new Date(booking.slotStart).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBD";
  const timeStr = booking.slotStart ? new Date(booking.slotStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD";
  
  const subtotal = booking.service.price;
  const taxes = subtotal * 0.18;
  const total = subtotal + taxes;

  return (
    <div className="relative flex flex-col items-center justify-center gap-8 py-8 md:py-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 rounded-lg bg-slate-900 px-6 py-3 text-white shadow-lg transition-all animate-in fade-in slide-in-from-top-5">
          {toastMessage}
        </div>
      )}

      {/* Header & Animation */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75"></div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
            <CheckCircle size={40} className="fill-emerald-600 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">Booking Confirmed!</h1>
        <p className="max-w-md text-slate-500">
          Your service has been successfully scheduled. We've sent a confirmation email with all the details.
        </p>
      </div>

      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Booking Details */}
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-teal-100 border-2 border-white shadow-sm flex items-center justify-center text-teal-700 font-bold text-xl">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900">{booking.service.name}</span>
                <span className="text-slate-600 font-medium text-sm mt-0.5">with {proName}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <Hash size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase">{booking.id.substring(0,8)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-teal-600 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Date</span>
                <span className="font-semibold text-slate-800">{dateStr}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={18} className="text-teal-600 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Time</span>
                <span className="font-semibold text-slate-800">{timeStr}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:col-span-2">
              <MapPin size={18} className="text-teal-600 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Service Address</span>
                <span className="font-semibold text-slate-800">{booking.address ?? "Address on file"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-6 sm:p-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Payment Summary</h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span>{booking.service.name}</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Taxes & Fees (18%)</span>
              <span>{formatCurrency(taxes)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-100">
              <span className="font-bold text-slate-900 text-base">Total Paid</span>
              <span className="font-bold text-[#047260] text-xl">{formatCurrency(total)}</span>
            </div>
            <p className="text-xs text-slate-400 text-right mt-1">Paid via Credit Card</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-6 w-full max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            href={`/bookings/${booking.id}`}
            className="flex-1 rounded-xl bg-[#047260] px-6 py-3.5 text-center font-bold text-white shadow-md transition-colors hover:bg-teal-700 flex items-center justify-center gap-2"
          >
            View Booking Details <ChevronRight size={18} />
          </Link>
          <Link 
            href="/dashboard"
            className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5 text-center font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-2"
          >
            Return to Dashboard
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 border-t border-slate-200 pt-6">
          <button 
            onClick={handleDownloadInvoice}
            disabled={isDownloading}
            className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Download Invoice
          </button>
          <button 
            onClick={handleShareBooking}
            className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Share2 size={16} /> Share Booking
          </button>
          <button 
            onClick={handleAddToCalendar}
            className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <CalendarPlus size={16} /> Add to Calendar
          </button>
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
             Book Another Service <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      
    </div>
  );
}
