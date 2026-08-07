import React from "react";
import { Star, Shield, Briefcase, MapPin } from "lucide-react";

interface ProfessionalHeaderProps {
  name: string;
  rating: number;
  experienceYears: number;
  completedJobs: number;
}

export function ProfessionalHeader({ name, rating, experienceYears, completedJobs }: ProfessionalHeaderProps) {
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-[#047260] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-sm">
          {initials}
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1">
          <div className="bg-teal-50 text-teal-600 rounded-full p-1 border border-teal-100">
            <Shield size={16} />
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
          <span className="hidden md:inline text-slate-300">•</span>
          <div className="flex items-center justify-center md:justify-start gap-1 bg-amber-50 px-2 py-0.5 rounded-full w-fit mx-auto md:mx-0">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-amber-700">{rating.toFixed(1)} Rating</span>
          </div>
        </div>
        
        <p className="text-sm text-slate-500 mb-4 max-w-lg">
          Top-rated professional specializing in providing exceptional service with high attention to detail. Background-verified and fully vaccinated.
        </p>

        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Briefcase size={16} className="text-slate-400" />
            <span>{experienceYears}+ Years Exp.</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Shield size={16} className="text-slate-400" />
            <span>{completedJobs} Jobs</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <MapPin size={16} className="text-slate-400" />
            <span>Local Pro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
