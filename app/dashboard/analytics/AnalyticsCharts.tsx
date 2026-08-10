"use client";

import React from "react";

export default function AnalyticsCharts({ data }: { data: any }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mt-6">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Analytics Overview</h3>
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <p className="text-slate-500">Charts will be displayed here.</p>
      </div>
    </div>
  );
}
