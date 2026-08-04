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
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Booking Confirmed", message: "Your Home Cleaning is confirmed.", isRead: false, time: "2h ago" },
    { id: 2, title: "Professional Assigned", message: "Aarav Sharma has been assigned.", isRead: false, time: "1d ago" },
    { id: 3, title: "Service Completed", message: "Rate your recent AC Service.", isRead: true, time: "3d ago" },
  ]);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter(t => t !== cleanTerm)].slice(0, 3);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
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
        saveSearch(query);
      } else {
        setResults(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white px-4 md:px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-4 md:w-96 md:flex-none">
        <div ref={searchRef} className="relative w-full max-w-md">
          <label htmlFor="top-search" className="sr-only">Search</label>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" aria-hidden="true" />
          <input
            id="top-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search for services, professionals..."
            className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-10 text-sm outline-none transition-colors focus:border-[#047260] focus:bg-white focus:ring-1 focus:ring-[#047260]"
            aria-autocomplete="list"
            aria-controls={isOpen ? "search-results" : undefined}
            aria-expanded={isOpen}
          />
          {query && (
            <button 
              onClick={() => setQuery("")} 
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#047260] focus-visible:rounded-full"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {isOpen && (
            <div id="search-results" role="listbox" className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
              {!query ? (
                <div className="p-4 space-y-4">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recent Searches</div>
                      <div className="flex flex-col gap-1.5">
                        {recentSearches.map((term, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setQuery(term)}
                            className="flex items-center gap-2 text-left w-full text-sm text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors"
                          >
                            <Search className="h-3.5 w-3.5 text-slate-400" />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Search Suggestions</div>
                    <div className="flex flex-wrap gap-2">
                      {["Home Cleaning", "AC Repair", "Men's Salon", "Massage", "Plumbing"].map((term, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setQuery(term);
                            saveSearch(term);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-teal-50 hover:text-[#047260] text-slate-650 rounded-full transition-colors border border-transparent hover:border-teal-200"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="p-4 flex items-center justify-center text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading results" />
                </div>
              ) : results ? (
                <div className="p-2">
                  {results.services.length === 0 && results.professionals.length === 0 && results.bookings.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-600">No results found for "{query}"</div>
                  )}

                  {results.services.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Services</div>
                      {results.services.map((s: any) => (
                        <div key={s.id} role="option" aria-selected="false" tabIndex={0} onClick={() => setQuery(s.name)} className="px-3 py-2 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none rounded-lg cursor-pointer">
                          <div className="text-sm font-medium text-slate-900">{s.name}</div>
                          <div className="text-xs text-slate-600">{s.category}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.professionals.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Professionals</div>
                      {results.professionals.map((p: any) => (
                        <div key={p.id} role="option" aria-selected="false" tabIndex={0} onClick={() => setQuery(p.name)} className="px-3 py-2 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none rounded-lg cursor-pointer flex items-center gap-2">
                          <img src={p.avatar} alt="" className="w-6 h-6 rounded-full" aria-hidden="true" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-600">{p.category}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.bookings.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bookings</div>
                      {results.bookings.map((b: any) => (
                        <div key={b.id} role="option" aria-selected="false" tabIndex={0} className="px-3 py-2 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none rounded-lg cursor-pointer">
                          <div className="text-sm font-medium text-slate-900">{b.service.name}</div>
                          <div className="text-xs text-slate-600">{new Date(b.date).toLocaleDateString()} - {b.status}</div>
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

      <div className="flex items-center gap-3 md:gap-6 ml-2">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#047260]"
            aria-label={`Notifications ${notifications.some(n => !n.isRead) ? '(unread)' : ''}`}
            aria-expanded={isNotifOpen}
            aria-controls="notification-dropdown"
          >
            <Bell size={20} aria-hidden="true" />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute right-2.5 top-2.5 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 border border-white"></span>
            )}
          </button>
          
          {isNotifOpen && (
            <div id="notification-dropdown" role="menu" className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <button 
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
                  className="text-xs text-[#047260] hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#047260] focus-visible:rounded"
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-60' : ''}`}
                      onClick={() => setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n))}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{notif.title}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{notif.message}</span>
                        </div>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-[#047260] mt-1 shrink-0"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2">{notif.time}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
                <a href="#" className="text-xs font-semibold text-slate-600 hover:text-slate-900">View all notifications</a>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#047260] text-white font-bold text-sm">
            {user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "U"}
          </div>
          <div className="hidden flex-col items-start sm:flex">
            <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">{user?.name || "Customer"}</span>
            <span className="text-xs text-slate-500">{(user as any)?.label || "Customer"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
