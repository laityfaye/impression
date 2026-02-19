import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'canvas', 'adm-zip'],
};

export default nextConfig;
