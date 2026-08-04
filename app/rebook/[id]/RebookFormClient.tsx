"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  slotType: "AVAILABLE" | "BLOCKED" | "BOOKED";
}

interface DraftBooking {
  id: string;
  professionalId: string | null;
  professional: { id: string; user: { name: string } } | null;
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ── Main Component ─────────────────────────────────────────────────── */
export default function RebookFormClient({
  sourceBookingId,
  serviceName,
}: {
  sourceBookingId: string;
  serviceName: string;
}) {
  const router = useRouter();
  const [creatingDraft, setCreatingDraft] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftBooking | null>(null);
  const [professionalAvailable, setProfessionalAvailable] = useState(false);

  const [date, setDate] = useState(todayISODate());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    (async () => {
      setCreatingDraft(true);
      setError(null);
      try {
        const res = await fetch(`/api/bookings/${sourceBookingId}/rebook`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to start rebooking.");
        setDraft(data.draftBooking);
        setProfessionalAvailable(data.professionalAvailable);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setCreatingDraft(false);
      }
    })();
  }, [sourceBookingId]);

  const loadSlots = useCallback(
    async (forDate: string) => {
      if (!draft?.professionalId) return;
      setLoadingSlots(true);
      setSlots(null);
      setSelectedSlot(null);
      try {
        const res = await fetch(`/api/professionals/${draft.professionalId}/availability?date=${forDate}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to load availability.");
        setSlots(data.slots);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load availability.");
      } finally {
        setLoadingSlots(false);
      }
    },
    [draft?.professionalId]
  );

  useEffect(() => {
    if (draft?.professionalId && professionalAvailable) {
      loadSlots(date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.professionalId, professionalAvailable]);

  const handleConfirm = async () => {
    if (!draft || !draft.professionalId || !selectedSlot) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: draft.id,
          professionalId: draft.professionalId,
          slotStart: selectedSlot.startTime,
          slotEnd: selectedSlot.endTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to confirm the booking.");
      router.push(`/bookings/confirmation/${data.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setConfirming(false);
    }
  };

  if (creatingDraft) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border bg-white p-12 text-slate-500 shadow-sm">
        <Loader2 size={20} className="animate-spin" /> Setting up your rebooking...
      </div>
    );
  }

  if (error && !draft) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>;
  }

  if (!draft) return null;

  if (!professionalAvailable) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-3">
        <h3 className="text-lg font-bold text-slate-900">Your previous professional is unavailable</h3>
        <p className="text-slate-500 text-sm">
          We&apos;ve created a draft booking for {serviceName}, but the professional from your original booking is no
          longer active. Please contact support to choose a new professional, or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">{error}</div>}

      <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Choose a date</h3>
        <input
          type="date"
          value={date}
          min={todayISODate()}
          onChange={(e) => {
            setDate(e.target.value);
            loadSlots(e.target.value);
          }}
          className="w-fit rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Available slots</h3>
        {loadingSlots && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading slots...
          </div>
        )}
        {!loadingSlots && slots && slots.filter((s) => s.slotType === "AVAILABLE").length === 0 && (
          <p className="text-sm text-slate-500">No available slots on this date. Try another date.</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {slots
            ?.filter((s) => s.slotType === "AVAILABLE")
            .map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedSlot?.id === slot.id
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </button>
            ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          disabled={!selectedSlot || confirming}
          onClick={handleConfirm}
          className="rounded-lg bg-teal-600 px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center min-w-[200px]"
        >
          {confirming ? <Loader2 size={20} className="animate-spin" /> : "Confirm Rebooking"}
        </button>
      </div>
    </div>
  );
}