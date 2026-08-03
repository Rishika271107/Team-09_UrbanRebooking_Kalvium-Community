import React from "react";

export interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ content, children, position = "top", className = "" }: TooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-b-transparent border-l-transparent border-r-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-t-transparent border-l-transparent border-r-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-r-transparent border-t-transparent border-b-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-l-transparent border-t-transparent border-b-transparent",
  };

  return (
    <div className={`group relative inline-block ${className}`}>
      {children}
      <div 
        role="tooltip"
        className={`absolute z-50 invisible opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ${positionClasses[position]}`}
      >
        <div className="relative px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap">
          {content}
          <div 
            className={`absolute border-4 w-0 h-0 ${arrowClasses[position]}`}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
