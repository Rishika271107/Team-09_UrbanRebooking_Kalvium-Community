import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  if ((session.user as any)?.role === "PROFESSIONAL") {
    redirect("/professional/calendar");
  }
  if ((session.user as any)?.role === "ADMIN") {
    redirect("/admin/analytics");
  }

  return <DashboardClient userName={session.user?.name ?? "there"} />;
}
