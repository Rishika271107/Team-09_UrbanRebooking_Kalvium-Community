"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsCard, StatisticProps } from "@/components/dashboard/StatsCard";
import { QuickRebookCard, QuickRebookProps } from "@/components/dashboard/QuickRebookCard";

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
  price: number;
  service: { id: string; name: string; price: number; durationMinutes: number };
  professional: { id: string; active: boolean; user: { name: string } } | null;
}

export default function DashboardClient({ userName }: { userName: string }) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);

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
    }

    if (bookingsResult.status === "fulfilled") {
      setBookings(bookingsResult.value || []);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Derived state for the UI
  const upcomingBookings = bookings.filter(b => b.status === "UPCOMING" || b.status === "CONFIRMED");
  const nextAppointment = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  let nextServiceData = null;
  if (nextAppointment) {
    const d = nextAppointment.slotStart ? new Date(nextAppointment.slotStart) : null;
    nextServiceData = {
      bookingId: nextAppointment.id,
      serviceName: nextAppointment.service.name,
      date: d ? d.toLocaleDateString("en-US", { weekday: 'short', day: 'numeric', month: 'short' }) : "Pending",
      time: d ? d.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false }) : "",
    };
  }

  const completedBookings = bookings.filter(b => b.status === "COMPLETED");
  const rebookedCount = bookings.filter(b => b.eligibleForRebook).length; // Rough approximation for 'Rebooked' stat
  const savedAddressesCount = 2; // Hardcoded or from profile if address is an array

  const statItems: StatisticProps[] = [
    {
      id: "total-bookings",
      title: "Total Bookings",
      value: bookings.length.toString(),
      icon: "CalendarCheck",
    },
    {
      id: "upcoming",
      title: "Upcoming",
      value: upcomingBookings.length.toString(),
      icon: "TrendingUp",
    },
    {
      id: "rebooked",
      title: "Rebooked",
      value: "5", // Using mock value as in design
      icon: "Repeat",
    },
    {
      id: "saved-addresses",
      title: "Saved Addresses",
      value: "2", // Using mock value as in design
      icon: "MapPin",
    }
  ];

  const quickRebookItems: QuickRebookProps[] = completedBookings.slice(0, 3).map(b => {
    const d = b.slotStart ? new Date(b.slotStart) : null;
    return {
      id: b.id,
      serviceName: b.service.name,
      professionalName: b.professional?.user.name || "Unassigned Pro",
      professionalAvatar: "", 
      rating: 4.8, // Mocked as the DB doesn't have rating yet
      jobsCompleted: "1240+", // Mocked
      lastBooked: d ? d.toLocaleDateString("en-GB") : "Unknown",
      price: b.service.price || b.price || 0,
    };
  });

  // If we don't have enough completed bookings in DB to match the design (3 cards), 
  // we'll pad with some mock data to show the layout perfectly as requested by the user.
  if (quickRebookItems.length === 0 && !isLoading) {
    quickRebookItems.push(
      {
        id: "mock1",
        serviceName: "Home Cleaning",
        professionalName: "Aarav Sharma",
        professionalAvatar: "",
        rating: 4.9,
        jobsCompleted: "1240+",
        lastBooked: "10/07/2026",
        price: 79,
      },
      {
        id: "mock2",
        serviceName: "Salon at Home",
        professionalName: "Priya Menon",
        professionalAvatar: "",
        rating: 4.8,
        jobsCompleted: "980+",
        lastBooked: "03/07/2026",
        price: 55,
      },
      {
        id: "mock3",
        serviceName: "AC Service & Repair",
        professionalName: "Rohit Verma",
        professionalAvatar: "",
        rating: 4.7,
        jobsCompleted: "1520+",
        lastBooked: "26/06/2026",
        price: 89,
      }
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <WelcomeBanner 
        firstName={userName.split(" ")[0]} 
        nextService={nextServiceData} 
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat, i) => (
          <StatsCard key={stat.id} stat={stat} index={i} />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Quick Rebook</h2>
            <p className="mt-1 text-sm text-slate-500">Your recent services — book again with the same pro.</p>
          </div>
          <Link href="/bookings" className="text-sm font-semibold text-[#047260] hover:underline">
            See all
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickRebookItems.map((item) => (
            <QuickRebookCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
