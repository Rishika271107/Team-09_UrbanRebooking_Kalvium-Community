"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin, Trash2, Plus, X, LogOut, ShieldCheck,
  KeyRound, Star, Camera, ChevronDown, ChevronUp,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { updateProfile, updatePassword } from "@/app/actions/profile.actions";
import {
  addAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/app/actions/address.actions";
import type { AddressStub } from "@/services/address.service";
import { AddPaymentModal } from "@/components/payment/AddPaymentModal";
import { PaymentEmptyState } from "@/components/payment/PaymentEmptyState";
import { PaymentList } from "@/components/payment/PaymentList";
import { PaymentSkeleton } from "@/components/payment/PaymentSkeleton";

/* ─── Schemas ──────────────────────────────────────────────────────── */
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  addressLine: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Valid pincode is required"),
});

/* ─── Static mock data ────────────────────────────────────────────── */
const PREFERRED_PROFESSIONALS = [
  { initials: "AS", color: "bg-teal-100 text-teal-700", name: "Aarav Sharma", specialty: "Home Cleaning", rating: 4.9 },
  { initials: "PM", color: "bg-purple-100 text-purple-700", name: "Priya Menon", specialty: "Salon at Home", rating: 4.8 },
  { initials: "RV", color: "bg-orange-100 text-orange-700", name: "Rohit Verma", specialty: "AC Service & Repair", rating: 4.7 },
  { initials: "SI", color: "bg-blue-100 text-blue-700", name: "Sana Iqbal", specialty: "Massage Therapy", rating: 4.95 },
];

/* ─── Toggle switch ───────────────────────────────────────────────── */
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? "bg-teal-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ─── Section card ────────────────────────────────────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Input field ─────────────────────────────────────────────────── */
function Field({
  label,
  error,
  children,
  readOnly,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-500">{label}</label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

const inputCls =
  "px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors placeholder:text-slate-400";
const readOnlyCls =
  "px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50 cursor-not-allowed";

/* ─── Password modal ──────────────────────────────────────────────── */
function PasswordModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (data: z.infer<typeof passwordSchema>) => {
    startTransition(async () => {
      const res = await updatePassword(data.newPassword);
      if (res.success) {
        setMsg("Password updated! Please sign in again.");
        setTimeout(() => signOut({ callbackUrl: "/login" }), 1500);
      } else {
        setMsg(res.error || "Failed to update password.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
        <h3 className="text-lg font-bold text-slate-900 mb-5">Change Password</h3>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field, i) => (
            <Field
              key={field}
              label={["Current Password", "New Password", "Confirm New Password"][i]}
              error={form.formState.errors[field]?.message as string}
            >
              <input
                {...form.register(field)}
                type="password"
                className={inputCls}
                placeholder="••••••••"
              />
            </Field>
          ))}

          {msg && (
            <p className={`text-sm ${msg.includes("updated") ? "text-teal-600" : "text-red-500"}`}>
              {msg}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 w-full py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-60"
          >
            {isPending ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function ProfileClient({
  user,
  addresses: initialAddresses,
}: {
  user: any;
  addresses: AddressStub[];
}) {
  /* Profile form */
  const [profilePending, startProfileTransition] = useTransition();
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { update } = useSession();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.name || user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
    },
  });

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    startProfileTransition(async () => {
      const res = await updateProfile(data);
      if (res.success) {
        await update({ name: data.fullName, email: data.email });
      }
      setProfileMsg(
        res.success
          ? { type: "success", text: "Profile updated successfully." }
          : { type: "error", text: res.error || "Failed to update." }
      );
      setTimeout(() => setProfileMsg(null), 3000);
    });
  };

  /* Addresses */
  const [addresses, setAddresses] = useState<AddressStub[]>(initialAddresses);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrPending, startAddrTransition] = useTransition();

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: "", addressLine: "", city: "", state: "", pincode: "" },
  });

  const onAddAddress = (data: z.infer<typeof addressSchema>) => {
    const optimistic: AddressStub = {
      id: `tmp-${Date.now()}`,
      userId: user.id,
      addressLine: `${data.addressLine}, ${data.city}, ${data.state} - ${data.pincode}`,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isDefault: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, optimistic]);
    setShowAddressForm(false);
    addressForm.reset();

    startAddrTransition(async () => {
      await addAddressAction({
        addressLine: data.addressLine,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      });
    });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    startAddrTransition(async () => {
      await deleteAddressAction(id);
    });
  };

  const handleSetDefaultAddress = (id: string) => {
    // Optimistic: this address becomes default, all others are not
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    startAddrTransition(async () => {
      await setDefaultAddressAction(id);
    });
  };

  /* Payments */
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const handleAddPayment = (method: any) => {
    setPaymentMethods((prev) => [...prev, method]);
    setShowAddPaymentModal(false);
  };
  const handleDeletePayment = (id: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
  };
  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
  };

  /* Notification toggles */
  const [notifSettings, setNotifSettings] = useState({
    bookingUpdates: true,
    paymentReceipts: true,
    reminders: true,
    promotionalOffers: false,
  });

  const toggleNotif = (key: keyof typeof notifSettings) =>
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  /* Modals */
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  /* Avatar initials */
  const initials = (user.name || user.fullName || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const role =
    user.role === "PROFESSIONAL"
      ? "Professional"
      : user.role === "ADMIN"
      ? "Admin"
      : "Customer";

  return (
    <>
      {showAddPaymentModal && <AddPaymentModal onClose={() => setShowAddPaymentModal(false)} onAdd={handleAddPayment} />}
      {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} />}

      {showDeactivateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Deactivate Account?</h3>
            <p className="text-sm text-slate-500 mb-6">
              This will disable your account. You can reactivate by contacting support.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 flex-1 min-w-0">

          {/* Personal Information */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-5">Personal information</h2>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[#047260] flex items-center justify-center text-white text-xl font-bold select-none">
                  {initials}
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Camera size={15} />
                Change photo
              </button>
            </div>

            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Full name"
                  error={profileForm.formState.errors.fullName?.message as string}
                >
                  <input
                    {...profileForm.register("fullName")}
                    className={inputCls}
                    placeholder="Your full name"
                  />
                </Field>

                <Field
                  label="Email"
                  error={profileForm.formState.errors.email?.message as string}
                >
                  <input
                    {...profileForm.register("email")}
                    type="email"
                    className={inputCls}
                    placeholder="your@email.com"
                  />
                </Field>

                <Field
                  label="Phone"
                  error={profileForm.formState.errors.phone?.message as string}
                >
                  <input
                    {...profileForm.register("phone")}
                    className={inputCls}
                    placeholder="+1 555 000 0000"
                  />
                </Field>

                <Field label="Role" readOnly>
                  <input value={role} readOnly className={readOnlyCls} />
                </Field>
              </div>

              {profileMsg && (
                <p
                  className={`text-sm font-medium ${
                    profileMsg.type === "success" ? "text-teal-600" : "text-red-500"
                  }`}
                >
                  {profileMsg.text}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={profilePending}
                  className="px-5 py-2.5 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors disabled:opacity-60"
                >
                  {profilePending ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => profileForm.reset()}
                  className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>

          {/* Saved addresses */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Saved addresses</h2>

            <div className="flex flex-col divide-y divide-slate-100">
              {addresses.length === 0 && !showAddressForm && (
                <p className="text-sm text-slate-400 py-2">No saved addresses yet.</p>
              )}

              {addresses.map((addr) => {
                const displayAddress = [addr.addressLine, addr.city, addr.state, addr.pincode]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <div key={addr.id} className="flex items-center gap-3 py-3.5">
                    <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800">
                          {addr.isDefault ? "Home" : "Office"}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{displayAddress}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors whitespace-nowrap"
                        >
                          Set default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add address form (inline) */}
            {showAddressForm && (
              <form
                onSubmit={addressForm.handleSubmit(onAddAddress)}
                className="mt-4 flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Label (e.g. Home, Office)" error={addressForm.formState.errors.label?.message as string}>
                    <input {...addressForm.register("label")} className={inputCls} placeholder="Home" />
                  </Field>
                  <Field label="City" error={addressForm.formState.errors.city?.message as string}>
                    <input {...addressForm.register("city")} className={inputCls} placeholder="Mumbai" />
                  </Field>
                </div>
                <Field label="Address Line" error={addressForm.formState.errors.addressLine?.message as string}>
                  <input {...addressForm.register("addressLine")} className={inputCls} placeholder="221B Baker Street" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="State" error={addressForm.formState.errors.state?.message as string}>
                    <input {...addressForm.register("state")} className={inputCls} placeholder="Maharashtra" />
                  </Field>
                  <Field label="Pincode" error={addressForm.formState.errors.pincode?.message as string}>
                    <input {...addressForm.register("pincode")} className={inputCls} placeholder="400050" />
                  </Field>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={addrPending}
                    className="px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors disabled:opacity-60"
                  >
                    {addrPending ? "Saving…" : "Save address"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddressForm(false); addressForm.reset(); }}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="mt-4 w-full py-2.5 rounded-lg border border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={15} /> Add new address
              </button>
            )}
          </Card>

          {/* Payment Methods */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Payment methods</h2>
            
            {isPaymentsLoading ? (
              <PaymentSkeleton />
            ) : paymentMethods.length === 0 ? (
              <PaymentEmptyState onAddPayment={() => setShowAddPaymentModal(true)} />
            ) : (
              <>
                <PaymentList 
                  methods={paymentMethods} 
                  onDelete={handleDeletePayment} 
                  onSetDefault={handleSetDefaultPayment} 
                />
                <button
                  onClick={() => setShowAddPaymentModal(true)}
                  className="mt-4 w-full py-2.5 rounded-lg border border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={15} /> Add new payment method
                </button>
              </>
            )}
          </Card>

          {/* Preferred professionals */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Preferred professionals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PREFERRED_PROFESSIONALS.map((pro) => (
                <div
                  key={pro.name}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${pro.color}`}
                  >
                    {pro.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{pro.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-500">
                        {pro.rating} · {pro.specialty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 w-full lg:w-72 flex-shrink-0">

          {/* Notification settings */}
          <Card>
            <h2 className="text-base font-bold text-slate-900 mb-4">Notification settings</h2>
            <div className="flex flex-col gap-4">
              {(
                [
                  ["bookingUpdates", "Booking updates"],
                  ["paymentReceipts", "Payment receipts"],
                  ["reminders", "Reminders"],
                  ["promotionalOffers", "Promotional offers"],
                ] as [keyof typeof notifSettings, string][]
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{label}</span>
                  <Toggle
                    enabled={notifSettings[key]}
                    onChange={() => toggleNotif(key)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Security */}
          <Card>
            <h2 className="text-base font-bold text-slate-900 mb-4">Security</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <KeyRound size={15} /> Change password
              </button>
              <button className="w-full py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <ShieldCheck size={15} /> Two-factor authentication
              </button>
            </div>
          </Card>

          {/* Account */}
          <Card>
            <h2 className="text-base font-bold text-slate-900 mb-4">Account</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={15} /> Sign out
              </button>
              <button
                onClick={() => setShowDeactivateConfirm(true)}
                className="w-full py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:underline transition-colors"
              >
                Deactivate account
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}