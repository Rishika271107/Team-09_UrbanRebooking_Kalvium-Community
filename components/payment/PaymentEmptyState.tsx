import React from "react";
import { CreditCard } from "lucide-react";

interface PaymentEmptyStateProps {
  onAddPayment: () => void;
}

export function PaymentEmptyState({ onAddPayment }: PaymentEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
      <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
        <CreditCard size={24} />
      </div>
      <h3 className="text-sm font-bold text-slate-900">No payment methods</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">You haven't saved any payment methods yet.</p>
      <button
        onClick={onAddPayment}
        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        Add payment method
      </button>
    </div>
  );
}
