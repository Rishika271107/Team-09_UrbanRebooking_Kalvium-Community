import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix the "workspace root" lockfile warning — explicitly set to this project's root
  outputFileTracingRoot: path.join(__dirname),
  // Ensure external packages (like prisma, bcryptjs) aren't bundled into the client
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
