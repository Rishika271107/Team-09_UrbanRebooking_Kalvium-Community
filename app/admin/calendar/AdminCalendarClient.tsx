"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2, ChevronLeft, ChevronRight, X, Check, AlertTriangle,
  Lock, User, Clock, Calendar as CalendarIcon, Phone, Mail,
  IndianRupee, CheckCircle, XCircle, RefreshCw
} from "lucide-react";

/* ─── Types ────────────────────────────────────────────────── */
interface Professional { id: string; user: { name: string } }
interface BookingInfo {
  id: string;
  status: string;
  user: { id: string; name: string; email: string; phone?: string };
  service: { name: string; price: number; category: string };
  professional?: { user: { name: string } } | null;
}
interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  slotType: string;
  bookingId?: string | null;
  booking?: BookingInfo | null;
  professional?: { user: { name: string } } | null;
}
interface PendingBooking {
  id: string;
  slotStart: string;
  slotEnd?: string;
  status: string;
  user: { id: string; name: string; email: string; phone?: string };
  service: { name: string; price: number; category: string };
  professional?: { user: { name: string } } | null;
}

/* ─── Helpers ──────────────────────────────────────────────── */
function formatHour(h: number) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

const SLOT_COLORS: Record<string, string> = {
  BOOKED:    "bg-slate-800 text-white border border-slate-700",
  BLOCKED:   "bg-red-100 text-red-800 border border-red-300",
  PENDING:   "bg-amber-100 text-amber-800 border border-amber-300",
  AVAILABLE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

/* ─── Detail Modal ─────────────────────────────────────────── */
function DetailModal({
  item, type, onClose, onAction,
}: {
  item: (Slot & { _type: "slot" }) | (PendingBooking & { _type: "pending" });
  type: string;
  onClose: () => void;
  onAction: (id: string, status: "CONFIRMED" | "CANCELLED") => Promise<void>;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const booking: BookingInfo | null =
    item._type === "slot" ? (item.booking ?? null) :
    { id: item.id, status: item.status, user: item.user, service: item.service, professional: item.professional ?? null };

  const isPending = item._type === "pending" || (item._type === "slot" && booking?.status === "PENDING");

  const handleAction = async (status: "CONFIRMED" | "CANCELLED") => {
    if (!booking) return;
    setLoading(status);
    await onAction(booking.id, status);
    setLoading(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              type === "BOOKED" ? "bg-slate-800 text-white" :
              type === "BLOCKED" ? "bg-red-100 text-red-800" :
              type === "PENDING" ? "bg-amber-100 text-amber-800" :
              "bg-emerald-100 text-emerald-800"
            }`}>
              {type === "BOOKED" ? "Booked" : type === "BLOCKED" ? "Blocked" : type === "PENDING" ? "Pending Request" : "Available"}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Time Info */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-5">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>
            {new Date(item._type === "slot" ? item.startTime : item.slotStart).toLocaleString("en-IN", {
              weekday: "short", day: "numeric", month: "short",
              hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>

        {booking && type !== "BLOCKED" ? (
          <div className="space-y-4">
            {/* Service */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Service</p>
              <p className="font-bold text-slate-900">{booking.service.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{booking.service.category}</p>
              <div className="flex items-center gap-1 text-emerald-700 font-bold mt-2">
                <IndianRupee className="h-3.5 w-3.5" />
                <span>{booking.service.price}</span>
              </div>
            </div>

            {/* Customer */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Customer</p>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-900">{booking.user.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{booking.user.email}</span>
              </div>
              {booking.user.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{booking.user.phone}</span>
                </div>
              )}
            </div>

            {/* Accept / Decline actions for pending */}
            {isPending && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleAction("CONFIRMED")}
                  disabled={!!loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#047260] py-3 text-sm font-bold text-white hover:bg-[#035c4e] disabled:opacity-50 transition-colors"
                >
                  {loading === "CONFIRMED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Accept Booking
                </button>
                <button
                  onClick={() => handleAction("CANCELLED")}
                  disabled={!!loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-3 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  {loading === "CANCELLED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Decline
                </button>
              </div>
            )}
          </div>
        ) : type === "BLOCKED" ? (
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <Lock className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="font-semibold text-red-800">This slot is blocked</p>
            <p className="text-sm text-red-600 mt-1">Unavailable for bookings</p>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-emerald-800">Available slot</p>
            <p className="text-sm text-emerald-600 mt-1">Open for customer bookings</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Legend ───────────────────────────────────────────────── */
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {[
        { color: "bg-slate-800", label: "Booked" },
        { color: "bg-amber-300", label: "Pending Request" },
        { color: "bg-red-200", label: "Blocked" },
        { color: "bg-emerald-100 border border-emerald-200", label: "Available" },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-sm ${color}`} />
          <span className="text-slate-600 font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────── */
export default function AdminCalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProId, setSelectedProId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocking, setIsBlocking] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [blockForm, setBlockForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    reason: "",
    professionalId: "",
  });

  // Hours shown: 7 AM – 9 PM
  const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);

  /* Week range */
  const getWeekRange = useCallback((date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  const { start, end } = getWeekRange(currentDate);

  const days: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type: "success" | "error", message: string) => setToast({ type, message });

  /* Load professionals */
  useEffect(() => {
    fetch("/api/admin/professionals?limit=100")
      .then(r => r.json())
      .then(d => {
        if (d.professionals?.length) {
          setProfessionals(d.professionals);
          setSelectedProId(d.professionals[0].id);
          setBlockForm(f => ({ ...f, professionalId: d.professionals[0].id }));
        }
      })
      .catch(console.error);
  }, []);

  /* Fetch calendar */
  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
      });
      if (selectedProId) params.set("professionalId", selectedProId);

      const res = await fetch(`/api/admin/calendar?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots ?? []);
        setPendingBookings(data.pendingBookings ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch calendar:", err);
    } finally {
      setIsLoading(false);
    }
  }, [start.toISOString(), end.toISOString(), selectedProId]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  /* Navigation */
  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };
  const goToday = () => setCurrentDate(new Date());

  /* Block a slot */
  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockForm.professionalId) { showToast("error", "Please select a professional to block time for."); return; }
    setIsBlocking(true);
    try {
      const startDateTime = new Date(`${blockForm.date}T${blockForm.startTime}:00`);
      const endDateTime = new Date(`${blockForm.date}T${blockForm.endTime}:00`);
      if (endDateTime <= startDateTime) { showToast("error", "End time must be after start time."); return; }

      const res = await fetch("/api/admin/calendar/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          reason: blockForm.reason,
          professionalId: blockForm.professionalId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const cancelled = data.cancelledBookings ?? 0;
        showToast("success",
          cancelled > 0
            ? `Time blocked. ${cancelled} pending booking${cancelled > 1 ? "s were" : " was"} cancelled and customer${cancelled > 1 ? "s notified" : " notified"}.`
            : "Time slot blocked successfully."
        );
        fetchCalendar();
      } else {
        showToast("error", data.error || "Failed to block time slot.");
      }
    } catch {
      showToast("error", "An error occurred. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  /* Unblock a slot */
  const handleUnblock = async (id: string) => {
    if (!confirm("Unblock this time slot?")) return;
    try {
      const res = await fetch(`/api/admin/calendar/block?id=${id}`, { method: "DELETE" });
      if (res.ok) { fetchCalendar(); showToast("success", "Slot unblocked."); }
      else showToast("error", "Failed to unblock slot.");
    } catch {
      showToast("error", "An error occurred.");
    }
  };

  /* Accept / Decline booking */
  const handleBookingAction = async (bookingId: string, status: "CONFIRMED" | "CANCELLED") => {
    setActionLoading(bookingId);
    try {
      const body: any = { status };
      if (status === "CONFIRMED" && selectedProId) {
        body.professionalId = selectedProId;
      }
      
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const label = status === "CONFIRMED" ? "accepted" : "declined";
        showToast("success", `Booking ${label}. Customer has been notified.`);
        fetchCalendar();
      } else {
        const d = await res.json();
        showToast("error", d.error || "Failed to update booking.");
      }
    } catch {
      showToast("error", "An error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  /* Get all events for a specific hour cell */
  const getCellEvents = (day: Date, hour: number) => {
    const cellStart = new Date(day); cellStart.setHours(hour, 0, 0, 0);
    const cellEnd = new Date(day); cellEnd.setHours(hour + 1, 0, 0, 0);

    const calSlots = slots.filter(s => {
      const t = new Date(s.startTime);
      return isSameDay(t, day) && t.getHours() === hour;
    });

    const pending = pendingBookings.filter(b => {
      const t = new Date(b.slotStart);
      return isSameDay(t, day) && t.getHours() === hour;
    });

    return { calSlots, pending };
  };

  /* Professional name helper */
  const proName = professionals.find(p => p.id === selectedProId)?.user?.name ?? "";

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium shadow-md border animate-in slide-in-from-top-2 ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          type={selectedType}
          onClose={() => setSelectedItem(null)}
          onAction={handleBookingAction}
        />
      )}

      {/* ─── Block Time Panel ─── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Lock className="h-4 w-4" /> Block Time Slot
          </h2>
          <p className="text-slate-300 text-xs mt-1">Reserve unavailable time for a professional so no bookings are accepted.</p>
        </div>
        <form onSubmit={handleBlockSlot} className="p-5 flex flex-col sm:flex-row flex-wrap gap-4 items-end">
          {/* Professional Selector */}
          <div className="w-full sm:w-auto min-w-[180px]">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Professional</label>
            <select
              required
              value={blockForm.professionalId}
              onChange={e => setBlockForm({ ...blockForm, professionalId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260] bg-white"
            >
              <option value="">Select professional…</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.user.name}</option>
              ))}
            </select>
          </div>
          {/* Date */}
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Date</label>
            <input type="date" required value={blockForm.date}
              onChange={e => setBlockForm({ ...blockForm, date: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260]"
            />
          </div>
          {/* Start */}
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Start Time</label>
            <input type="time" required value={blockForm.startTime}
              onChange={e => setBlockForm({ ...blockForm, startTime: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260]"
            />
          </div>
          {/* End */}
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">End Time</label>
            <input type="time" required value={blockForm.endTime}
              onChange={e => setBlockForm({ ...blockForm, endTime: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260]"
            />
          </div>
          {/* Reason */}
          <div className="w-full sm:flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Reason <span className="font-normal normal-case text-slate-400">(optional)</span></label>
            <input type="text" placeholder="e.g. Lunch break, Personal work…" value={blockForm.reason}
              onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260]"
            />
          </div>
          <button type="submit" disabled={isBlocking}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 transition-colors"
          >
            {isBlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Block Slot
          </button>
        </form>
      </div>

      {/* ─── Calendar Grid ─── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <button onClick={goToday}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-white transition-colors">
              Today
            </button>
            <h2 className="text-lg font-bold text-slate-900">
              {start.toLocaleString("default", { month: "long", year: "numeric" })}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Professional filter */}
            {professionals.length > 0 && (
              <select
                value={selectedProId}
                onChange={e => setSelectedProId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#047260]"
              >
                {professionals.map(p => (
                  <option key={p.id} value={p.id}>{p.user.name}</option>
                ))}
              </select>
            )}
            <button onClick={fetchCalendar}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-2.5 border-b border-slate-100 bg-white">
          <Legend />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#047260]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* Day Headers */}
              <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                <div className="w-14 shrink-0 border-r border-slate-200" />
                {days.map((day, i) => {
                  const isToday = isSameDay(day, new Date());
                  const dayPending = pendingBookings.filter(b => isSameDay(new Date(b.slotStart), day)).length;
                  return (
                    <div key={i} className={`flex-1 text-center py-3 border-r border-slate-200 last:border-r-0 ${isToday ? "bg-teal-50" : ""}`}>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {day.toLocaleString("default", { weekday: "short" })}
                      </div>
                      <div className={`text-lg font-bold mt-0.5 ${isToday ? "text-[#047260]" : "text-slate-800"}`}>
                        {day.getDate()}
                      </div>
                      {dayPending > 0 && (
                        <div className="mt-1 mx-auto w-fit px-1.5 py-0.5 rounded-full bg-amber-400 text-white text-[9px] font-bold">
                          {dayPending} pending
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Time Rows */}
              {HOURS.map(hour => (
                <div key={hour} className="flex border-b border-slate-100 last:border-b-0" style={{ minHeight: "60px" }}>
                  {/* Hour label */}
                  <div className="w-14 shrink-0 border-r border-slate-200 bg-slate-50 flex items-start justify-center pt-2">
                    <span className="text-[10px] font-semibold text-slate-400">{formatHour(hour)}</span>
                  </div>

                  {/* Day cells */}
                  {days.map((day, dIdx) => {
                    const { calSlots, pending } = getCellEvents(day, hour);
                    const isToday = isSameDay(day, new Date());
                    const isPast = new Date(day).setHours(hour + 1, 0, 0, 0) < Date.now();

                    return (
                      <div key={dIdx}
                        className={`flex-1 border-r border-slate-100 last:border-r-0 p-1 relative ${isToday ? "bg-teal-50/30" : isPast ? "bg-slate-50/50" : ""}`}
                        style={{ minHeight: "60px" }}
                      >
                        {/* Calendar slots (booked / blocked / available) */}
                        {calSlots.map(slot => {
                          const type = slot.slotType === "BLOCKED" ? "BLOCKED" : slot.bookingId ? "BOOKED" : "AVAILABLE";
                          if (type === "AVAILABLE") return null; // hide available slots to reduce noise
                          return (
                            <div
                              key={slot.id}
                              onClick={() => { setSelectedItem({ ...slot, _type: "slot" }); setSelectedType(type); }}
                              className={`rounded-md px-2 py-1 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity mb-1 flex items-center justify-between gap-1 ${SLOT_COLORS[type]}`}
                            >
                              <span className="truncate">
                                {type === "BLOCKED" ? "🔒 Blocked" : `📌 ${slot.booking?.service?.name ?? "Booked"}`}
                              </span>
                              {type === "BLOCKED" && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleUnblock(slot.id); }}
                                  className="text-red-600 hover:text-red-800 shrink-0"
                                  title="Unblock"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* Pending bookings overlay */}
                        {pending.map(pb => (
                          <div
                            key={pb.id}
                            onClick={() => { setSelectedItem({ ...pb, _type: "pending" }); setSelectedType("PENDING"); }}
                            className="rounded-md px-2 py-1 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity mb-1 bg-amber-100 border border-amber-400 text-amber-900 animate-pulse"
                          >
                            <span className="truncate block">⏳ {pb.service.name}</span>
                            <span className="text-[10px] opacity-70 truncate block">{pb.user.name}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending summary footer */}
        {pendingBookings.length > 0 && (
          <div className="border-t border-amber-200 bg-amber-50 px-5 py-3 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-semibold text-amber-800">
              {pendingBookings.length} pending booking request{pendingBookings.length > 1 ? "s" : ""} waiting for your response
            </span>
            <span className="text-xs text-amber-600">— click on any amber slot to Accept or Decline</span>
          </div>
        )}
      </div>
    </div>
  );
}
