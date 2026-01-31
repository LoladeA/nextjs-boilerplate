/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This ensures your "Intelligence Layer" can handle the dynamic charts
  transpilePackages: ['lucide-react'], 
};

export default nextConfig;
