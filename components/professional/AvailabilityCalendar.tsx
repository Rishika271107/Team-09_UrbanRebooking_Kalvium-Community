import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CalendarSlot } from "@prisma/client";

interface AvailabilityCalendarProps {
  slots: CalendarSlot[];
  professionalId: string;
}

export function AvailabilityCalendar({ slots, professionalId }: AvailabilityCalendarProps) {
  const router = useRouter();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const d = new Date(slot.startTime);
    const dateStr = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(slot);
    return acc;
  }, {} as Record<string, CalendarSlot[]>);

  const dates = Object.keys(groupedSlots).slice(0, 5); // Show next 5 available days

  const handleBookNow = () => {
    if (!selectedSlotId) return;
    // Redirect to booking flow with professional pre-selected
    // Assuming a generic booking flow exists or redirecting to services list to pick a service first
    // For this UI, we just navigate to a placeholder or a service selection
    router.push(`/services?proId=${professionalId}&slotId=${selectedSlotId}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <CalendarIcon size={18} className="text-teal-600" />
        Availability
      </h2>

      {dates.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500">No available slots at the moment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {dates.map((date) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">{date}</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {groupedSlots[date].map((slot) => {
                  const d = new Date(slot.startTime);
                  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`py-2 px-1 rounded-lg border text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/20"
                          : "bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50"
                      }`}
                    >
                      {timeStr}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-slate-100 mt-2">
            <button
              onClick={handleBookNow}
              disabled={!selectedSlotId}
              className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Clock size={16} /> Book Selected Slot
            </button>
            {!selectedSlotId && (
              <p className="text-center text-xs text-slate-400 mt-2">
                Please select a time slot to continue
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
