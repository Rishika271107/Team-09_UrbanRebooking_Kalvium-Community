import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if ((session.user as any).role === "PROFESSIONAL") {
    redirect("/professional/calendar");
  }
  if ((session.user as any).role === "ADMIN") {
    redirect("/admin/analytics");
  }
  redirect("/dashboard");
}
