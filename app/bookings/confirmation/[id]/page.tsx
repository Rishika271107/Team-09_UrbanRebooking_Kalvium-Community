import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getBookingById } from "@/services/booking.service";
import { getUserNotifications } from "@/services/notification.service";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, MapPin, Hash } from "lucide-react";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const bookingId = resolvedParams.id;

  const booking = await getBookingById(bookingId);
  if (!booking || booking.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const notifications = await getUserNotifications(session.user.id);
  const unreadNotificationsCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <div className="flex flex-col items-center justify-center gap-8 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Booking Confirmed!</h1>
          <p className="max-w-md text-slate-500">
            Your rebooking has been successfully scheduled. The professional will arrive at the confirmed date and time.
          </p>
        </div>

        <div className="w-full max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b pb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-100 bg-teal-50 text-xl font-semibold text-teal-700">
                {(booking.professional?.user.name ?? "?").charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900">{booking.service.name}</span>
                {booking.professional && (
                  <span className="text-slate-600 font-medium">with {booking.professional.user.name}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-slate-400"><Calendar size={20} /></div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date</span>
                  <span className="font-medium text-slate-900">
                    {booking.slotStart ? new Date(booking.slotStart).toLocaleDateString() : "Not scheduled"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-slate-400"><Clock size={20} /></div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Time</span>
                  <span className="font-medium text-slate-900">
                    {booking.slotStart ? new Date(booking.slotStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
                  </span>
                </div>
              </div>

              {booking.address && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="mt-0.5 text-slate-400"><MapPin size={20} /></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Address</span>
                    <span className="font-medium text-slate-900">{booking.address}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="mt-0.5 text-slate-400"><Hash size={20} /></div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Booking ID</span>
                  <span className="font-medium text-slate-900">{booking.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row w-full max-w-xl justify-center pt-4">
          <Link
            href="/dashboard"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-6 py-3 text-center font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Return to Dashboard
          </Link>
          <Link
            href={`/bookings/${booking.id}`}
            className="flex-1 rounded-lg bg-teal-600 px-6 py-3 text-center font-bold text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            View Booking Details
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
