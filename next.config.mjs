/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: App Router supports large uploads in route handlers with streaming
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
