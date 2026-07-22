import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminAnalyticsClient from "./AdminAnalyticsClient";

export default async function AdminAnalyticsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  if ((session.user as any)?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <AdminAnalyticsClient />;
}
