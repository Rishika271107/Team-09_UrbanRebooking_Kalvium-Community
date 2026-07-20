export default function DashboardLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600"></div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  );
}
