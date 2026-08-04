"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface WelcomeBannerProps {
  firstName: string;
  nextService?: {
    bookingId?: string;
    serviceName: string;
    date: string;
    time: string;
  } | null;
}

export function WelcomeBanner({ firstName, nextService }: WelcomeBannerProps) {
  const { greeting, emoji, tagline } = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { greeting: "Good morning", emoji: "☀️", tagline: "Start your day right — book a service with a top pro." };
    } else if (hour < 17) {
      return { greeting: "Good afternoon", emoji: "🌤️", tagline: "Ready for another spotless home? Rebook your favorite pro." };
    } else {
      return { greeting: "Good evening", emoji: "🌙", tagline: "Wind down and let our pros take care of it for you." };
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-[#047260] p-8 text-white shadow-sm"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 h-36 w-36 rounded-full bg-white/5" aria-hidden="true" />

      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex max-w-xl flex-col gap-1.5">
          <span className="text-sm font-medium text-teal-100">{greeting} {emoji}</span>
          <h1 className="text-3xl font-bold">Hi {firstName}!</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-teal-50">
            {tagline}
            <br className="hidden sm:block" />
            We've saved all your details for a seamless experience.
          </p>
          
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link 
              href="/rebook"
              className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#047260] shadow-sm transition-colors hover:bg-slate-50"
            >
              One-Click Rebook
            </Link>
            <Link 
              href="/bookings"
              className="rounded-lg border border-teal-500/50 bg-transparent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700/30"
            >
              View history
            </Link>
          </div>
        </div>

        {nextService ? (
          <div className="flex flex-col gap-1 rounded-xl bg-teal-800/40 px-6 py-5 md:min-w-[260px] border border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200/80 mb-1">Next Appointment</span>
            <span className="text-lg font-bold text-white">{nextService.serviceName}</span>
            <span className="text-sm font-medium text-teal-100">
              {nextService.date}, {nextService.time}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 rounded-xl bg-teal-800/40 px-6 py-5 md:min-w-[240px] border border-white/10 text-center">
            <span className="text-3xl mb-1">🏠</span>
            <span className="text-sm font-semibold text-teal-100">No upcoming bookings</span>
            <Link href="/rebook" className="mt-2 text-xs font-bold text-white underline underline-offset-2 hover:text-teal-200">
              Book a service now
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
