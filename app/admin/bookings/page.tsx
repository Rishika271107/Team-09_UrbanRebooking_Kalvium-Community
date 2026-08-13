import { Suspense } from "react";
import AdminBookingsClient from "./AdminBookingsClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Bookings Management | Urban Company Admin",
};

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings Management</h1>
          <p className="text-sm text-slate-500">Manage all booking requests and schedules.</p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#047260]" />
        </div>
      }>
        <AdminBookingsClient />
      </Suspense>
    </div>
  );
}
