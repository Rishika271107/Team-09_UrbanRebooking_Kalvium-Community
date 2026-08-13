import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role || "CUSTOMER";
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnBookings = nextUrl.pathname.startsWith("/bookings");
      const isOnRebook = nextUrl.pathname.startsWith("/rebook");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnProfessional = nextUrl.pathname.startsWith("/professional");

      const isProtected =
        isOnDashboard || isOnBookings || isOnRebook || isOnAdmin || isOnProfessional;

      if (isProtected) {
        if (!isLoggedIn) return false;
        
        // RBAC Check
        if (isOnAdmin && userRole !== "ADMIN" && userRole !== "PROFESSIONAL") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        
        return true;
      } else if (isLoggedIn) {
        if (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup") {
          if (userRole === "ADMIN" || userRole === "PROFESSIONAL") {
            return Response.redirect(new URL("/admin", nextUrl));
          }
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }
      return true;
    },
  },
  providers: [], // configured in auth.ts
} satisfies NextAuthConfig;
