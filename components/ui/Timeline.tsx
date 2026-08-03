import React from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status: "completed" | "current" | "upcoming";
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className = "" }: TimelineProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCompleted = item.status === "completed";
        const isCurrent = item.status === "current";

        return (
          <div key={item.id} className="relative flex gap-4">
            {/* Timeline Line */}
            {!isLast && (
              <div 
                className={`absolute left-[11px] top-6 bottom-0 w-0.5 -ml-px ${
                  isCompleted ? "bg-[#047260]" : "bg-slate-200"
                }`} 
                aria-hidden="true"
              />
            )}

            {/* Timeline Icon */}
            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center bg-white">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-[#047260]" aria-hidden="true" />
              ) : isCurrent ? (
                <Clock className="h-5 w-5 text-amber-500" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300 border-2 border-white rounded-full bg-slate-300" aria-hidden="true" />
              )}
            </div>

            {/* Timeline Content */}
            <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                <h4 className={`text-sm font-bold ${isCompleted || isCurrent ? "text-slate-900" : "text-slate-500"}`}>
                  {item.title}
                </h4>
                {item.date && (
                  <span className="text-xs font-medium text-slate-400">
                    {item.date}
                  </span>
                )}
              </div>
              {item.description && (
                <p className={`mt-1 text-sm ${isCurrent ? "text-slate-700" : "text-slate-500"}`}>
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
