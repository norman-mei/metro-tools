

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // page generation timeout
  staticPageGenerationTimeout: 30,
  // Ensure city icons are bundled for the API route when output tracing is enabled
  outputFileTracingIncludes: {
    '/api/city-icon/[slug]': ['./src/app/(game)/**/icon.ico'],
  },
}


export default nextConfig
