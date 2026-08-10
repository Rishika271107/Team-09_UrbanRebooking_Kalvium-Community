import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix the "workspace root" lockfile warning — explicitly set to this project's root
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
