import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix the "workspace root" lockfile warning — explicitly set to this project's root
  outputFileTracingRoot: path.join(__dirname),
  // Ensure external packages (like prisma, bcryptjs) aren't bundled into the client
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
