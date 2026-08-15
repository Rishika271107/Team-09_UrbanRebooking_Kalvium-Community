import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  IndianRupee,
  Briefcase
} from "lucide-react";
import AdminDashboardChart from "./AdminDashboardChart";

export const metadata = {
  title: "Admin Dashboard | Urban Company",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  
  // Get professional if the user is a professional
  let professionalId = null;
  if (session?.user?.role === "PROFESSIONAL") {
    const pro = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    });
    if (pro) {
      professionalId = pro.id;
    }
  }

  // Build the where clause based on role
  const whereClause = professionalId ? { professionalId } : {};

  // Fetch stats concurrently
  const [
    pendingCount,
    confirmedCount,
    completedCount,
    cancelledCount,
    recentBookings,
    earningsData
  ] = await Promise.all([
    prisma.booking.count({ where: { ...whereClause, status: { in: ["PENDING", "DRAFT"] } } }),
    prisma.booking.count({ where: { ...whereClause, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { ...whereClause, status: "COMPLETED" } }),
    prisma.booking.count({ where: { ...whereClause, status: "CANCELLED" } }),
    prisma.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        service: true,
        user: true,
      }
    }),
    // Simplified earnings: SUM of all completed bookings' service price
    // In a real scenario, you'd calculate from Payment model or aggregate
    prisma.booking.findMany({
      where: { ...whereClause, status: "COMPLETED" },
      include: { service: true }
    })
  ]);

  const totalEarnings = earningsData.reduce((sum, b) => sum + b.service.price, 0);

  // Generate chart data for the last 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    
    // Find completed bookings for this day
    const dayEarnings = earningsData
      .filter((b) => {
        const bd = new Date(b.slotStart || b.createdAt);
        return bd.getDate() === d.getDate() && bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      })
      .reduce((sum, b) => sum + b.service.price, 0);

    return { name: dayName, earnings: dayEarnings };
  });

  const stats = [
    { title: "Pending Requests", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-100", link: "/admin/bookings" },
    { title: "Confirmed Bookings", value: confirmedCount, icon: Calendar, color: "text-blue-600", bg: "bg-blue-100", link: "/admin/bookings?status=CONFIRMED" },
    { title: "Completed", value: completedCount, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", link: "/admin/bookings?status=COMPLETED" },
    { title: "Cancelled", value: cancelledCount, icon: XCircle, color: "text-red-600", bg: "bg-red-100", link: "/admin/bookings?status=CANCELLED" },
    { title: "Total Earnings", value: `₹${totalEarnings}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-100", link: "/admin/earnings" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Welcome back, {session?.user?.name || 'Admin'}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.link} className="block transition-transform hover:-translate-y-1">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Booking Requests</h2>
            <Link href="/admin/bookings" className="text-sm font-medium text-[#047260] hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Clock className="mx-auto h-8 w-8 mb-2 opacity-20" />
                No recent bookings found.
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">
                      {booking.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{booking.service.name}</p>
                      <p className="text-sm text-slate-500">{booking.user.name} • {booking.user.phone || booking.user.email}</p>
                      {booking.slotStart && (
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(booking.slotStart).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${booking.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }
                    `}>
                      {booking.status}
                    </span>
                    <Link href={`/admin/bookings?id=${booking.id}`} className="text-sm font-medium text-[#047260] hover:underline">
                      Manage
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chart Section */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-900">Earnings (Last 7 Days)</h2>
            <Link href="/admin/earnings" className="text-sm font-medium text-[#047260] hover:underline">
              View all
            </Link>
          </div>
          <AdminDashboardChart data={chartData} />
        </div>

        {/* Quick Actions / Alerts */}
        <div className="space-y-6 mt-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/calendar" className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-[#047260] hover:bg-teal-50 transition-colors">
                <Calendar className="h-5 w-5 text-[#047260]" />
                <span className="font-medium text-slate-700">Block Calendar Time</span>
              </Link>
              <Link href="/admin/services" className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-[#047260] hover:bg-teal-50 transition-colors">
                <Briefcase className="h-5 w-5 text-[#047260]" />
                <span className="font-medium text-slate-700">Manage Services</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
