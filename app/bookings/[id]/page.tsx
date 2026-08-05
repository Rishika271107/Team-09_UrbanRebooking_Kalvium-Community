import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getBookingById } from "@/services/booking.service";
import { getUserNotifications } from "@/services/notification.service";
import { getReviewForBooking } from "@/services/review.service";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, RotateCw, Star } from "lucide-react";
import ReviewSection from "@/components/dashboard/ReviewSection";
import { formatCurrency } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PENDING: "bg-amber-50 text-amber-700",
  DRAFT: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-50 text-red-700",
  DISPUTED: "bg-violet-50 text-violet-700",
};

export default async function BookingDetailsPage({
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
    redirect("/bookings");
  }

  const [notifications, review] = await Promise.all([
    getUserNotifications(session.user.id),
    getReviewForBooking(bookingId),
  ]);

  const unreadNotificationsCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <div className="flex flex-col gap-8 pb-10">
        <div>
          <Link href="/bookings" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Bookings
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-slate-900">Booking Details</h1>
            {booking.status === "COMPLETED" && (
              <Link
                href={`/rebook/${booking.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
              >
                <RotateCw size={18} /> Rebook Service
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b pb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-100 bg-teal-50 text-2xl font-semibold text-teal-700">
                  {(booking.professional?.user.name ?? "?").charAt(0)}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold text-slate-900">{booking.service.name}</span>
                  <span className="text-slate-600 font-medium">
                    {booking.professional ? `Professional: ${booking.professional.user.name}` : "No professional assigned yet"}
                  </span>
                  <span
                    className={`mt-1 inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      STATUS_STYLES[booking.status] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-teal-600"><Calendar size={20} /></div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-slate-500 font-medium">Date</span>
                    <span className="font-semibold text-slate-900">
                      {booking.slotStart ? new Date(booking.slotStart).toLocaleDateString() : "Not scheduled"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-teal-600"><Clock size={20} /></div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-slate-500 font-medium">Time</span>
                    <span className="font-semibold text-slate-900">
                      {booking.slotStart ? new Date(booking.slotStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:col-span-2">
                  <div className="mt-0.5 text-teal-600"><MapPin size={20} /></div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-slate-500 font-medium">Service Address</span>
                    <span className="font-semibold text-slate-900">{booking.address ?? "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Payment Summary</h3>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Service Fee</span>
                <span className="font-medium text-slate-900">{formatCurrency(booking.service.price)}</span>
              </div>

              <div className="flex items-center justify-between border-t pt-4 mt-2">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-teal-700 text-xl">{formatCurrency(booking.service.price)}</span>
              </div>
            </div>
          </div>
        </div>

        {booking.status === "COMPLETED" && (
          <div className="lg:col-span-3">
            {review ? (
              <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-4 mt-6">
                <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Your Review</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={star <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                    />
                  ))}
                </div>
                {review.reviewText && <p className="text-slate-600 text-sm mt-2">{review.reviewText}</p>}
                <p className="text-xs text-slate-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ) : booking.professional ? (
              <ReviewSection bookingId={booking.id} professionalId={booking.professional.id} />
            ) : null}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}