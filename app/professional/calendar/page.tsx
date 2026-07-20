import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ProfessionalCalendarClient from "./ProfessionalCalendarClient";

export default async function ProfessionalCalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "PROFESSIONAL") {
    redirect("/dashboard");
  }

  return <ProfessionalCalendarClient userName={session.user.name ?? "there"} />;
}
