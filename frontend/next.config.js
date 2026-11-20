/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // In Docker, the backend container service name is hub_backend:8000
    // If running locally, it is 127.0.0.1:8000
    const destination = process.env.INTERNAL_API_URL || 
      (process.env.NODE_ENV === "production" ? "http://hub_backend:8000/api/:path*" : "http://127.0.0.1:8000/api/:path*");
    const backend = (process.env.HUB_BACKEND_URL || destination.replace(/\/api\/:path\*$/, "")).replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: destination,
      },
      {
        source: "/ws/:path*",
        destination: `${backend}/ws/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
