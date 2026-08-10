import { ReactNode } from "react";
import Link from "next/link";

export function AuthLayout({
  children,
  heading,
  subheading,
  stats,
}: {
  children: ReactNode;
  heading?: string;
  subheading?: string;
  stats?: any[];
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex h-16 items-center border-b border-slate-200 bg-white px-6">
        <Link href="/" className="text-xl font-bold text-[#047260]">
          UrbanCompany
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}