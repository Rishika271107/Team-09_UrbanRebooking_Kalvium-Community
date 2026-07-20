import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }
  if (session.user.role === "PROFESSIONAL") {
    redirect("/professional/calendar");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin/analytics");
  }

  return <DashboardClient userName={session.user.name ?? "there"} />;
}
