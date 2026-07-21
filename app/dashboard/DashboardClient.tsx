"use client";

import React, { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
}

interface BookingItem {
  id: string;
  status: string;
  slotStart: string | null;
  slotEnd: string | null;
  address: string | null;
  eligibleForRebook: boolean;
  service: { id: string; name: string; price: number; durationMinutes: number };
  professional: { id: string; active: boolean; user: { name: string } } | null;
}

interface DraftBooking {
  id: string;
  status: string;
  professionalId: string | null;
  service: { id: string; name: string; price: number; durationMinutes: number };
  professional: { id: string; active: boolean; user: { name: string } } | null;
}

interface CalendarSlotItem {
  id: string;
  startTime: string;
  endTime: string;
  slotType: "AVAILABLE" | "BLOCKED" | "BOOKED";
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardClient({ userName }: { userName: string }) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingItem[] | null>(null);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [rebookingId, setRebookingId] = useState<string | null>(null);
  const [rebookMessage, setRebookMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftBooking | null>(null);

  const [date, setDate] = useState(todayISODate());
  const [slots, setSlots] = useState<CalendarSlotItem[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlotItem | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingItem | null>(null);

  // FR4: fetch customer details and booking history in parallel, and handle
  // the two requests failing independently (see PRD edge cases).
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setProfileError(null);
    setBookingsError(null);

    const [profileResult, bookingsResult] = await Promise.allSettled([
      fetch("/api/customers/me").then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Failed to load profile.");
        return data.user as CustomerProfile;
      }),
      fetch("/api/bookings/history").then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Failed to load booking history.");
        return data.bookings as BookingItem[];
      }),
    ]);

    if (profileResult.status === "fulfilled") {
      setProfile(profileResult.value);
    } else {
      setProfileError(profileResult.reason?.message ?? "Failed to load profile.");
    }

    if (bookingsResult.status === "fulfilled") {
      setBookings(bookingsResult.value);
    } else {
      setBookingsError(bookingsResult.reason?.message ?? "Failed to load booking history.");
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const loadAvailability = useCallback(async (professionalId: string, forDate: string) => {
    setLoadingSlots(true);
    setSlotsError(null);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/professionals/${professionalId}/availability?date=${forDate}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to load availability.");
      setSlots(data.slots as CalendarSlotItem[]);
    } catch (err) {
      setSlots(null);
      setSlotsError(err instanceof Error ? err.message : "Failed to load availability.");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const handleRebook = async (bookingId: string) => {
    setRebookingId(bookingId);
    setRebookMessage(null);
    setDraft(null);
    setSlots(null);
    setConfirmedBooking(null);
    setConfirmError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/rebook`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRebookMessage(data?.error ?? "Failed to start rebooking.");
        return;
      }

      setDraft(data.draftBooking as DraftBooking);
      setRebookMessage(data.message as string);

      if (data.draftBooking?.professionalId) {
        await loadAvailability(data.draftBooking.professionalId, date);
      }
    } catch {
      setRebookMessage("Could not reach the server. Please try again.");
    }
  };

  const handleDateChange = async (newDate: string) => {
    setDate(newDate);
    if (draft?.professionalId) {
      await loadAvailability(draft.professionalId, newDate);
    }
  };

  const handleConfirm = async () => {
    if (!draft || !draft.professionalId || !selectedSlot) return;
    setConfirming(true);
    setConfirmError(null);

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
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setConfirmError(data?.error ?? "Failed to confirm booking.");
        // FR6/FR8: slot was taken between selection and confirm — refresh the grid.
        if (res.status === 409 && draft.professionalId) {
          await loadAvailability(draft.professionalId, date);
        }
        return;
      }

      setConfirmedBooking(data.booking as BookingItem);
      setDraft(null);
      setSlots(null);
      setSelectedSlot(null);
      await loadDashboard();
    } catch {
      setConfirmError("Could not reach the server. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName}</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your bookings and rebook favorites.</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm font-semibold text-[#047260] hover:underline"
          >
            Sign out
          </button>
        </header>

        {isLoading && <p className="text-sm text-slate-500">Loading your dashboard…</p>}

        {profileError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {profileError}
          </div>
        )}

        {profile && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-2">Your profile</h2>
            <p className="text-sm text-slate-600">{profile.email}</p>
            {profile.phone && <p className="text-sm text-slate-600">{profile.phone}</p>}
            {profile.address && <p className="text-sm text-slate-600">{profile.address}</p>}
          </section>
        )}

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Booking history</h2>

          {bookingsError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              {bookingsError}
            </div>
          )}

          {bookings && bookings.length === 0 && (
            <p className="text-sm text-slate-500">No bookings yet.</p>
          )}

          <ul className="flex flex-col gap-3">
            {bookings?.map((booking) => (
              <li
                key={booking.id}
                className="flex items-center justify-between border border-slate-200 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{booking.service.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {booking.professional?.user.name ?? "Unassigned"} • {booking.status}
                    {booking.slotStart ? ` • ${new Date(booking.slotStart).toLocaleDateString()}` : ""}
                  </p>
                </div>
                {booking.eligibleForRebook && (
                  <button
                    onClick={() => handleRebook(booking.id)}
                    disabled={rebookingId === booking.id && !draft}
                    className="text-sm font-semibold text-white bg-[#047260] hover:bg-[#035d4f] rounded-lg px-4 py-2 disabled:opacity-60"
                  >
                    Rebook
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {rebookMessage && (
          <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            {rebookMessage}
          </div>
        )}

        {draft && draft.professionalId && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-1">Pick a slot</h2>
            <p className="text-sm text-slate-500 mb-4">
              with {draft.professional?.user.name} for {draft.service.name}
            </p>

            <input
              type="date"
              value={date}
              min={todayISODate()}
              onChange={(e) => handleDateChange(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4"
            />

            {loadingSlots && <p className="text-sm text-slate-500">Loading availability…</p>}
            {slotsError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                {slotsError}
              </div>
            )}

            {slots && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                {slots.map((slot) => {
                  const isAvailable = slot.slotType === "AVAILABLE";
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`text-sm rounded-lg px-3 py-2 border transition-colors ${
                        !isAvailable
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-[#047260] text-white border-[#047260]"
                          : "bg-white text-slate-700 border-slate-300 hover:border-[#047260]"
                      }`}
                    >
                      {formatTime(slot.startTime)}
                    </button>
                  );
                })}
              </div>
            )}

            {confirmError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                {confirmError}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={!selectedSlot || confirming}
              className="text-sm font-semibold text-white bg-[#047260] hover:bg-[#035d4f] rounded-lg px-5 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {confirming ? "Confirming…" : "Confirm booking"}
            </button>
          </section>
        )}

        {confirmedBooking && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            Booking confirmed for {confirmedBooking.service.name}
            {confirmedBooking.slotStart ? ` at ${new Date(confirmedBooking.slotStart).toLocaleString()}` : ""}.
          </div>
        )}
      </div>
    </div>
  );
}
