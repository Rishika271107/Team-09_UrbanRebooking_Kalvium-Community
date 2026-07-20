"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
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
      className="relative overflow-hidden rounded-2xl bg-teal-600 p-8 text-white shadow-lg"
    >
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-teal-500/50 to-transparent"></div>
      
      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex max-w-xl flex-col gap-2">
          <span className="text-sm font-medium uppercase tracking-wider text-teal-100">Welcome Back</span>
          <h1 className="text-3xl font-bold">Hi {firstName} 👋</h1>
          <p className="mt-2 text-lg text-teal-50">
            Ready for another spotless home? Rebook your favorite professional with one click.
          </p>
          
          <div className="mt-4 flex flex-wrap gap-4">
            {nextService ? (
              <Link 
                href={`/rebook/${nextService.bookingId || ''}`}
                className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-teal-700 shadow-sm transition-all hover:bg-teal-50 hover:shadow-md"
              >
                One-Click Rebook
              </Link>
            ) : (
              <button className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-teal-700 shadow-sm transition-all hover:bg-teal-50 hover:shadow-md opacity-50 cursor-not-allowed">
                One-Click Rebook
              </button>
            )}
            <Link 
              href="/bookings"
              className="rounded-lg border border-teal-400 bg-teal-700/30 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-teal-700/50"
            >
              View History
            </Link>
          </div>
        </div>

        {nextService && (
          <div className="flex flex-col gap-3 rounded-xl bg-teal-700/40 p-5 backdrop-blur-sm md:min-w-[280px]">
            <span className="text-sm font-medium text-teal-100">Next Appointment</span>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/50">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white">{nextService.serviceName}</span>
                <span className="text-sm text-teal-100">
                  {nextService.date} • {nextService.time}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
