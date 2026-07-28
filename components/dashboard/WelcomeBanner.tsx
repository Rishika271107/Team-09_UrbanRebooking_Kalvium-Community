"use client";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-[#047260] p-8 text-white shadow-sm"
    >
      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex max-w-xl flex-col gap-1.5">
          <span className="text-sm font-medium text-teal-100">Welcome back</span>
          <h1 className="text-3xl font-bold">Hi {firstName} 👋</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-teal-50">
            Ready for another spotless home? Rebook your favorite pro with a single tap
            <br className="hidden sm:block" />
            — we've saved all your details.
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

        {nextService && (
          <div className="flex flex-col gap-1 rounded-xl bg-teal-800/40 px-6 py-5 md:min-w-[260px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200/80 mb-1">Next Appointment</span>
            <span className="text-lg font-bold text-white">{nextService.serviceName}</span>
            <span className="text-sm font-medium text-teal-100">
              {nextService.date}, {nextService.time}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
