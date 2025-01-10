/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd3e5wuq2fomqsd.cloudfront.net',
        pathname: '/previews/**',
      },
      {
        protocol: 'https',
        hostname: 'd3l4q0oig1v782.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5002',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'ideogram.ai',
        pathname: '/api/images/**',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    domains: ['images.printify.com'],
  },
}

module.exports = nextConfig 