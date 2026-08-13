import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Star, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Reviews | Urban Company Admin",
};

export default async function AdminReviewsPage() {
  const session = await auth();
  
  let professionalId = null;
  if (session?.user?.role === "PROFESSIONAL") {
    const pro = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    });
    if (pro) professionalId = pro.id;
  }

  const whereClause: any = {};
  if (professionalId) {
    whereClause.professionalId = professionalId;
  }

  const reviews = await prisma.review.findMany({
    where: whereClause,
    include: {
      user: true,
      booking: {
        include: { service: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
          <p className="text-sm text-slate-500">See what your customers are saying.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Star className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Average Rating</p>
            <p className="text-3xl font-bold text-slate-900">{avgRating} <span className="text-lg font-medium text-slate-400">/ 5.0</span></p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <MessageSquare className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Reviews</p>
            <p className="text-3xl font-bold text-slate-900">{totalReviews}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-4xl">
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Star className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No reviews yet</h3>
            <p className="mt-1 text-slate-500">Complete services to get reviews from customers.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{review.user.name}</h3>
                  <p className="text-xs text-slate-500">{review.booking.service.name}</p>
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 ${star <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} 
                  />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "{review.reviewText || "No written review provided."}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
