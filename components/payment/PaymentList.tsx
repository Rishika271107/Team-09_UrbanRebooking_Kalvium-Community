import React from "react";
import { PaymentCard, PaymentMethodItem } from "./PaymentCard";

interface PaymentListProps {
  methods: PaymentMethodItem[];
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PaymentList({ methods, onSetDefault, onDelete }: PaymentListProps) {
  return (
    <div className="flex flex-col">
      {methods.map((method) => (
        <PaymentCard
          key={method.id}
          method={method}
          onSetDefault={onSetDefault}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
