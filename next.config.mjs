let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

// Check if building for Capacitor mobile app
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export only for Capacitor mobile app builds
  // For web (Vercel) deployment, this should be undefined
  ...(isCapacitorBuild && { output: 'export', trailingSlash: true }),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Keep dev/build runtime stable; these parallel worker flags can cause
  // intermittent missing chunk files (MODULE_NOT_FOUND in .next/server).
  experimental: {},
  // Transpile Firebase for better tree-shaking
  transpilePackages: ['firebase', '@firebase/auth', '@firebase/firestore'],
  // Keep pdf-parse server-side only (not needed for static export)
  ...(!isCapacitorBuild && { serverExternalPackages: ['pdf-parse'] }),
  // Add headers for Cross-Origin-Opener-Policy to allow Firebase Popup
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ]
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
