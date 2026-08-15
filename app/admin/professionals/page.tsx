import AdminProfessionalsClient from "./AdminProfessionalsClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Professionals | Urban Company Admin",
};

export default function AdminProfessionalsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#047260]" />
      </div>
    }>
      <AdminProfessionalsClient />
    </Suspense>
  );
}
