import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-auth", "@panva/hkdf"],
};

export default nextConfig;
