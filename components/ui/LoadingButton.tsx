import React from "react";
import { Loader2 } from "lucide-react";

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: "bg-[#047260] text-white hover:bg-teal-700 border border-transparent",
  secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-2xl",
};

export function LoadingButton({
  isLoading = false,
  loadingText,
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variantClasses = variants[variant];
  const sizeClasses = sizes[size];
  const widthClasses = fullWidth ? "w-full flex-1" : "";
  const disabledClasses = isLoading || disabled ? "opacity-70 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${disabledClasses} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
