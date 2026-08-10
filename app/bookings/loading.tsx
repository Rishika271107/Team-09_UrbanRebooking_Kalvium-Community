export default function BookingsLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-xl bg-slate-100 h-24" />
      ))}
    </div>
  );
}