import { Suspense } from "react";
import AdminCalendarClient from "./AdminCalendarClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Calendar | Urban Company Admin",
};

export default function AdminCalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar & Availability</h1>
          <p className="text-sm text-slate-500">Manage your schedule and block unavailable time.</p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#047260]" />
        </div>
      }>
        <AdminCalendarClient />
      </Suspense>
    </div>
  );
}
