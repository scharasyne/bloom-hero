import type { NextConfig } from "next";

import { getSecurityHeaders } from "./src/lib/security/headers";

const legacyVendorDashboardRedirects = [
  { from: "/market/dashboard", to: "/vendor/dashboard" },
  { from: "/pop-up/dashboard", to: "/vendor/dashboard" },
  { from: "/market/products", to: "/vendor/products" },
  { from: "/pop-up/products", to: "/vendor/products" },
  { from: "/market/orders", to: "/vendor/orders" },
  { from: "/market/add-product", to: "/vendor/add-product" },
  { from: "/pop-up/add-product", to: "/vendor/add-product" },
  { from: "/market/profile", to: "/vendor/profile" },
  { from: "/pop-up/profile", to: "/vendor/profile" },
  { from: "/pop-up/schedule", to: "/vendor/schedule" },
  { from: "/market/settings", to: "/vendor/settings" },
  { from: "/pop-up/settings", to: "/vendor/settings" },
  { from: "/vendor/market/dashboard", to: "/vendor/dashboard" },
  { from: "/vendor/pop-up/dashboard", to: "/vendor/dashboard" },
  { from: "/vendor/market/products", to: "/vendor/products" },
  { from: "/vendor/pop-up/products", to: "/vendor/products" },
  { from: "/vendor/market/list-product", to: "/vendor/products" },
] as const;

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    const securityHeaders = getSecurityHeaders();
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      ...legacyVendorDashboardRedirects.map(({ from, to }) => ({
        source: from,
        destination: to,
        permanent: true,
      })),
      {
        source: "/market/:vendorId",
        destination: "/vendors/:vendorId",
        permanent: true,
      },
      {
        source: "/pop-up/:vendorId",
        destination: "/vendors/:vendorId",
        permanent: true,
      },
      {
        source: "/admin-log-in",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/admin-dashboard",
        destination: "/admin/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
