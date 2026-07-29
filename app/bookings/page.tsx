import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserBookingsPaginated } from "@/services/booking.service";
import { getUserNotifications } from "@/services/notification.service";
import Link from "next/link";
import { ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default async function BookingHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const take = 10;
  const skip = (page - 1) * take;

  const [bookings, notifications] = await Promise.all([
    getUserBookingsPaginated(session.user.id, skip, take),
    getUserNotifications(session.user.id),
  ]);

  const unreadNotificationsCount = notifications.filter((n: any) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <div className="flex flex-col gap-8 pb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Booking History</h1>
          <p className="text-slate-500">View and manage your past and upcoming services.</p>
        </div>

        <div className="flex flex-col gap-4">
          {bookings.length === 0 ? (
            <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-medium text-slate-900">No bookings found</p>
              <p className="mt-2 text-slate-500">You haven't booked any services yet.</p>
              <Link 
                href="/dashboard"
                className="mt-6 inline-block rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
              >
                Browse Services
              </Link>
            </div>
          ) : (
            bookings.map((booking: any) => (
              <Link 
                href={`/bookings/${booking.id}`} 
                key={booking.id}
                className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-teal-200 hover:shadow-md md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-6">
                  <img
                    src={booking.professional.avatar}
                    alt={booking.professional.name}
                    className="h-16 w-16 rounded-full border-2 border-slate-100 object-cover"
                  />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-lg">{booking.service.name}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        booking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                        booking.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <span className="text-slate-600 font-medium">with {booking.professional.name}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 border-t pt-4 md:border-t-0 md:pt-0">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={16} />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock size={16} />
                      <span>{booking.time}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-slate-500 font-medium">Total Price</span>
                    <span className="font-bold text-slate-900">{formatCurrency(booking.price)}</span>
                  </div>

                  <div className="flex items-center text-teal-600">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination placeholder */}
        {bookings.length === take && (
          <div className="flex justify-center mt-4">
            <Link 
              href={`/bookings?page=${page + 1}`}
              className="rounded-lg border bg-white px-6 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Load More
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
