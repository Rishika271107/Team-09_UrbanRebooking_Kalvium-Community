import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { IndianRupee, TrendingUp, Calendar, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Earnings | Urban Company Admin",
};

export default async function AdminEarningsPage() {
  const session = await auth();
  
  let professionalId = null;
  if (session?.user?.role === "PROFESSIONAL") {
    const pro = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    });
    if (pro) professionalId = pro.id;
  }

  const whereClause: any = { status: "COMPLETED" };
  if (professionalId) {
    whereClause.professionalId = professionalId;
  }

  const completedBookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      service: true,
      user: true,
    },
    orderBy: { createdAt: "desc" }
  });

  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.service.price, 0);
  const totalBookings = completedBookings.length;
  const avgBookingValue = totalBookings > 0 ? (totalEarnings / totalBookings).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
          <p className="text-sm text-slate-500">Track your revenue and completed services.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <IndianRupee className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Earnings</p>
              <p className="text-3xl font-bold text-slate-900">₹{totalEarnings}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Completed Services</p>
              <p className="text-3xl font-bold text-slate-900">{totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Booking Value</p>
              <p className="text-3xl font-bold text-slate-900">₹{avgBookingValue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-6 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Earnings History</h2>
        </div>
        <div className="overflow-x-auto">
          {completedBookings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p>No completed services yet.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date Completed</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{booking.service.name}</td>
                    <td className="px-6 py-4 text-slate-600">{booking.user.name}</td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {new Date(booking.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 text-right">₹{booking.service.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
