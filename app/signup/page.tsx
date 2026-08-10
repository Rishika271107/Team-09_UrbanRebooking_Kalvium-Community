"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthCard } from "@/components/AuthCard";
import InputField from "@/components/InputField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const STATS = [
  { value: "1M+", label: "Happy customers" },
  { value: "40K+", label: "Verified pros" },
  { value: "4.8★", label: "Avg. rating" },
];

const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  email: z.string().min(1, "Email is required.").email("Please enter a valid email address."),
  phone: z.string().min(1, "Phone number is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms & Privacy Policy.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const agreeTerms = watch("agreeTerms");

  const onSubmit = async (data: SignupFormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });

      const resBody = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(resBody?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);

      // Auto sign-in right after account creation for a smoother flow.
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult && !signInResult.error) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setServerError("Could not reach the server. Please check your connection and try again.");
    }
  };

  return (
    <AuthLayout
      heading="Create your account and book trusted services instantly."
      subheading="Join millions of customers who book trusted professionals for cleaning, repairs, beauty and other home services."
      stats={STATS}
    >
      <AuthCard>
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-[#04726018] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#047260]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Account created!</h2>
            <p className="text-sm text-slate-500 mb-6">Welcome to Urban Company. You can now sign in.</p>
            <Link href="/login" className="inline-block bg-[#047260] hover:bg-[#035d4f] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <h2 className="text-[26px] font-bold text-slate-900 leading-tight tracking-tight">
                Create your account
              </h2>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Sign up to manage bookings and rebook your favorite professionals.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
              {serverError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                  {serverError}
                </div>
              )}
              
              <InputField id="fullName" label="Full Name" placeholder="Enter your full name" {...register("fullName")} error={errors.fullName?.message} required />
              <InputField id="email" label="Email" type="email" placeholder="customer@urban.co" {...register("email")} error={errors.email?.message} required />
              <InputField id="phone" label="Phone Number" type="tel" placeholder="+91 XXXXX XXXXX" {...register("phone")} error={errors.phone?.message} required />
              <InputField id="password" label="Password" type="password" placeholder="Create password" {...register("password")} error={errors.password?.message} required />
              <InputField id="confirmPassword" label="Confirm Password" type="password" placeholder="Confirm password" {...register("confirmPassword")} error={errors.confirmPassword?.message} required />

              <div className="mt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input id="agreeTerms" type="checkbox" {...register("agreeTerms")} className="sr-only peer" />
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${agreeTerms ? "bg-[#047260] border-[#047260]" : "border-slate-300 bg-white"} ${errors.agreeTerms ? "border-red-400" : ""}`}
                    >
                      {agreeTerms && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-600 leading-snug">
                    By creating an account, you agree to our{" "}
                    <Link href="#" className="text-[#047260] font-medium hover:underline">Terms</Link>{" "}&{" "}
                    <Link href="#" className="text-[#047260] font-medium hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-xs text-red-500 mt-1.5 ml-7">{errors.agreeTerms.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                suppressHydrationWarning
                className="w-full h-[46px] mt-2 bg-[#047260] hover:bg-[#035d4f] text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#047260] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating account…" : "Create account"}
              </button>

              <p className="text-center text-sm text-slate-500 mt-1">
                Already have an account?{" "}
                <Link href="/login" className="text-[#047260] font-semibold hover:underline">Sign in</Link>
              </p>
            </form>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
