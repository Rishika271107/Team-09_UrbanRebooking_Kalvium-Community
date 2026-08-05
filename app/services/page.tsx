import React from "react";
import ServicesClient from "./ServicesClient";

export const metadata = {
  title: "Services | Urban Company Rebooking",
  description: "Browse our selection of professional services.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <ServicesClient />
    </div>
  );
}
