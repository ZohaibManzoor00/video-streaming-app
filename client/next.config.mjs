/** @type {import('next').NextConfig} */
import path from 'path'

const nextConfig = {
  staticPageGenerationTimeout: 120,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve('./');
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com", 
        port: "", // No specific port needed
        pathname: "/marcy-yt-processed-videos/**", // Matches all images under this path
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
