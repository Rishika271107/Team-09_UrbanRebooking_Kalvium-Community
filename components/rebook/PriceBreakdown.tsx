import React from "react";
import { formatCurrency } from "@/lib/format";
import { Calendar as CalendarIcon, Clock, Tag } from "lucide-react";

interface PriceBreakdownProps {
  serviceName: string;
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  selectedDate: string;
  selectedTime: string;
  couponCode: string;
  onCouponCodeChange: (code: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

export function PriceBreakdown({
  serviceName,
  subtotal,
  discount,
  taxes,
  total,
  selectedDate,
  selectedTime,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  paymentMethod,
  onPaymentMethodChange,
}: PriceBreakdownProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sticky top-24">
      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">Booking Summary</h3>
      
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex justify-between items-start">
          <span className="text-slate-600 max-w-[150px] leading-tight font-medium">{serviceName}</span>
          <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-teal-600 font-bold">
            <span>Discount (Applied)</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600 font-medium">
          <span>Taxes & Fee (18%)</span>
          <span>{formatCurrency(taxes)}</span>
        </div>
        
        {selectedDate && selectedTime && (
          <div className="mt-2 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <CalendarIcon size={14} className="text-teal-600"/> 
              {new Date(selectedDate).toLocaleDateString("en-US", { weekday:"long", month: "long", day: "numeric" })}
            </p>
            <p className="font-bold text-slate-800 flex items-center gap-2">
              <Clock size={14} className="text-teal-600"/> 
              {selectedTime}
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="font-black text-slate-900 text-lg uppercase tracking-wider">Total</span>
          <span className="font-black text-teal-700 text-2xl">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Coupon section */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={couponCode}
              onChange={(e) => onCouponCodeChange(e.target.value)}
              placeholder="Promo code" 
              disabled={discount > 0}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm font-semibold uppercase outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          {discount > 0 ? (
            <button 
              type="button" 
              onClick={onRemoveCoupon}
              className="rounded-xl bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-red-100"
            >
              Remove
            </button>
          ) : (
            <button 
              type="button" 
              onClick={onApplyCoupon}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 shadow-md"
            >
              Apply
            </button>
          )}
        </div>
      </div>

      {/* Payment methods */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Pay With</p>
        <div className="grid grid-cols-2 gap-3">
          {["CREDIT_CARD", "UPI"].map((method) => (
            <label 
              key={method} 
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-3 transition-all ${
                paymentMethod === method 
                  ? "border-teal-600 bg-teal-50 text-teal-800" 
                  : "border-slate-100 bg-white hover:border-teal-200 text-slate-600"
              }`}
            >
              <input 
                type="radio" 
                value={method} 
                className="hidden" 
                checked={paymentMethod === method}
                onChange={() => onPaymentMethodChange(method)} 
              />
              <span className="text-xs font-bold tracking-wide">{method.replace("_", " ")}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
