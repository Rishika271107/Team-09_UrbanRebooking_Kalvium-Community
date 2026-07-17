import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="w-full max-w-[480px] bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-9">
      {children}
    </div>
  );
}
