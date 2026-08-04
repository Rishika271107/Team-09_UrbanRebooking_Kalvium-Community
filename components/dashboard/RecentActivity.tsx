"use client";

export interface ActivityProps {
  id: string;
  title: string;
  professionalName: string | null;
  date: string;
  status?: string;
}

interface RecentActivityProps {
  activities: ActivityProps[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
      
      <div className="relative mt-2 pl-4">
        <div className="absolute left-4 top-2 h-full w-[2px] -translate-x-1/2 bg-slate-100"></div>
        
        <div className="flex flex-col gap-6">
          {activities.length === 0 ? (
            <div className="text-sm text-slate-500">No recent activity</div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="relative flex items-start gap-4">
                <div className="absolute left-0 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-[#047260] shadow-sm"></div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{activity.title}</span>
                    {activity.status && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        activity.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                        activity.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                        activity.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-slate-500">
                    {activity.professionalName ? `by ${activity.professionalName} • ` : ""}{activity.date}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
