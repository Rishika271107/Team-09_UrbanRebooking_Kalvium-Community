import React, { useState } from "react";
import { CreditCard, MoreVertical, Trash2, CheckCircle2 } from "lucide-react";

export interface PaymentMethodItem {
  id: string;
  cardType: string;
  lastFour: string;
  provider: string;
  isDefault: boolean;
}

interface PaymentCardProps {
  method: PaymentMethodItem;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PaymentCard({ method, onSetDefault, onDelete }: PaymentCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getCardIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "visa":
        return <div className="text-blue-700 font-bold italic text-sm">VISA</div>;
      case "mastercard":
        return (
          <div className="flex -space-x-1.5">
            <div className="w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="w-4 h-4 rounded-full bg-yellow-400/80"></div>
          </div>
        );
      case "amex":
        return <div className="text-blue-500 font-bold text-xs">AMEX</div>;
      default:
        return <CreditCard size={20} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 relative">
      <div className="w-12 h-8 rounded border border-slate-200 flex items-center justify-center bg-white flex-shrink-0 shadow-sm">
        {getCardIcon(method.cardType)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">
            {method.cardType} â€¢â€¢â€¢â€¢ {method.lastFour}
          </span>
          {method.isDefault && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Default
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">Expires 12/28</p>
      </div>

      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
        >
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20">
              {!method.isDefault && (
                <button
                  onClick={() => { onSetDefault(method.id); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <CheckCircle2 size={14} /> Set as default
                </button>
              )}
              <button
                onClick={() => { onDelete(method.id); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} /> Remove card
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
