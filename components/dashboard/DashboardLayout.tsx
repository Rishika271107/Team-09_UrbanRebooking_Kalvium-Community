"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { BottomNavigation } from "./BottomNavigation";

export function DashboardLayout({ children, notificationCount = 0 }: { children: React.ReactNode, notificationCount?: number }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-slate-50">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:shadow-md"
        >
          Skip to main content
        </a>
        <Sidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <TopNavbar notificationCount={notificationCount} />
          {/* Add pb-24 on mobile to accommodate BottomNavigation */}
          <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 pb-24 md:p-8 md:pb-8 focus:outline-none" tabIndex={-1}>
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
        <BottomNavigation />
      </div>
    </SessionProvider>
  );
}
