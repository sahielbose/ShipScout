/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },
  // Prisma and the AI SDKs are server-only. Keep them out of the client bundle.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
