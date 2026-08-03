import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getBookingById } from "@/services/booking.service";
import { getUserAddresses } from "@/services/address.service";
import { getUserNotifications } from "@/services/notification.service";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RebookFormClient from "./RebookFormClient";

export default async function RebookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const bookingId = resolvedParams.id;

  const [booking, addresses, notifications] = await Promise.all([
    getBookingById(bookingId),
    getUserAddresses(session.user.id),
    getUserNotifications(session.user.id),
  ]);

  if (!booking || booking.userId !== session.user.id) {
    redirect("/bookings");
  }

  const unreadNotificationsCount = notifications.filter((n: any) => !n.readStatus).length;

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
              Rebooking <strong>{booking.service.name}</strong> with <strong>{booking.professional?.user?.name ?? "Professional"}</strong>.
            </p>
          </div>
        </div>

        <div className="w-full">
          <RebookFormClient 
            originalBookingId={booking.id}
            addresses={addresses}
            serviceName={booking.service.name}
            servicePrice={booking.service.price}
            professionalName={booking.professional?.user?.name ?? "Professional"}
            isProfessionalActive={booking.professional?.active ?? false}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
