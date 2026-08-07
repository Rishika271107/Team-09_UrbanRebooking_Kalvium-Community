import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, CreditCard } from "lucide-react";

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits").max(16, "Card number must be 16 digits"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Invalid expiry (MM/YY)"),
  cvc: z.string().min(3, "CVC must be 3 or 4 digits").max(4, "CVC must be 3 or 4 digits"),
  nameOnCard: z.string().min(2, "Name is required"),
});

interface AddPaymentModalProps {
  onClose: () => void;
  onAdd: (data: { cardType: string; lastFour: string; provider: string }) => Promise<void>;
}

export function AddPaymentModal({ onClose, onAdd }: AddPaymentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: { cardNumber: "", expiry: "", cvc: "", nameOnCard: "" },
  });

  const onSubmit = (data: z.infer<typeof paymentSchema>) => {
    startTransition(async () => {
      try {
        // Determine card type based on first digit
        let cardType = "Visa";
        if (data.cardNumber.startsWith("5")) cardType = "Mastercard";
        if (data.cardNumber.startsWith("3")) cardType = "Amex";

        const lastFour = data.cardNumber.slice(-4);

        await onAdd({ cardType, lastFour, provider: "Stripe" });
        onClose();
      } catch (err) {
        setError("Failed to add payment method. Please try again.");
      }
    });
  };

  const inputCls = "px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors placeholder:text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
        
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add Payment Method</h3>
            <p className="text-xs text-slate-500">Securely save your card details</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-500">Card Number</label>
            <input
              {...form.register("cardNumber")}
              className={inputCls}
              placeholder="0000 0000 0000 0000"
              maxLength={16}
            />
            {form.formState.errors.cardNumber && <span className="text-xs text-red-500">{form.formState.errors.cardNumber.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-500">Name on Card</label>
            <input
              {...form.register("nameOnCard")}
              className={inputCls}
              placeholder="John Doe"
            />
            {form.formState.errors.nameOnCard && <span className="text-xs text-red-500">{form.formState.errors.nameOnCard.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-500">Expiry</label>
              <input
                {...form.register("expiry")}
                className={inputCls}
                placeholder="MM/YY"
                maxLength={5}
              />
              {form.formState.errors.expiry && <span className="text-xs text-red-500">{form.formState.errors.expiry.message}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-500">CVC</label>
              <input
                {...form.register("cvc")}
                className={inputCls}
                placeholder="123"
                type="password"
                maxLength={4}
              />
              {form.formState.errors.cvc && <span className="text-xs text-red-500">{form.formState.errors.cvc.message}</span>}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? "Saving..." : "Save Card"}
          </button>
        </form>
      </div>
    </div>
  );
}
