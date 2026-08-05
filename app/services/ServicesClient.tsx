"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SearchBar } from "@/components/services/SearchBar";
import { FilterPanel } from "@/components/services/FilterPanel";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { ServiceSkeleton } from "@/components/services/ServiceSkeleton";
import { ServiceCategory } from "@/components/services/ServiceCategory";
import type { Service } from "@prisma/client";
import { toast } from "@/components/ErrorComponents";

export default function ServicesClient() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const fetchServices = useCallback(async (query: string, category: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (category) params.append("category", category);
      
      const endpoint = (query || category) 
        ? `/api/services/search?${params.toString()}` 
        : `/api/services`;
        
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (res.ok) {
        setServices(data.services || []);
        
        // Extract unique categories for the filter panel on initial load
        if (!query && !category && categories.length === 0) {
          const uniqueCategories = Array.from(new Set((data.services as Service[]).map(s => s.category)));
          setCategories(uniqueCategories);
        }
      } else {
        toast.error(data.error || "Failed to load services");
      }
    } catch (e) {
      toast.error("Network error while fetching services");
    } finally {
      setIsLoading(false);
    }
  }, [categories.length]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchServices(searchQuery, activeCategory);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, activeCategory, fetchServices]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
      <div className="mb-8 sm:mb-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-3 sm:mb-4">
          Discover Our Services
        </h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto mb-6 sm:mb-8">
          From home cleaning to professional salon services, find exactly what you need.
        </p>
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search for 'AC Repair', 'Cleaning', etc..."
        />
      </div>

      <div className="mb-6 sm:mb-8">
        <FilterPanel 
          categories={categories} 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </div>

      {isLoading ? (
        <ServiceSkeleton />
      ) : (
        <>
          {activeCategory ? (
            <div className="mb-8">
              <ServiceCategory title={activeCategory} />
              <ServiceGrid services={services} />
            </div>
          ) : (
            // Group services by category if no category is active and no search query
            searchQuery ? (
              <ServiceGrid services={services} />
            ) : (
              categories.map(cat => {
                const catServices = services.filter(s => s.category === cat);
                if (catServices.length === 0) return null;
                return (
                  <div key={cat} className="mb-10">
                    <ServiceCategory title={cat} />
                    <ServiceGrid services={catServices} />
                  </div>
                );
              })
            )
          )}
        </>
      )}
    </div>
  );
}
