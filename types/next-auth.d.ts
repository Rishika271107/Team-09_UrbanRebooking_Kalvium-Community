import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

type AppRole = "CUSTOMER" | "PROFESSIONAL" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: AppRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: AppRole;
  }
}
