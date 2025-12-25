import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Use environment variable if set, otherwise default to localhost for development
    // For production, set NEXT_PUBLIC_BACKEND_URL in your deployment environment
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8080"
  }
};

export default nextConfig;
