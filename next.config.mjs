/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  transpilePackages: ['@ts-jison/parser']
};

export default nextConfig;
