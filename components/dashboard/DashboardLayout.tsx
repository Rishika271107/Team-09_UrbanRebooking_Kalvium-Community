"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";

export function DashboardLayout({ children, notificationCount = 0 }: { children: React.ReactNode, notificationCount?: number }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <TopNavbar notificationCount={notificationCount} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
