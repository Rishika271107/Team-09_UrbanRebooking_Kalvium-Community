import React from "react";

export interface PriceLineItem {
  label: string;
  amount: number;
  isDiscount?: boolean;
}

export interface PriceBreakdownCardProps {
  items: PriceLineItem[];
  total: number;
  title?: string;
  className?: string;
  currencyPrefix?: string;
}

export function PriceBreakdownCard({
  items,
  total,
  title = "Price Breakdown",
  className = "",
  currencyPrefix = "$",
}: PriceBreakdownCardProps) {
  const formatCurrency = (amount: number) => {
    return `${currencyPrefix}${amount.toFixed(2)}`;
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
          {title}
        </h3>
      )}
      
      <div className="flex flex-col gap-4 text-sm">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={`flex justify-between items-start ${item.isDiscount ? "text-teal-600 font-medium" : "text-slate-600"}`}
          >
            <span className="max-w-[150px] sm:max-w-[200px] leading-tight">{item.label}</span>
            <span>
              {item.isDiscount ? "-" : ""}
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
        
        <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2 font-bold text-lg text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
