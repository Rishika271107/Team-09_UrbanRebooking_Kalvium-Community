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

interface DashboardData {
  favoriteProfessionals: any[];
  trendingServices: any[];
  categories: string[];
  crossSells: any[];
  recommendedServices: any[];
}

export default function DashboardClient({ userName }: { userName: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPro, setSelectedPro] = useState<any>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);

    const [profileResult, bookingsResult, dashboardResult] = await Promise.allSettled([
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
      fetch("/api/dashboard").then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Failed to load dashboard data.");
        return data as DashboardData;
      }),
    ]);

    if (profileResult.status === "fulfilled") {
      setProfile(profileResult.value);
    }
    if (bookingsResult.status === "fulfilled") {
      setBookings(bookingsResult.value || []);
    }
    if (dashboardResult.status === "fulfilled") {
      setDashboardData(dashboardResult.value);
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
      value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(moneySpent),
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
      rating: 4.8, 
      jobsCompleted: "1240+", 
      lastBooked: d ? d.toLocaleDateString("en-GB") : "Unknown",
      price: b.service.price || b.price || 0,
    };
  });

  // Assign icons based on category name roughly
  const getIconForCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('clean')) return 'Sparkles';
    if (n.includes('salon')) return 'Scissors';
    if (n.includes('massage') || n.includes('well')) return 'Home';
    if (n.includes('ac ') || n.includes('repair')) return 'Wind';
    if (n.includes('plumb')) return 'Droplets';
    if (n.includes('electric')) return 'Zap';
    if (n.includes('paint')) return 'Paintbrush';
    if (n.includes('pest')) return 'ShieldCheck';
    return 'Sparkles';
  };

  const getColorForCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('clean')) return 'bg-emerald-50 text-emerald-600';
    if (n.includes('salon')) return 'bg-rose-50 text-rose-500';
    if (n.includes('massage') || n.includes('well')) return 'bg-orange-50 text-orange-500';
    if (n.includes('ac ') || n.includes('repair')) return 'bg-blue-50 text-blue-500';
    if (n.includes('plumb')) return 'bg-emerald-50 text-emerald-600';
    if (n.includes('electric')) return 'bg-orange-50 text-orange-500';
    if (n.includes('paint')) return 'bg-blue-50 text-blue-500';
    if (n.includes('pest')) return 'bg-emerald-50 text-emerald-600';
    return 'bg-teal-50 text-teal-600';
  };

  const serviceCategories: CategoryProps[] = dashboardData?.categories.map((c, i) => ({
    id: `cat-${i}`,
    name: c,
    startingPrice: 49, // Stub, categories don't have prices
    icon: getIconForCategory(c) as any,
    color: getColorForCategory(c)
  })) || [];

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

  const recentActivities: ActivityProps[] = completedBookings.map(b => {
    const d = b.slotStart ? new Date(b.slotStart) : null;
    return {
      id: b.id,
      title: `${b.service.name} completed with ${b.professional?.user.name || "Aarav Sharma"}`,
      professionalName: null,
      date: d ? d.toLocaleDateString("en-GB") : "22/07/2026",
      status: b.status as "COMPLETED" | "CONFIRMED" | "CANCELLED" | "PENDING",
    };
  });

  const recommendedServices: RecommendedServiceProps[] = (dashboardData?.recommendedServices || []).map(s => ({
    id: s.id,
    name: s.name,
    category: s.category,
    price: s.price,
    rating: 4.8,
    image: ""
  }));

  const trendingServices = (dashboardData?.trendingServices || []).map((s, i) => ({
    id: s.id,
    name: s.name,
    tag: i === 0 ? "🔥 Trending" : i === 1 ? "⚡ Seasonal Pick" : "📈 Most Booked",
    price: s.price,
    badge: i === 0 ? "bg-red-50 text-red-600" : i === 1 ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
  }));

  const crossSells = (dashboardData?.crossSells || []).map((s) => ({
    id: s.id,
    name: s.name,
    desc: `Add to your next ${s.category.toLowerCase()} service`,
    price: s.price + 20, 
    discountPrice: s.price
  }));

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
    <div className="flex flex-col gap-6 lg:gap-8 pb-10">
      <WelcomeBanner 
        firstName={userName.split(" ")[0]} 
        nextService={nextServiceData} 
      />

      {/* Live Booking Status & Estimated Arrival */}
      {nextAppointment && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
              <Clock size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full uppercase">On the Way</span>
                <span className="text-xs font-semibold text-slate-500">• Est. Arrival: 15 mins</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 line-clamp-1">{nextAppointment.service.name} with {nextAppointment.professional?.user.name || "Aarav Sharma"}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Professional is heading towards your saved address.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/bookings/${nextAppointment.id}`)}
            className="rounded-lg bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors text-center shrink-0 w-full sm:w-auto"
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
              <h3 className="text-sm font-bold text-slate-900">{completedBookings[0].service.name} Recommendation</h3>
              <p className="text-xs text-slate-500 mt-0.5">It's been a while since your last {completedBookings[0].service.name}. Book a service today to keep everything running smoothly!</p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/rebook")}
            className="rounded-lg bg-[#047260] hover:bg-teal-750 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-colors shrink-0 w-full sm:w-auto"
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
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900">Quick Rebook</h2>
            <p className="mt-1 text-sm text-slate-500">Your recent services — book again with the same pro.</p>
          </div>
          <Link href="/bookings" className="text-sm font-semibold text-[#047260] hover:underline shrink-0">
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
        
        {(!dashboardData?.favoriteProfessionals || dashboardData.favoriteProfessionals.length === 0) ? (
          <div className="rounded-xl border border-slate-200 border-dashed p-8 text-center bg-slate-50">
            <p className="text-sm text-slate-500">You haven't booked any professionals yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.favoriteProfessionals.map((pro) => (
              <div 
                key={pro.id} 
                onClick={() => setSelectedPro(pro)}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-[#047260] hover:shadow-sm transition-all cursor-pointer group"
              >
                <Avatar name={pro.name} src="" size="md" />
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
        )}
      </div>

      <div className="mt-4">
        {recommendedServices.length > 0 && <RecommendedServices services={recommendedServices} />}
      </div>

      {/* Frequently Booked Together (Cross-sells) */}
      <div className="mt-4 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Frequently Booked Together</h2>
          <p className="mt-1 text-sm text-slate-500">Add popular cross-sell additions to your booking.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {crossSells.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase">Bundle Offer</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{item.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-[#047260]">₹{item.discountPrice}</span>
                  <span className="text-xs text-slate-405 line-through">₹{item.price}</span>
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
                <p className="text-sm font-semibold text-[#047260] mt-1">from ₹{svc.price}</p>
              </div>
              <button className="mt-auto text-xs font-semibold text-[#047260] hover:underline text-left">
                Book Now →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Viewed (Reusing crossSells as a placeholder to show real data) */}
      <div className="mt-4 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Recently Viewed</h2>
          <p className="mt-1 text-sm text-slate-500">Pick up where you left off.</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {crossSells.map((svc) => (
            <div
              key={svc.id}
              className="shrink-0 w-52 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 hover:border-[#047260] hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => router.push("/rebook")}
            >
              <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#047260]">
                <Sparkles size={20} />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#047260]">{svc.name}</h4>
              <p className="text-xs text-slate-400">{svc.desc} • Recently</p>
              <p className="text-sm font-bold text-[#047260]">from ₹{svc.price}</p>
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
