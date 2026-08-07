import React, { useMemo } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface SlotCalendarProps {
  selectedDate: string;
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  dateError?: string;
  timeError?: string;
}

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

export function SlotCalendar({ selectedDate, selectedTime, onDateSelect, onTimeSelect, dateError, timeError }: SlotCalendarProps) {
  const dates = useMemo(() => generateMockDates(), []);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
          <CalendarIcon className="text-teal-600" /> Select Date
        </h3>
        
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x no-scrollbar">
          {dates.map((d, i) => {
            const dateStr = d.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            const isAvailable = i % 5 !== 4; // Mock logic
            
            return (
              <button
                key={dateStr}
                type="button"
                disabled={!isAvailable}
                onClick={() => onDateSelect(dateStr)}
                aria-label={isAvailable ? `Select ${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}` : `${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} - Unavailable`}
                aria-pressed={isSelected}
                className={`flex flex-col items-center justify-center min-w-[80px] h-24 rounded-xl border-2 snap-start transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  isSelected 
                    ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-500/20 scale-105" 
                    : isAvailable
                      ? "border-slate-100 bg-white hover:border-teal-300 hover:bg-teal-50 text-slate-700"
                      : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-60"
                }`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-teal-100' : ''}`}>
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-2xl font-black mt-0.5">{d.getDate()}</span>
                <span className={`text-[10px] font-bold ${isSelected ? 'text-teal-100' : ''}`}>
                  {d.toLocaleDateString("en-US", { month: "short" })}
                </span>
              </button>
            );
          })}
        </div>
        {dateError && <p className="text-sm font-medium text-red-500 mt-2">{dateError}</p>}
      </div>

      <div className={`rounded-2xl border shadow-sm p-6 md:p-8 transition-all duration-300 ${!selectedDate ? "opacity-50 pointer-events-none border-slate-200 bg-slate-50 grayscale-[50%]" : "border-slate-200 bg-white"}`}>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Clock className="text-teal-600" /> Select Time
        </h3>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {TIME_SLOTS.map((t, i) => {
            const isSelected = selectedTime === t;
            const isAvailable = selectedDate ? (t.charCodeAt(1) + selectedDate.charCodeAt(selectedDate.length-1) + i) % 4 !== 0 : true;

            return (
              <button
                key={t}
                type="button"
                disabled={!isAvailable}
                onClick={() => onTimeSelect(t)}
                aria-label={isAvailable ? `Select time ${t}` : `${t} - Unavailable`}
                aria-pressed={isSelected}
                className={`py-3 rounded-xl border-2 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  isSelected 
                    ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-500/20 scale-105" 
                    : isAvailable
                      ? "border-slate-100 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                      : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through decoration-slate-300"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
        {timeError && <p className="text-sm font-medium text-red-500 mt-4">{timeError}</p>}
      </div>
    </div>
  );
}
