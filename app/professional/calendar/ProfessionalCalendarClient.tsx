"use client";

import React, { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";

interface ProfessionalProfile {
  id: string;
  active: boolean;
  rating: number;
  skills: string[];
  user: { name: string; email: string };
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

const SLOT_STYLES: Record<CalendarSlotItem["slotType"], string> = {
  AVAILABLE: "bg-white text-slate-700 border-slate-300 hover:border-[#047260]",
  BLOCKED: "bg-amber-50 text-amber-700 border-amber-300",
  BOOKED: "bg-[#047260]/10 text-[#047260] border-[#047260]/40 cursor-not-allowed",
};

export default function ProfessionalCalendarClient({ userName }: { userName: string }) {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [date, setDate] = useState(todayISODate());
  const [slots, setSlots] = useState<CalendarSlotItem[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const loadAvailability = useCallback(async (professionalId: string, forDate: string) => {
    setSlotsError(null);
    try {
      const res = await fetch(`/api/professionals/${professionalId}/availability?date=${forDate}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to load calendar.");
      setSlots(data.slots as CalendarSlotItem[]);
    } catch (err) {
      setSlots(null);
      setSlotsError(err instanceof Error ? err.message : "Failed to load calendar.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/professionals/me");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Failed to load your profile.");
        setProfile(data.professional as ProfessionalProfile);
        await loadAvailability(data.professional.id, date);
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : "Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    })();
    // Only run once on mount; date changes are handled by handleDateChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = async (newDate: string) => {
    setDate(newDate);
    if (profile) {
      await loadAvailability(profile.id, newDate);
    }
  };

  const toggleSlot = async (slot: CalendarSlotItem) => {
    if (slot.slotType === "BOOKED") return;
    setToggleError(null);
    setTogglingId(slot.id);

    const nextType = slot.slotType === "AVAILABLE" ? "BLOCKED" : "AVAILABLE";

    try {
      const res = await fetch("/api/professionals/me/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotType: nextType,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToggleError(data?.error ?? "Failed to update the slot.");
        return;
      }
      if (profile) {
        await loadAvailability(profile.id, date);
      }
    } catch {
      setToggleError("Could not reach the server. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hi {userName}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your calendar. Blocked slots can never be booked by customers.
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm font-semibold text-[#047260] hover:underline"
          >
            Sign out
          </button>
        </header>

        {loading && <p className="text-sm text-slate-500">Loading your calendar…</p>}

        {profileError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {profileError}
          </div>
        )}

        {profile && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {profile.active ? "Active on platform" : "Inactive"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {profile.skills.join(" • ")} • {profile.rating.toFixed(1)}★
                </p>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {slotsError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                {slotsError}
              </div>
            )}
            {toggleError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                {toggleError}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white border border-slate-300 inline-block" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block" /> Blocked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#047260]/10 border border-[#047260]/40 inline-block" /> Booked
              </span>
            </div>

            {slots && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    disabled={slot.slotType === "BOOKED" || togglingId === slot.id}
                    onClick={() => toggleSlot(slot)}
                    className={`text-sm rounded-lg px-3 py-2 border transition-colors disabled:opacity-70 ${SLOT_STYLES[slot.slotType]}`}
                    title={
                      slot.slotType === "BOOKED"
                        ? "Reserved by a customer"
                        : "Click to toggle available/blocked"
                    }
                  >
                    {formatTime(slot.startTime)}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
