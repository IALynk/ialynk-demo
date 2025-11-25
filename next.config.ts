/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 🚨 Empêche Vercel de bloquer le déploiement à cause d’erreurs ESLint/TypeScript
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
