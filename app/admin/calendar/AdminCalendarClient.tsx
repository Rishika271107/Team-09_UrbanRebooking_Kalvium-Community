"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, X } from "lucide-react";

export default function AdminCalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocking, setIsBlocking] = useState(false);
  
  const [blockForm, setBlockForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00",
    reason: ""
  });

  const getWeekRange = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const start = new Date(date.setDate(diff));
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23,59,59,999);
    return { start, end };
  };

  const { start, end } = getWeekRange(new Date(currentDate));

  const fetchCalendar = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/calendar?start=${start.toISOString()}&end=${end.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots);
      }
    } catch (error) {
      console.error("Failed to fetch calendar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [currentDate]);

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBlocking(true);
    try {
      const startDateTime = new Date(`${blockForm.date}T${blockForm.startTime}:00`);
      const endDateTime = new Date(`${blockForm.date}T${blockForm.endTime}:00`);
      
      const res = await fetch("/api/admin/calendar/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          reason: blockForm.reason
        })
      });
      
      if (res.ok) {
        fetchCalendar();
        alert("Time blocked successfully");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to block time");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblock = async (id: string) => {
    if (!confirm("Are you sure you want to unblock this slot?")) return;
    try {
      const res = await fetch(`/api/admin/calendar/block?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchCalendar();
      } else {
        alert("Failed to unblock slot");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  // Generate days for the week view
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  // Hours for the grid (8 AM to 8 PM)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  return (
    <div className="space-y-6">
      {/* Block Time Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-400" />
          Block Time
        </h2>
        <form onSubmit={handleBlockSlot} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input 
              type="date" 
              required
              value={blockForm.date}
              onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260]"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
            <input 
              type="time" 
              required
              value={blockForm.startTime}
              onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260]"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
            <input 
              type="time" 
              required
              value={blockForm.endTime}
              onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260]"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Lunch, Personal"
              value={blockForm.reason}
              onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260]"
            />
          </div>
          <button 
            type="submit" 
            disabled={isBlocking}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-[#047260] px-4 py-2 text-sm font-semibold text-white hover:bg-[#035c4e] disabled:opacity-50"
          >
            {isBlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Block Slot
          </button>
        </form>
      </div>

      {/* Calendar View */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <button onClick={today} className="rounded-md px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200">
              Today
            </button>
            <h2 className="text-lg font-semibold text-slate-900 ml-2">
              {start.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevWeek} className="p-1 rounded-md hover:bg-slate-100 text-slate-600">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={nextWeek} className="p-1 rounded-md hover:bg-slate-100 text-slate-600">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#047260]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px] border-b border-slate-200">
              {/* Header Row */}
              <div className="flex">
                <div className="w-16 border-r border-slate-200 bg-slate-50 shrink-0"></div>
                {days.map((day, i) => (
                  <div key={i} className="flex-1 text-center py-3 border-r border-slate-200 last:border-r-0 bg-slate-50">
                    <div className="text-xs font-medium text-slate-500 uppercase">{day.toLocaleString('default', { weekday: 'short' })}</div>
                    <div className={`text-lg font-semibold mt-1 ${
                      day.toDateString() === new Date().toDateString() ? 'text-[#047260]' : 'text-slate-900'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="relative">
                {hours.map(hour => (
                  <div key={hour} className="flex border-b border-slate-100 last:border-b-0 h-16">
                    <div className="w-16 border-r border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center text-xs font-medium text-slate-400">
                      {hour > 12 ? `${hour-12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                    </div>
                    {days.map((day, dIdx) => {
                      // Find slots for this hour
                      const cellStart = new Date(day);
                      cellStart.setHours(hour, 0, 0, 0);
                      const cellEnd = new Date(day);
                      cellEnd.setHours(hour + 1, 0, 0, 0);

                      const cellSlots = slots.filter(s => {
                        const slotTime = new Date(s.startTime);
                        return slotTime.getTime() >= cellStart.getTime() && slotTime.getTime() < cellEnd.getTime();
                      });

                      return (
                        <div key={dIdx} className="flex-1 border-r border-slate-100 last:border-r-0 p-1 relative hover:bg-slate-50 transition-colors">
                          {cellSlots.map(slot => (
                            <div 
                              key={slot.id} 
                              className={`absolute inset-x-1 top-1 bottom-1 rounded-md p-1.5 text-xs overflow-hidden ${
                                slot.slotType === 'BLOCKED' ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                                slot.bookingId ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                'bg-green-100 text-green-800'
                              }`}
                            >
                              {slot.slotType === 'BLOCKED' ? (
                                <div className="flex justify-between items-start h-full">
                                  <span className="font-semibold">Blocked</span>
                                  <button onClick={() => handleUnblock(slot.id)} className="text-slate-500 hover:text-red-500"><X className="h-3 w-3" /></button>
                                </div>
                              ) : slot.bookingId ? (
                                <div className="h-full">
                                  <div className="font-semibold truncate">{slot.booking?.service?.name}</div>
                                  <div className="truncate text-[10px] opacity-80">{slot.booking?.user?.name}</div>
                                </div>
                              ) : (
                                <span className="font-semibold">Available</span>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
