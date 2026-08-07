import React from "react";
import { Star, Award, ShieldCheck, Languages } from "lucide-react";

interface ProfessionalCardProps {
  professionalName: string;
  serviceName: string;
  isActive?: boolean;
  isAutoAssign: boolean;
  onToggleAutoAssign: (autoAssign: boolean) => void;
}

export function ProfessionalCard({ professionalName, serviceName, isActive, isAutoAssign, onToggleAutoAssign }: ProfessionalCardProps) {
  const avatarInitials = professionalName
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (isActive === false || isAutoAssign) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6">
        <div className="rounded-xl bg-amber-50 p-5 border border-amber-200">
          <p className="text-sm text-amber-800 font-medium mb-3">
            {isAutoAssign 
              ? "Auto-assignment enabled. We will assign the next best highly-rated professional for this service." 
              : `Your previous professional (${professionalName}) is currently unavailable. We will assign the next best highly-rated professional for this service.`}
          </p>
          {isActive !== false && (
            <button 
              type="button" 
              onClick={() => onToggleAutoAssign(false)}
              className="text-sm font-semibold text-teal-700 hover:underline hover:text-teal-800 transition-colors"
            >
              Stick with {professionalName} instead
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="h-24 w-24 rounded-full bg-[#047260] shadow-md flex items-center justify-center text-3xl font-bold text-white">
              {avatarInitials}
            </div>
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-bold border border-amber-100">
              <Star size={14} className="fill-amber-500 text-amber-500" />
              4.9
            </div>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{professionalName}</h4>
              <p className="text-slate-500 font-medium mt-1">Expert in {serviceName.split(" ")[0]}</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <Award size={18} className="text-teal-600" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Experience</p>
                  <p className="font-semibold text-sm">5+ Years</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <ShieldCheck size={18} className="text-teal-600" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jobs Done</p>
                  <p className="font-semibold text-sm">1,240+</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 col-span-2 lg:col-span-1">
                <Languages size={18} className="text-teal-600" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Speaks</p>
                  <p className="font-semibold text-sm">English, Hindi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            type="button" 
            onClick={() => onToggleAutoAssign(true)}
            className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors"
          >
            Change Professional (Auto-Assign next best)
          </button>
        </div>
      </div>
    </div>
  );
}
