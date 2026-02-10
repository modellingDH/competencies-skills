/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    reactStrictMode: true,
    experimental: {
        // appDir: true, // Not needed in newer versions, enabled by default
    },
}

export default nextConfig
