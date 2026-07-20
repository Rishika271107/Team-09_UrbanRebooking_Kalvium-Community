"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthLayout from "@/components/AuthLayout";
import AuthCard from "@/components/AuthCard";
import InputField from "@/components/InputField";

const STATS = [
  { value: "1M+", label: "Happy customers" },
  { value: "40K+", label: "Verified pros" },
  { value: "4.8★", label: "Avg. rating" },
];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!validateEmail(form.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    if (!form.password) {
      errs.password = "Password is required.";
    } else if (form.password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
    if (!form.agreeTerms) {
      errs.agreeTerms = "You must agree to the Terms & Privacy Policy.";
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);

      // Auto sign-in right after account creation for a smoother flow.
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult && !signInResult.error) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setFormError("Could not reach the server. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
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

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <InputField id="fullName" label="Full Name" placeholder="Enter your full name" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
              <InputField id="email" label="Email" type="email" placeholder="customer@urban.co" value={form.email} onChange={handleChange} error={errors.email} required />
              <InputField id="phone" label="Phone Number" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} error={errors.phone} required />
              <InputField id="password" label="Password" type="password" placeholder="Create password" value={form.password} onChange={handleChange} error={errors.password} required />
              <InputField id="confirmPassword" label="Confirm Password" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />

              <div className="mt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input id="agreeTerms" name="agreeTerms" type="checkbox" checked={form.agreeTerms} onChange={handleChange} className="sr-only peer" />
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${form.agreeTerms ? "bg-[#047260] border-[#047260]" : "border-slate-300 bg-white"} ${errors.agreeTerms ? "border-red-400" : ""}`}
                      onClick={() => setForm((prev) => ({ ...prev, agreeTerms: !prev.agreeTerms }))}
                    >
                      {form.agreeTerms && (
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
                {errors.agreeTerms && <p className="text-xs text-red-500 mt-1.5 ml-7">{errors.agreeTerms}</p>}
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
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
