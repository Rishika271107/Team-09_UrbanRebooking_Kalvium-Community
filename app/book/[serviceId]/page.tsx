import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserNotifications } from "@/services/notification.service";
import NewBookingClient from "./NewBookingClient";

export default async function BookServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { serviceId } = await params;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    redirect("/services");
  }

  const notifications = await getUserNotifications(session.user.id);
  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadCount}>
      <div className="flex flex-col gap-6 pb-10">
        <NewBookingClient
          service={{
            id: service.id,
            name: service.name,
            category: service.category,
            price: service.price,
            durationMinutes: service.durationMinutes,
          }}
        />
      </div>
    </DashboardLayout>
  );
}
