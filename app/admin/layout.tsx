import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopNavbar } from "@/components/admin/AdminTopNavbar";
import { SessionProvider } from "next-auth/react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PROFESSIONAL") {
    redirect("/dashboard");
  }

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-slate-50">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:shadow-md"
        >
          Skip to main content
        </a>
        <AdminSidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <AdminTopNavbar />
          <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 pb-24 md:p-8 md:pb-8 focus:outline-none" tabIndex={-1}>
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
