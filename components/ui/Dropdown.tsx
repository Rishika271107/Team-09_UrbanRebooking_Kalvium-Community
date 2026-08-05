"use client";

import React, { useState, useRef, useEffect } from "react";

export interface DropdownItem {
  id: string;
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "right", className = "" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
    
    if (isOpen && dropdownRef.current) {
      const items = Array.from(dropdownRef.current.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
      if (!items.length) return;

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex].focus();
      }
    } else if (!isOpen && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setIsOpen(true);
      setTimeout(() => {
        const firstItem = dropdownRef.current?.querySelector('[role="menuitem"]') as HTMLElement;
        firstItem?.focus();
      }, 10);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef} onKeyDown={handleKeyDown}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
      >
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`absolute z-50 mt-2 w-56 rounded-xl bg-white shadow-lg border border-slate-100 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200 ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          }`}
          role="menu"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {items.map((item, index) => {
              const baseClasses = `flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm transition-colors focus:outline-none focus:bg-slate-50 focus:ring-2 focus:ring-teal-600 ${
                item.danger 
                  ? "text-red-600 hover:bg-red-50 hover:text-red-700 focus:text-red-700" 
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`;
              
              if (item.href) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={baseClasses}
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <span className="opacity-70">{item.icon}</span>}
                    {item.label}
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  className={baseClasses}
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                >
                  {item.icon && <span className="opacity-70">{item.icon}</span>}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
