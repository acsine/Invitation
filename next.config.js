/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      { protocol: 'https', hostname: 'imagekit.io' },
    ],
  },
  sassOptions: {
    includePaths: ['./src/styles'],
  },
}

module.exports = nextConfig
