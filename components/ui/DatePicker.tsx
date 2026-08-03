import React from "react";
import { CalendarIcon } from "lucide-react";

export interface DatePickerProps {
  dates: Date[];
  selectedDate: string;
  onSelect: (dateStr: string) => void;
  title?: string;
  className?: string;
}

export function DatePicker({
  dates,
  selectedDate,
  onSelect,
  title = "Select Date",
  className = "",
}: DatePickerProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <CalendarIcon className="text-teal-600" aria-hidden="true" /> {title}
        </h3>
      )}
      
      <div 
        className="flex gap-3 overflow-x-auto pb-4 snap-x no-scrollbar focus:outline-none" 
        role="radiogroup" 
        aria-label={title}
      >
        {dates.map((d, i) => {
          const dateStr = d.toISOString().split('T')[0];
          const isSelected = selectedDate === dateStr;
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = d.getDate();
          const month = d.toLocaleDateString('en-US', { month: 'short' });
          
          return (
            <label 
              key={i}
              className={`snap-start shrink-0 flex flex-col items-center justify-center min-w-[72px] h-[90px] rounded-2xl border-2 cursor-pointer transition-all ${
                isSelected 
                  ? "border-[#047260] bg-teal-50/50 shadow-sm shadow-teal-100/50" 
                  : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input 
                type="radio" 
                name="date-picker"
                className="sr-only"
                value={dateStr}
                checked={isSelected}
                onChange={() => onSelect(dateStr)}
              />
              <span className={`text-xs font-semibold ${isSelected ? "text-[#047260]" : "text-slate-500"}`}>
                {dayName}
              </span>
              <span className={`text-2xl font-black mt-1 ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                {dayNum}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-[#047260]" : "text-slate-400"}`}>
                {month}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
