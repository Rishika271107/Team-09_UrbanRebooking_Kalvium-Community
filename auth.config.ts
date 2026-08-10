import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnBookings = nextUrl.pathname.startsWith("/bookings");
      const isOnRebook = nextUrl.pathname.startsWith("/rebook");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnProfessional = nextUrl.pathname.startsWith("/professional");

      const isProtected =
        isOnDashboard || isOnBookings || isOnRebook || isOnAdmin || isOnProfessional;

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        if (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }
      return true;
    },
  },
  providers: [], // configured in auth.ts
} satisfies NextAuthConfig;
