"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsCard, StatisticProps } from "@/components/dashboard/StatsCard";
import { QuickRebookCard, QuickRebookProps } from "@/components/dashboard/QuickRebookCard";
import { ServiceCategoryCard, CategoryProps } from "@/components/dashboard/ServiceCategoryCard";
import { UpcomingServices, UpcomingServiceProps } from "@/components/dashboard/UpcomingServices";
import { RecentActivity, ActivityProps } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecommendedServices, RecommendedServiceProps } from "@/components/dashboard/RecommendedServices";
import { StatsSkeleton, QuickRebookSkeleton, RecentActivitySkeleton } from "@/components/dashboard/SkeletonLoaders";
import { Modal, Avatar, RatingStars } from "@/components/ui";
import { Heart, Clock, TrendingUp, Sparkles, Star, MessageSquare } from "lucide-react";

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
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPro, setSelectedPro] = useState<any>(null);

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
  const moneySpent = completedBookings.reduce((sum, b) => sum + (b.price || b.service.price || 0), 0);

  const statItems: StatisticProps[] = [
    {
      id: "total-bookings",
      title: "Total Bookings",
      value: bookings.length.toString(),
      icon: "CalendarCheck",
    },
    {
      id: "completed-bookings",
      title: "Completed",
      value: completedBookings.length.toString(),
      icon: "Repeat",
    },
    {
      id: "upcoming",
      title: "Upcoming",
      value: upcomingBookings.length.toString(),
      icon: "TrendingUp",
    },
    {
      id: "money-spent",
      title: "Money Spent",
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(moneySpent),
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

  const serviceCategories: CategoryProps[] = [
    { id: "1", name: "Home Cleaning", startingPrice: 49, icon: "Sparkles", color: "bg-emerald-50 text-emerald-600" },
    { id: "2", name: "Salon at Home", startingPrice: 39, icon: "Scissors", color: "bg-rose-50 text-rose-500" },
    { id: "3", name: "Massage Therapy", startingPrice: 69, icon: "Home", color: "bg-orange-50 text-orange-500" },
    { id: "4", name: "AC Service & Repair", startingPrice: 59, icon: "Wind", color: "bg-blue-50 text-blue-500" },
    { id: "5", name: "Plumbing", startingPrice: 45, icon: "Droplets", color: "bg-emerald-50 text-emerald-600" },
    { id: "6", name: "Electrician", startingPrice: 45, icon: "Zap", color: "bg-orange-50 text-orange-500" },
    { id: "7", name: "Painting", startingPrice: 199, icon: "Paintbrush", color: "bg-blue-50 text-blue-500" },
    { id: "8", name: "Pest Control", startingPrice: 79, icon: "ShieldCheck", color: "bg-emerald-50 text-emerald-600" },
  ];

  const upcomingServiceItems: UpcomingServiceProps[] = upcomingBookings.map(b => {
    const d = b.slotStart ? new Date(b.slotStart) : null;
    return {
      id: b.id,
      serviceName: b.service.name,
      professionalName: b.professional?.user.name || "Aarav Sharma",
      professionalAvatar: "",
      date: d ? d.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }) : "31 Jul",
      time: d ? d.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }) : "10:00",
    };
  });

  if (upcomingServiceItems.length === 0) {
    upcomingServiceItems.push({
      id: "up1",
      serviceName: "Home Cleaning",
      professionalName: "Aarav Sharma",
      professionalAvatar: "",
      date: "31 Jul",
      time: "10:00"
    });
  }

  const recentActivities: ActivityProps[] = completedBookings.map(b => {
    const d = b.slotStart ? new Date(b.slotStart) : null;
    return {
      id: b.id,
      title: `${b.service.name} completed with ${b.professional?.user.name || "Aarav Sharma"}`,
      professionalName: null,
      date: d ? d.toLocaleDateString("en-GB") : "22/07/2026",
      status: b.status,
    };
  });

  if (recentActivities.length === 0) {
    recentActivities.push(
      { id: "ra1", title: "Home Cleaning completed with Aarav Sharma", professionalName: null, date: "22/07/2026", status: "COMPLETED" },
      { id: "ra2", title: "Salon at Home completed with Priya Menon", professionalName: null, date: "15/07/2026", status: "COMPLETED" },
      { id: "ra3", title: "AC Service & Repair completed with Rohit Verma", professionalName: null, date: "08/07/2026", status: "COMPLETED" },
      { id: "ra4", title: "Massage Therapy completed with Sana Iqbal", professionalName: null, date: "29/06/2026", status: "COMPLETED" }
    );
  }

  const recommendedServices: RecommendedServiceProps[] = [
    { id: "rs1", name: "Deep Home Cleaning", category: "Cleaning", price: 129, rating: 4.8, image: "" },
    { id: "rs2", name: "Men's Haircut & Beard", category: "Salon", price: 29, rating: 4.9, image: "" },
    { id: "rs3", name: "Full Body Massage", category: "Wellness", price: 89, rating: 4.7, image: "" },
    { id: "rs4", name: "Bathroom Cleaning", category: "Cleaning", price: 49, rating: 4.8, image: "" },
  ];

  const trendingServices = [
    { id: "t1", name: "Deep Home Cleaning", tag: "🔥 Trending", price: 129, badge: "bg-red-50 text-red-600" },
    { id: "t2", name: "Summer AC Service", tag: "⚡ Seasonal Pick", price: 89, badge: "bg-blue-50 text-blue-600" },
    { id: "t3", name: "Pest Control", tag: "📈 Most Booked", price: 79, badge: "bg-orange-50 text-orange-600" },
    { id: "t4", name: "Men's Grooming", tag: "✨ New on Platform", price: 35, badge: "bg-purple-50 text-purple-700" },
  ];

  const recentlyViewed = [
    { id: "rv1", name: "Bathroom Cleaning", category: "Cleaning", price: 49, viewedAt: "2 hours ago" },
    { id: "rv2", name: "Massage Therapy", category: "Wellness", price: 89, viewedAt: "Yesterday" },
    { id: "rv3", name: "Electrician Service", category: "Electrical", price: 45, viewedAt: "2 days ago" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <div className="h-24 w-full animate-pulse rounded-xl bg-slate-200"></div>
        <StatsSkeleton />
        <div className="mt-4 flex flex-col gap-6">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200"></div>
          <QuickRebookSkeleton />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 w-full animate-pulse rounded-xl bg-slate-200"></div>
          <RecentActivitySkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <WelcomeBanner 
        firstName={userName.split(" ")[0]} 
        nextService={nextServiceData} 
      />

      {/* Live Booking Status & Estimated Arrival */}
      {nextAppointment && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
              <Clock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full uppercase">On the Way</span>
                <span className="text-xs font-semibold text-slate-500">• Est. Arrival: 15 mins</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{nextAppointment.service.name} with {nextAppointment.professional?.user.name || "Aarav Sharma"}</h3>
              <p className="text-sm text-slate-600 mt-0.5">Professional is heading towards your saved address.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/bookings/${nextAppointment.id}`)}
            className="rounded-lg bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-colors text-center"
          >
            Track Live Status
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat, i) => (
          <StatsCard key={stat.id} stat={stat} index={i} />
        ))}
      </div>

      {/* Smart Rebooking Suggestions */}
      {completedBookings.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AC Servicing Recommendation</h3>
              <p className="text-xs text-slate-500 mt-0.5">It's been 6 months since your last AC Clean-up. Book a service today to keep it running smoothly!</p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/rebook")}
            className="rounded-lg bg-[#047260] hover:bg-teal-750 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            Rebook Service
          </button>
        </div>
      )}

      <div className="mt-2">
        <QuickActions />
      </div>

      {/* Quick Rebook */}
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
          {quickRebookItems.length === 0 ? (
            <div className="col-span-full rounded-xl border border-slate-200 border-dashed p-8 text-center bg-slate-50">
              <p className="text-sm text-slate-500">You don't have any past services to rebook yet.</p>
            </div>
          ) : (
            quickRebookItems.map((item) => (
              <QuickRebookCard key={item.id} item={item} />
            ))
          )}
        </div>
      </div>

      {/* Favorite Professionals & Profile Preview */}
      <div className="mt-4 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Favorite Professionals</h2>
          <p className="mt-1 text-sm text-slate-500">Book your most-rated professionals again.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: "p1", name: "Aarav Sharma", category: "Cleaning Expert", rating: 4.9, completed: "1,240+", avatar: "" },
            { id: "p2", name: "Priya Menon", category: "Salon Stylist", rating: 4.8, completed: "980+", avatar: "" },
            { id: "p3", name: "Rohit Verma", category: "AC technician", rating: 4.7, completed: "1,520+", avatar: "" },
            { id: "p4", name: "Sana Iqbal", category: "Massage therapist", rating: 4.95, completed: "850+", avatar: "" }
          ].map((pro) => (
            <div 
              key={pro.id} 
              onClick={() => setSelectedPro(pro)}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-[#047260] hover:shadow-sm transition-all cursor-pointer group"
            >
              <Avatar name={pro.name} src={pro.avatar} size="md" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#047260]">{pro.name}</h4>
                <p className="text-xs text-slate-500 truncate">{pro.category}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star size={11} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] font-bold text-slate-700">{pro.rating}</span>
                  <span className="text-[10px] text-slate-400">({pro.completed} jobs)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <RecommendedServices services={recommendedServices} />
      </div>

      {/* Frequently Booked Together (Cross-sells) */}
      <div className="mt-4 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Frequently Booked Together</h2>
          <p className="mt-1 text-sm text-slate-500">Add popular cross-sell additions to your booking.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { id: "c1", name: "Deep Kitchen Cleaning", desc: "Add to home cleaning service", price: 89, discountPrice: 69 },
            { id: "c2", name: "Ceiling Fan Cleaning", desc: "Add to AC servicing", price: 25, discountPrice: 15 },
            { id: "c3", name: "Safety Checkup & Repair", desc: "Safety diagnostic check", price: 19, discountPrice: 9 },
          ].map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase">Bundle Offer</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{item.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-[#047260]">${item.discountPrice}</span>
                  <span className="text-xs text-slate-405 line-through">${item.price}</span>
                </div>
                <button 
                  onClick={() => router.push("/rebook")}
                  className="px-3 py-1.5 text-xs font-semibold bg-teal-55 text-teal-700 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
                >
                  Add service
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Categories */}
      <div className="mt-8 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Service Categories</h2>
          <p className="mt-1 text-sm text-slate-500">Explore what we offer.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {serviceCategories.map((category) => (
            <ServiceCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* Trending Services */}
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Trending Now</h2>
            <p className="mt-1 text-sm text-slate-500">Popular and seasonal picks near you.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 hover:border-[#047260] hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => router.push("/rebook")}
            >
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase w-fit ${svc.badge}`}>
                {svc.tag}
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#047260]">{svc.name}</h4>
                <p className="text-sm font-semibold text-[#047260] mt-1">from ${svc.price}</p>
              </div>
              <button className="mt-auto text-xs font-semibold text-[#047260] hover:underline text-left">
                Book Now →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Viewed */}
      <div className="mt-4 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Recently Viewed</h2>
          <p className="mt-1 text-sm text-slate-500">Pick up where you left off.</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {recentlyViewed.map((svc) => (
            <div
              key={svc.id}
              className="shrink-0 w-52 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 hover:border-[#047260] hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => router.push("/rebook")}
            >
              <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#047260]">
                <Sparkles size={20} />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#047260]">{svc.name}</h4>
              <p className="text-xs text-slate-400">{svc.category} • {svc.viewedAt}</p>
              <p className="text-sm font-bold text-[#047260]">from ${svc.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingServices services={upcomingServiceItems} />
        <RecentActivity activities={recentActivities} />
      </div>

      {/* Professional Profile Preview Modal */}
      {selectedPro && (
        <Modal 
          isOpen={!!selectedPro} 
          onClose={() => setSelectedPro(null)} 
          title="Professional Profile"
          size="lg"
        >
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6">
            <Avatar name={selectedPro.name} size="xl" className="border-4 border-slate-100" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{selectedPro.name}</h3>
                <p className="text-sm font-medium text-[#047260] mt-0.5">{selectedPro.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={selectedPro.rating} showText />
                  <span className="text-xs text-slate-400">• {selectedPro.completed} completed jobs</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</span>
                  <p className="text-sm font-semibold text-slate-800">5+ Years</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</span>
                  <p className="text-sm font-semibold text-slate-800">⭐ {selectedPro.rating} / 5</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Languages</span>
                  <p className="text-sm font-semibold text-slate-800">English, Hindi</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availability</span>
                  <p className="text-sm font-semibold text-teal-600">Available Today</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Reviews</h4>
                <div className="space-y-3">
                  {[
                    { author: "Rita K.", stars: 5, comment: "Extremely professional and thorough work!" },
                    { author: "Deepak S.", stars: 5, comment: "Punctual, friendly and did a fantastic job." }
                  ].map((rev, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">{rev.author}</span>
                        <RatingStars rating={rev.stars} size={10} />
                      </div>
                      <p className="text-xs text-slate-600">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
