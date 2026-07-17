import React from "react";

interface StatCard {
  value: string;
  label: string;
}

interface AuthLayoutProps {
  heading: string;
  subheading: string;
  stats: StatCard[];
  children: React.ReactNode;
}

export default function AuthLayout({
  heading,
  subheading,
  stats,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── LEFT PANEL ── */}
      <div className="lg:w-1/2 bg-[#047260] flex flex-col justify-between p-10 lg:p-14 text-white">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">
            U
          </div>
          <span className="font-semibold text-lg tracking-wide">Urban Company</span>
        </div>

        {/* Center content */}
        <div className="mt-16 lg:mt-0 max-w-[520px]">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.18] tracking-tight mb-6">
            {heading}
          </h1>
          <p className="text-white/75 text-base lg:text-lg leading-relaxed mb-12">
            {subheading}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/10 border border-white/15 rounded-xl p-4"
              >
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs font-medium text-white/70 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-white/50 mt-12 lg:mt-0">© 2026 Urban Company</p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="lg:w-1/2 bg-[#F8FAFC] flex items-center justify-center p-6 lg:p-12 min-h-screen lg:min-h-0">
        {children}
      </div>
    </div>
  );
}
