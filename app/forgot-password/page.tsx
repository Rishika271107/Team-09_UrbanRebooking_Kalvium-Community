"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const STATS = [
  { value: "1M+", label: "Happy customers" },
  { value: "40k+", label: "Verified pros" },
  { value: "4.8★", label: "Avg. rating" },
];

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (res.ok || res.status === 404) {
        setSuccess(true);
        return;
      }

      if (res.status === 429) {
        setServerError("Too many attempts. Please wait a minute and try again.");
        return;
      }

      const json = await res.json().catch(() => ({}));
      setServerError(
        json?.error || "Something went wrong. Please try again."
      );
    } catch {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── LEFT MARKETING PANEL ── */}
      <div
        className="lg:w-1/2 flex flex-col justify-between p-10 lg:p-[52px] text-white min-h-[320px] lg:min-h-screen"
        style={{ backgroundColor: "#007F73" }}
      >
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

        <p className="text-white/70 mt-12 lg:mt-0" style={{ fontSize: "14px" }}>
          © 2026 Urban Company
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
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
          {success ? (
            <div className="flex flex-col items-center text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: "#E6F4F2" }}
              >
                <Mail className="w-8 h-8" style={{ color: "#00897B" }} />
              </div>
              <h2
                className="font-bold text-slate-900 mb-2"
                style={{ fontSize: "24px" }}
              >
                Check your email
              </h2>
              <p
                className="text-slate-500 mb-6 leading-relaxed"
                style={{ fontSize: "15px", maxWidth: "340px" }}
              >
                If an account exists for{" "}
                <span className="font-semibold text-slate-700">
                  {getValues("email")}
                </span>
                , we&apos;ve sent a password reset link. Check your inbox (and
                spam folder).
              </p>
              <Link
                href="/login"
                className="flex items-center gap-2 font-semibold hover:underline"
                style={{ color: "#00897B", fontSize: "15px" }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign in
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors mb-6"
                style={{ fontSize: "14px" }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign in
              </Link>

              <div className="mb-6">
                <h2
                  className="font-bold text-slate-900 mb-1"
                  style={{ fontSize: "28px" }}
                >
                  Forgot password?
                </h2>
                <p className="text-slate-500" style={{ fontSize: "16px" }}>
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                suppressHydrationWarning
                className="flex flex-col gap-5"
              >
                {serverError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                    {serverError}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="customer@urban.co"
                    {...register("email")}
                    className={`w-full px-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-colors ${
                      errors.email
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-[#D1D5DB] focus:border-[#00897B] focus:ring-2 focus:ring-[#00897B]/10"
                    }`}
                    style={{
                      height: "40px",
                      borderRadius: "10px",
                      border: errors.email
                        ? "1px solid #f87171"
                        : "1px solid #D1D5DB",
                    }}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  suppressHydrationWarning
                  className="w-full text-white font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00897B] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "#00897B",
                    fontSize: "15px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting)
                      e.currentTarget.style.backgroundColor = "#00796B";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting)
                      e.currentTarget.style.backgroundColor = "#00897B";
                  }}
                >
                  {isSubmitting ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
