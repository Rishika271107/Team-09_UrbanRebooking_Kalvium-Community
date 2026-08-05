import React, { useState } from "react";
import { MapPin, Plus } from "lucide-react";

interface Address {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  type?: string;
}

interface ConfirmationCardProps {
  addresses: Address[];
  selectedAddress: string;
  onAddressSelect: (addr: string) => void;
  addressError?: string;
  specialInstructions: string;
  onInstructionsChange: (val: string) => void;
}

export function ConfirmationCard({
  addresses,
  selectedAddress,
  onAddressSelect,
  addressError,
  specialInstructions,
  onInstructionsChange
}: ConfirmationCardProps) {
  const [isNewAddress, setIsNewAddress] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      {/* Address */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="text-teal-600" /> Service Location
          </h3>
          <button 
            type="button"
            onClick={() => setIsNewAddress(!isNewAddress)}
            className="text-sm font-bold text-teal-600 flex items-center gap-1 hover:text-teal-800 transition-colors"
          >
            {isNewAddress ? "Use Saved" : <><Plus size={16} /> Add New</>}
          </button>
        </div>
        
        {isNewAddress ? (
          <textarea 
            className="w-full rounded-xl border-2 border-slate-200 p-4 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 min-h-[120px] outline-none transition-all placeholder:text-slate-400"
            placeholder="Enter full address, landmark, and pincode..."
            value={selectedAddress}
            onChange={(e) => onAddressSelect(e.target.value)}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {addresses.map((addr, i) => {
              const str = `${addr.addressLine}, ${addr.city}, ${addr.state} ${addr.pincode}`.trim();
              const isSelected = selectedAddress === str;
              return (
                <label 
                  key={i} 
                  className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? "border-teal-600 bg-teal-50/50 shadow-sm" 
                      : "border-slate-100 hover:border-teal-300 hover:bg-slate-50"
                  }`}
                >
                  <input 
                    type="radio" 
                    className="mt-1 flex-shrink-0 w-4 h-4 accent-teal-600"
                    value={str}
                    checked={isSelected}
                    onChange={() => onAddressSelect(str)}
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{addr.type || "Home"}</p>
                    <p className="text-sm font-medium text-slate-600 mt-1 leading-relaxed">{str}</p>
                  </div>
                </label>
              )
            })}
          </div>
        )}
        {addressError && <p className="text-sm font-bold text-red-500 mt-3">{addressError}</p>}
      </div>

      {/* Instructions */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
         <h3 className="text-lg font-bold text-slate-900 mb-2">Special Instructions</h3>
         <p className="text-sm font-medium text-slate-500 mb-4">Any specific details the professional should know?</p>
         <textarea 
            className="w-full rounded-xl border-2 border-slate-200 p-4 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none resize-none transition-all placeholder:text-slate-400"
            placeholder="E.g., Call before reaching, bring specific tools..."
            rows={3}
            value={specialInstructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
          />
      </div>
    </div>
  );
}
