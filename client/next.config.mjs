/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com", 
        port: "", // No specific port needed
        pathname: "/marcy-yt-processed-images/**", // Matches all images under this path
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", 
        port: "", // No specific port needed
      },
    ],
  },
};

export default nextConfig;
