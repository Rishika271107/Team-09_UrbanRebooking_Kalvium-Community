"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

const STATS = [
  { value: "1M+", label: "Happy customers" },
  { value: "40k+", label: "Verified pros" },
  { value: "4.8★", label: "Avg. rating" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!validateEmail(email)) errs.email = "Please enter a valid email.";
    if (!password) errs.password = "Password is required.";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setFormError("Invalid email or password. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("Something went wrong while signing in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── LEFT MARKETING PANEL ── */}
      <div
        className="lg:w-1/2 flex flex-col justify-between p-10 lg:p-[52px] text-white min-h-[320px] lg:min-h-screen"
        style={{ backgroundColor: "#007F73" }}
      >
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xl flex-shrink-0"
            style={{ backgroundColor: "#1AA394" }}
          >
            U
          </div>
          <span className="text-white font-bold" style={{ fontSize: "20px" }}>
            Urban Company
          </span>
        </div>

        {/* Hero */}
        <div className="mt-12 lg:mt-0" style={{ maxWidth: "600px" }}>
          <h1
            className="text-white font-bold leading-[1.15] mb-6"
            style={{ fontSize: "clamp(28px, 4vw, 42px)" }}
          >
            Book trusted home services in a single tap.
          </h1>
          <p
            className="text-white/80 leading-relaxed mb-12"
            style={{ fontSize: "18px", maxWidth: "520px" }}
          >
            Rebook your favorite professional instantly. We remember your
            preferences, addresses, and schedule so you don&apos;t have to.
          </p>

          {/* Stat Cards */}
          <div className="flex flex-wrap gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl flex flex-col justify-center"
                style={{
                  width: "150px",
                  height: "80px",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  padding: "0 20px",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <p className="text-white font-bold" style={{ fontSize: "28px", lineHeight: 1 }}>
                  {s.value}
                </p>
                <p className="text-white/80 mt-1" style={{ fontSize: "14px" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/70 mt-12 lg:mt-0" style={{ fontSize: "14px" }}>
          © 2026 Urban Company
        </p>
      </div>

      {/* ── RIGHT LOGIN SECTION ── */}
      <div
        className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 min-h-screen lg:min-h-0"
        style={{ backgroundColor: "#F7F9FC" }}
      >
        <div
          className="w-full bg-white"
          style={{
            maxWidth: "500px",
            padding: "36px",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          {/* Card Header */}
          <div className="mb-6">
            <h2
              className="font-bold text-slate-900 mb-1"
              style={{ fontSize: "28px" }}
            >
              Welcome back
            </h2>
            <p className="text-slate-500" style={{ fontSize: "16px" }}>
              Sign in to manage your bookings and rebook favorites.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="customer@urban.co"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                className={`w-full px-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-colors ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-[#D1D5DB] focus:border-[#00897B] focus:ring-2 focus:ring-[#00897B]/10"}`}
                style={{
                  height: "40px",
                  borderRadius: "10px",
                  border: errors.email ? "1px solid #f87171" : "1px solid #D1D5DB",
                }}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Forgot password (placeholder)")}
                  className="hover:underline focus:outline-none"
                  style={{ fontSize: "14px", color: "#00897B" }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  className={`w-full pr-10 px-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-colors ${errors.password ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-[#D1D5DB] focus:border-[#00897B] focus:ring-2 focus:ring-[#00897B]/10"}`}
                  style={{
                    height: "40px",
                    borderRadius: "10px",
                    border: errors.password ? "1px solid #f87171" : "1px solid #D1D5DB",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${rememberMe ? "bg-[#00897B] border-[#00897B]" : "border-slate-300 bg-white"}`}
                onClick={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-slate-500" style={{ fontSize: "15px" }}>
                Remember me on this device
              </span>
            </label>

            {formError && (
              <p
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                role="alert"
              >
                {formError}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00897B] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#00897B",
                fontSize: "15px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00796B")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00897B")}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>

            {/* Signup Redirect */}
            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-bold hover:underline" style={{ color: "#00897B" }}>
                Create one
              </Link>
            </p>
          </form>

          {/* Demo Accounts Box */}
          <div
            className="mt-6 rounded-xl"
            style={{
              backgroundColor: "#F9FAFB",
              border: "1.5px dashed #D1D5DB",
              padding: "14px 16px",
            }}
          >
            <p className="font-semibold text-slate-700 mb-1" style={{ fontSize: "14px" }}>
              Demo accounts
            </p>
            <p className="text-slate-500" style={{ fontSize: "14px", lineHeight: "1.5" }}>
              customer@urban.co • pro@urban.co • admin@urban.co
              <br />
              (password: password123, after running the seed script)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
