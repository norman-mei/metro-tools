/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/styles/:path*',
                destination: 'https://railmapgen.org/styles/:path*',
            },
            {
                source: '/fonts/:path*',
                destination: 'https://railmapgen.org/fonts/:path*',
            },
            {
                source: '/rmg/:path*',
                destination: 'https://railmapgen.org/rmg/:path*',
            },
            {
                source: '/rmg-palette/:path*',
                destination: 'https://railmapgen.org/rmg-palette/:path*',
            },
            {
                source: '/rmp-gallery/:path*',
                destination: 'https://railmapgen.org/rmp-gallery/:path*',
            },
        ];
    },
};

export default nextConfig;
