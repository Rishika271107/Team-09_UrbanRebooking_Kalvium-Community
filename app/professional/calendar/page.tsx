import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfessionalCalendarClient from "./ProfessionalCalendarClient";

export default async function ProfessionalCalendarPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  if ((session.user as any)?.role !== "PROFESSIONAL") {
    redirect("/dashboard");
  }

  return <ProfessionalCalendarClient userName={session.user?.name ?? "there"} />;
}
