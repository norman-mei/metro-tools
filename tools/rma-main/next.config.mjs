const defaultBasePath = process.env.NODE_ENV === 'production' ? '/rma' : '';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? defaultBasePath;

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath,
    assetPrefix: basePath || undefined,
    trailingSlash: true,
    env: {
        NEXT_PUBLIC_BASE_PATH: basePath,
    },
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
