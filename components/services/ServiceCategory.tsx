import React from "react";

interface ServiceCategoryProps {
  title: string;
}

export function ServiceCategory({ title }: ServiceCategoryProps) {
  return (
    <div className="py-4">
      <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">{title}</h2>
    </div>
  );
}
