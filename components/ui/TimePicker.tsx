import React from "react";
import { Clock } from "lucide-react";

export interface TimePickerProps {
  slots: string[];
  selectedSlot: string;
  onSelect: (timeStr: string) => void;
  title?: string;
  className?: string;
}

export function TimePicker({
  slots,
  selectedSlot,
  onSelect,
  title = "Select Time",
  className = "",
}: TimePickerProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Clock className="text-teal-600" aria-hidden="true" /> {title}
        </h3>
      )}
      
      <div 
        className="grid grid-cols-3 sm:grid-cols-4 gap-3 focus:outline-none" 
        role="radiogroup" 
        aria-label={title}
      >
        {slots.length === 0 ? (
          <div className="col-span-full py-4 text-center text-sm text-slate-500">
            No time slots available for this date.
          </div>
        ) : (
          slots.map((time, i) => {
            const isSelected = selectedSlot === time;
            
            return (
              <label 
                key={i}
                className={`flex items-center justify-center py-3 px-2 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? "border-[#047260] bg-[#047260] text-white shadow-sm" 
                    : "border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white text-slate-700"
                }`}
              >
                <input 
                  type="radio" 
                  name="time-picker"
                  className="sr-only"
                  value={time}
                  checked={isSelected}
                  onChange={() => onSelect(time)}
                />
                <span className={`text-sm font-bold tracking-tight`}>
                  {time}
                </span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
