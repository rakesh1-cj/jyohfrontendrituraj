/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Ensure proper chunk loading
    esmExternals: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'https://jyohtempserver.viragofarms.com',
  },
  // Ensure environment variables are available at build time
  publicRuntimeConfig: {
    apiBase: process.env.NEXT_PUBLIC_API_BASE || 'https://jyohtempserver.viragofarms.com',
  },
  // Fix for chunk loading issues
  // output: 'standalone', // Commented out as it causes routing issues in development
  webpack: (config, { isServer, dev }) => {
    // Fix for webpack chunk loading issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Fix for "self is not defined" error
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    
    return config;
  },
};

export default nextConfig;
