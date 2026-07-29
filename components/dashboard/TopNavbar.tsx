"use client";

import { Bell, Search, X, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { searchAction } from "@/app/actions/search.actions";

export function TopNavbar({ notificationCount }: { notificationCount: number }) {
  const { data: session } = useSession();
  const user = session?.user;
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        const res = await searchAction(query);
        setResults(res);
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-4 md:w-96 md:flex-none">
        <div ref={searchRef} className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (query.trim()) setIsOpen(true); }}
            placeholder="Search services, bookings..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm outline-none transition-colors focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 flex items-center justify-center text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : results ? (
                <div className="p-2">
                  {results.services.length === 0 && results.professionals.length === 0 && results.bookings.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-500">No results found for "{query}"</div>
                  )}

                  {results.services.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Services</div>
                      {results.services.map((s: any) => (
                        <div key={s.id} className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                          <div className="text-sm font-medium text-slate-900">{s.name}</div>
                          <div className="text-xs text-slate-500">{s.category}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.professionals.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Professionals</div>
                      {results.professionals.map((p: any) => (
                        <div key={p.id} className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center gap-2">
                          <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.category}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.bookings.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bookings</div>
                      {results.bookings.map((b: any) => (
                        <div key={b.id} className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                          <div className="text-sm font-medium text-slate-900">{b.service.name}</div>
                          <div className="text-xs text-slate-500">{new Date(b.date).toLocaleDateString()} - {b.status}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 border border-white"></span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#047260] text-white font-bold text-sm">
            {user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "U"}
          </div>
          <div className="hidden flex-col items-start sm:flex">
            <span className="text-sm font-semibold text-slate-900">{user?.name || "Customer"}</span>
            <span className="text-xs text-slate-500">{(user as any)?.label || "Customer"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
