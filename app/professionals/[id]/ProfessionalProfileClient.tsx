"use client";

import React, { useState, useEffect } from "react";
import { ProfessionalHeader } from "@/components/professional/ProfessionalHeader";
import { SkillsList } from "@/components/professional/SkillsList";
import { ReviewList, type ReviewItem } from "@/components/professional/ReviewList";
import { AvailabilityCalendar } from "@/components/professional/AvailabilityCalendar";
import { ProfessionalSkeleton } from "@/components/professional/ProfessionalSkeleton";
import { toast } from "@/components/ErrorComponents";
import type { Professional, CalendarSlot } from "@prisma/client";

interface ProfessionalWithDetails extends Professional {
  user: { name: string };
  calendarSlots: CalendarSlot[];
}

interface ProfessionalProfileClientProps {
  id: string;
}

export default function ProfessionalProfileClient({ id }: ProfessionalProfileClientProps) {
  const [professional, setProfessional] = useState<ProfessionalWithDetails | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState({ experienceYears: 0, completedJobs: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfessional() {
      try {
        const res = await fetch(`/api/professionals/${id}`);
        const data = await res.json();
        
        if (res.ok) {
          setProfessional(data.professional);
          setReviews(data.reviews || []);
          setStats(data.stats || { experienceYears: 0, completedJobs: 0 });
        } else {
          toast.error(data.error || "Failed to load professional profile");
        }
      } catch (err) {
        toast.error("Network error while fetching professional details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfessional();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <ProfessionalSkeleton />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Professional Not Found</h2>
        <p className="text-slate-500">We couldn't find the professional you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 flex flex-col">
          <ProfessionalHeader 
            name={professional.user.name}
            rating={professional.rating}
            experienceYears={stats.experienceYears}
            completedJobs={stats.completedJobs}
          />
          
          <SkillsList skillsStr={professional.skills} />
          
          <ReviewList reviews={reviews} />
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[400px]">
          <AvailabilityCalendar 
            slots={professional.calendarSlots} 
            professionalId={professional.id} 
          />
        </div>
      </div>
    </div>
  );
}
