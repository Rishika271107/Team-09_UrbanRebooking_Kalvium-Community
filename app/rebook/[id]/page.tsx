import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getBookingById } from "@/services/booking.service";
import { getUserNotifications } from "@/services/notification.service";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RebookFormClient from "./RebookFormClient";

export default async function RebookPage({
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
  if (booking.status !== "COMPLETED") {
    redirect(`/bookings/${bookingId}`);
  }

  const notifications = await getUserNotifications(session.user.id);
  const unreadNotificationsCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <div className="flex flex-col gap-8 pb-10">
        <div>
          <Link href={`/bookings/${booking.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Booking Details
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">One-Click Rebook</h1>
            <p className="text-slate-500">
              Rebooking <strong>{booking.service.name}</strong>
              {booking.professional ? (
                <>
                  {" "}with <strong>{booking.professional.user.name}</strong>
                </>
              ) : null}
              .
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <RebookFormClient sourceBookingId={booking.id} serviceName={booking.service.name} />
        </div>
      </div>
    </DashboardLayout>
  );
}
