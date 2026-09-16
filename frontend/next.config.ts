import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["next-auth", "@panva/hkdf"],
  // Pin Turbopack's module root to this app so it can always resolve next/package.json.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  agentRules: false,
};

export default nextConfig;
