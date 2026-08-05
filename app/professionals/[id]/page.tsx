import React from "react";
import ProfessionalProfileClient from "./ProfessionalProfileClient";

export const metadata = {
  title: "Professional Profile | Urban Company Rebooking",
  description: "View professional details and availability.",
};

export default function ProfessionalProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <ProfessionalProfileClient id={params.id} />
    </div>
  );
}
