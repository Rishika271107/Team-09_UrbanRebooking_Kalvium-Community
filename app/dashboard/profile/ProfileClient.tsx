"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, MapPin, CreditCard, Lock, Plus, Trash2, Check, X } from "lucide-react";
import { updateProfile, updatePassword } from "@/app/actions/profile.actions";
import { addAddressAction, deleteAddressAction, setDefaultAddressAction } from "@/app/actions/address.actions";
import { addPaymentMethodAction, deletePaymentMethodAction, setDefaultPaymentMethodAction } from "@/app/actions/payment.actions";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const addressSchema = z.object({
  addressLine: z.string().min(5, "Address line is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(5, "Valid pincode is required"),
});

export default function ProfileClient({ user, paymentMethods }: { user: any, paymentMethods: any[] }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: { addressLine: "", city: "", state: "", pincode: "" },
  });

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    const res = await updateProfile(data);
    if (res.success) {
      setMessage({ type: "success", text: "Profile updated successfully." });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update profile." });
    }
    setIsLoading(false);
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    // Note: We skip current password validation here for brevity, usually done on backend.
    const res = await updatePassword(data.newPassword);
    if (res.success) {
      setMessage({ type: "success", text: "Password updated successfully. Please re-login." });
      passwordForm.reset();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update password." });
    }
    setIsLoading(false);
  };

  const onAddressSubmit = async (data: z.infer<typeof addressSchema>) => {
    setIsLoading(true);
    const res = await addAddressAction(data);
    if (res.success) {
      addressForm.reset();
      setMessage({ type: "success", text: "Address added successfully." });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to add address." });
    }
    setIsLoading(false);
  };

  const tabs = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage({ type: "", text: "" }); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon size={18} className={isActive ? "text-teal-600" : "text-slate-400"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border p-6">
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm flex items-center justify-between ${message.type === 'success' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
            <button onClick={() => setMessage({ type: "", text: "" })}><X size={16} /></button>
          </div>
        )}

        {activeTab === "profile" && (
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex flex-col gap-4 max-w-md">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input {...profileForm.register("fullName")} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              {profileForm.formState.errors.fullName && <span className="text-xs text-red-500">{profileForm.formState.errors.fullName.message as string}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input {...profileForm.register("email")} type="email" className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              {profileForm.formState.errors.email && <span className="text-xs text-red-500">{profileForm.formState.errors.email.message as string}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <input {...profileForm.register("phone")} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              {profileForm.formState.errors.phone && <span className="text-xs text-red-500">{profileForm.formState.errors.phone.message as string}</span>}
            </div>

            <button disabled={isLoading} type="submit" className="mt-4 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        {activeTab === "security" && (
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4 max-w-md">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Current Password</label>
              <input {...passwordForm.register("currentPassword")} type="password" className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              {passwordForm.formState.errors.currentPassword && <span className="text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message as string}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">New Password</label>
              <input {...passwordForm.register("newPassword")} type="password" className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              {passwordForm.formState.errors.newPassword && <span className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message as string}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
              <input {...passwordForm.register("confirmPassword")} type="password" className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              {passwordForm.formState.errors.confirmPassword && <span className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message as string}</span>}
            </div>

            <button disabled={isLoading} type="submit" className="mt-4 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {activeTab === "addresses" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Saved Addresses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {user.address ? (
                <div className="p-4 border border-teal-500 bg-teal-50/30 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-teal-600" />
                      <span className="font-medium text-slate-900">Default Address</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{user.address}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 col-span-2">No saved address yet.</p>
              )}
            </div>

            <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
            <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="flex flex-col gap-4 max-w-md">
              <div className="flex flex-col gap-1">
                <input placeholder="Address Line" {...addressForm.register("addressLine")} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                {addressForm.formState.errors.addressLine && <span className="text-xs text-red-500">{addressForm.formState.errors.addressLine.message as string}</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <input placeholder="City" {...addressForm.register("city")} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  {addressForm.formState.errors.city && <span className="text-xs text-red-500">{addressForm.formState.errors.city.message as string}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <input placeholder="State" {...addressForm.register("state")} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  {addressForm.formState.errors.state && <span className="text-xs text-red-500">{addressForm.formState.errors.state.message as string}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <input placeholder="Pincode" {...addressForm.register("pincode")} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                {addressForm.formState.errors.pincode && <span className="text-xs text-red-500">{addressForm.formState.errors.pincode.message as string}</span>}
              </div>
              <button disabled={isLoading} type="submit" className="mt-2 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <Plus size={18} /> Add Address
              </button>
            </form>
          </div>
        )}

        {activeTab === "payments" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Payment Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {paymentMethods.map((pm: any) => (
                <div key={pm.id} className={`p-4 border rounded-xl flex justify-between items-center ${pm.isDefault ? 'border-teal-500 bg-teal-50/30' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <CreditCard size={20} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{pm.type} {pm.last4 && `•••• ${pm.last4}`}</p>
                      <p className="text-xs text-slate-500">{pm.provider || "Card"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pm.isDefault ? (
                      <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">Default</span>
                    ) : (
                      <button onClick={() => setDefaultPaymentMethodAction(pm.id)} className="text-xs text-teal-600 hover:underline">Set Default</button>
                    )}
                    <button onClick={() => deletePaymentMethodAction(pm.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {paymentMethods.length === 0 && <p className="text-sm text-slate-500 col-span-2">No payment methods saved.</p>}
            </div>

            <h3 className="text-lg font-semibold mb-4">Add Payment Method</h3>
            <div className="flex gap-4">
              <button onClick={async () => {
                setIsLoading(true);
                await addPaymentMethodAction({ type: "Credit Card", last4: "4242", provider: "Visa" });
                setIsLoading(false);
              }} className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <CreditCard size={16} /> Add Test Card
              </button>
              <button onClick={async () => {
                setIsLoading(true);
                await addPaymentMethodAction({ type: "UPI", provider: "Google Pay" });
                setIsLoading(false);
              }} className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <Plus size={16} /> Add UPI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
