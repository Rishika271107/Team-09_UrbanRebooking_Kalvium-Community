"use client";

import React, { useState } from "react";
import { 
  Avatar, 
  Breadcrumb, 
  ConfirmationDialog, 
  DatePicker, 
  Dropdown, 
  LoadingButton, 
  Modal, 
  PriceBreakdownCard, 
  RatingStars, 
  StatusBadge, 
  Timeline, 
  TimePicker, 
  Tooltip 
} from "@/components/ui";
import { Bell, CreditCard, LogOut, MoreVertical, Settings, User } from "lucide-react";
import { toast } from "@/components/ErrorComponents";

export default function UiKitClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");

  const handleConfirm = async () => {
    setIsDeleting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsDeleting(false);
    setIsConfirmOpen(false);
    toast.success("Item deleted successfully.");
  };

  const next3Days = Array.from({ length: 3 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">UI Component Kit</h1>
        <p className="text-slate-500">A collection of highly reusable components used across the platform.</p>
      </div>

      {/* Basic Elements */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">1. Basic Elements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">LoadingButton</h3>
            <div className="flex flex-wrap gap-4">
              <LoadingButton variant="primary">Primary</LoadingButton>
              <LoadingButton variant="secondary">Secondary</LoadingButton>
              <LoadingButton variant="danger">Danger</LoadingButton>
              <LoadingButton variant="ghost">Ghost</LoadingButton>
              <LoadingButton variant="primary" isLoading loadingText="Saving...">Loading</LoadingButton>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">StatusBadge</h3>
            <div className="flex flex-wrap gap-4">
              <StatusBadge status="CONFIRMED" />
              <StatusBadge status="COMPLETED" />
              <StatusBadge status="RESCHEDULED" />
              <StatusBadge status="CANCELLED" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">RatingStars</h3>
            <div className="flex flex-col gap-2">
              <RatingStars rating={4.5} showText />
              <RatingStars rating={3} size={20} />
              <RatingStars rating={1.5} maxStars={3} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Avatar</h3>
            <div className="flex flex-wrap items-end gap-4">
              <Avatar name="John Doe" size="sm" />
              <Avatar name="Alice Smith" size="md" />
              <Avatar name="Bob Wilson" size="lg" />
              <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" size="xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation & Overlays */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">2. Navigation & Overlays</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Breadcrumb</h3>
            <Breadcrumb items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Bookings", href: "/bookings" },
              { label: "Details" }
            ]} />
          </div>

          <div className="space-y-4 flex flex-col items-start">
            <h3 className="font-semibold text-slate-700">Dropdown & Tooltip</h3>
            <div className="flex gap-8 items-center">
              <Dropdown 
                trigger={
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">
                    <MoreVertical size={20} className="text-slate-600" />
                  </button>
                }
                items={[
                  { id: "1", label: "Profile", icon: <User size={16}/> },
                  { id: "2", label: "Settings", icon: <Settings size={16}/> },
                  { id: "3", label: "Billing", icon: <CreditCard size={16}/> },
                  { id: "4", label: "Logout", icon: <LogOut size={16}/>, danger: true },
                ]}
              />

              <Tooltip content="Mark all as read" position="top">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <Bell size={20} />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            <h3 className="font-semibold text-slate-700">Dialogs</h3>
            <div className="flex gap-4">
              <LoadingButton onClick={() => setIsModalOpen(true)}>Open Modal</LoadingButton>
              <LoadingButton variant="danger" onClick={() => setIsConfirmOpen(true)}>Open Confirmation</LoadingButton>
            </div>
          </div>
        </div>
      </section>

      {/* Complex Components */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">3. Complex Components</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Timeline</h3>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <Timeline items={[
                { id: "1", title: "Booking Confirmed", date: "Aug 10, 10:00 AM", status: "completed" },
                { id: "2", title: "Professional Assigned", description: "Aarav Sharma is on the way.", date: "Aug 12, 9:30 AM", status: "current" },
                { id: "3", title: "Service Completion", status: "upcoming" }
              ]} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Price Breakdown</h3>
            <PriceBreakdownCard 
              items={[
                { label: "AC Servicing (x2)", amount: 99.00 },
                { label: "Safety Fee", amount: 2.00 },
                { label: "Promo Code (SAVE20)", amount: 20.00, isDiscount: true }
              ]}
              total={81.00}
            />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <h3 className="font-semibold text-slate-700">Date & Time Pickers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DatePicker 
                dates={next3Days} 
                selectedDate={selectedDate} 
                onSelect={setSelectedDate} 
              />
              <TimePicker 
                slots={["09:00 AM", "10:00 AM", "01:30 PM", "04:00 PM"]} 
                selectedSlot={selectedTime} 
                onSelect={setSelectedTime} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hidden Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Example Modal">
        <p className="text-slate-600 mb-4">This is a highly reusable modal component. It supports automatic focus trapping, escape key to close, and backdrop blur.</p>
        <div className="h-32 bg-slate-100 rounded-xl border border-slate-200 border-dashed flex items-center justify-center text-slate-400">
          Modal Content Area
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone and a cancellation fee may apply."
        confirmText="Yes, Cancel Booking"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
