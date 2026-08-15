import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminAnalyticsClient from "./AdminAnalyticsClient";

export const metadata = {
  title: "Admin Analytics | Urban Company",
  description: "View platform-wide analytics and rebooking statistics.",
};

export default async function AdminAnalyticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if ((session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">
          Platform-wide rebooking and booking statistics.
        </p>
      </div>
      <AdminAnalyticsClient />
    </div>
  );
}
