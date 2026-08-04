"use client";

import React, { useEffect, useState, useMemo } from "react";
import { QuickRebookCard, QuickRebookProps } from "@/components/dashboard/QuickRebookCard";
import { Search, Filter, CalendarX2 } from "lucide-react";
import Link from "next/link";

interface BookingItem {
  id: string;
  status: string;
  slotStart: string | null;
  price: number;
  service: { id: string; name: string; category: string; price: number };
  professional: { id: string; active: boolean; user: { name: string } } | null;
}

export default function RebookListClient() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters and Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/bookings/history");
        const data = await res.json();
        if (res.ok && data.bookings) {
          // Only show COMPLETED bookings
          setBookings(data.bookings.filter((b: BookingItem) => b.status === "COMPLETED"));
        }
      } catch (err) {
        console.error("Failed to load completed bookings", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Compute unique service categories for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set(bookings.map(b => b.service.category));
    return ["ALL", ...Array.from(cats)];
  }, [bookings]);

  // Filter and Sort logic
  const filteredAndSortedBookings = useMemo(() => {
    let result = [...bookings];

    // 1. Search
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.service.name.toLowerCase().includes(q) || 
        (b.professional?.user.name.toLowerCase() || "").includes(q)
      );
    }

    // 2. Category Filter
    if (serviceTypeFilter !== "ALL") {
      result = result.filter(b => b.service.category === serviceTypeFilter);
    }

    // 3. Sort
    result.sort((a, b) => {
      const dateA = a.slotStart ? new Date(a.slotStart).getTime() : 0;
      const dateB = b.slotStart ? new Date(b.slotStart).getTime() : 0;
      const priceA = a.service.price || a.price || 0;
      const priceB = b.service.price || b.price || 0;

      switch (sortBy) {
        case "NEWEST":
          return dateB - dateA;
        case "OLDEST":
          return dateA - dateB;
        case "PRICE_HIGH":
          return priceB - priceA;
        case "PRICE_LOW":
          return priceA - priceB;
        default:
          return 0;
      }
    });

    return result;
  }, [bookings, searchQuery, serviceTypeFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
  const paginatedBookings = filteredAndSortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Map to QuickRebookProps
  const mappedItems: QuickRebookProps[] = paginatedBookings.map(b => {
    const d = b.slotStart ? new Date(b.slotStart) : null;
    return {
      id: b.id,
      serviceName: b.service.name,
      professionalName: b.professional?.user.name || "Unassigned Pro",
      rating: 4.8, // Mocked rating
      jobsCompleted: "1240+", // Mocked
      lastBooked: d ? d.toLocaleDateString("en-GB") : "Unknown",
      price: b.service.price || b.price || 0,
      isServiceAvailable: true // Could be based on a flag if it existed
    };
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by service or professional..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={serviceTypeFilter}
              onChange={(e) => { setServiceTypeFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-slate-200 py-2 pl-3 pr-8 text-sm outline-none focus:border-teal-500 bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === "ALL" ? "All Services" : cat}</option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="rounded-lg border border-slate-200 py-2 pl-3 pr-8 text-sm outline-none focus:border-teal-500 bg-white"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="PRICE_HIGH">Price: High to Low</option>
            <option value="PRICE_LOW">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : mappedItems.length > 0 ? (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mappedItems.map((item) => (
              <QuickRebookCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-slate-600 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 px-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-6">
            <CalendarX2 size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Previous Bookings</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            You haven't completed any services yet. Once you do, you'll be able to rebook them instantly from here with all your details prefilled.
          </p>
          <Link
            href="/dashboard"
            className="rounded-lg bg-[#047260] px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            Browse Services
          </Link>
        </div>
      )}
    </div>
  );
}
