

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // page generation timeout
  staticPageGenerationTimeout: 30,
  // Ensure city icons are bundled for the API route when output tracing is enabled
  outputFileTracingIncludes: {
    '/api/city-icon/[slug]': ['./public/city-icons/*.ico'],
  },
  output: 'standalone',
  async rewrites() {
    return {
      beforeFiles: [
        // Serve TransitGuesser as a full-page static app on localhost:3000/transitguesser
        {
          source: '/transitguesser',
          destination: '/transitguesser/index.html',
        },
        // Proxy built-in tool routes through the Metro Tools host (localhost:3000)
        {
          source: '/railmap-toolkit',
          destination: 'http://127.0.0.1:3200/',
        },
        {
          source: '/railmap-toolkit/:path*',
          destination: 'http://127.0.0.1:3200/:path*',
        },
        {
          source: '/rmp/:path*',
          destination: 'http://127.0.0.1:3201/rmp/:path*',
        },
        {
          source: '/rmp',
          destination: 'http://127.0.0.1:3201/rmp',
        },
        {
          source: '/rma/:path*',
          destination: 'http://127.0.0.1:3202/rma/:path*',
        },
        {
          source: '/rma',
          destination: 'http://127.0.0.1:3202/rma',
        },
        {
          source: '/rmg-palette/:path*',
          destination: 'http://127.0.0.1:3203/rmg-palette/:path*',
        },
        {
          source: '/rmg-palette',
          destination: 'http://127.0.0.1:3203/rmg-palette',
        },
        {
          source: '/rsg/:path*',
          destination: 'http://127.0.0.1:3204/rsg/:path*',
        },
        {
          source: '/rsg',
          destination: 'http://127.0.0.1:3204/rsg',
        },
        // Shared railmap assets/apps referenced by RMP/RMA
        {
          source: '/styles/:path*',
          destination: 'http://127.0.0.1:3200/styles/:path*',
        },
        {
          source: '/fonts/:path*',
          destination: 'http://127.0.0.1:3200/fonts/:path*',
        },
        {
          source: '/rmg/:path*',
          destination: 'http://127.0.0.1:3200/rmg/:path*',
        },
        {
          source: '/rmp-gallery/:path*',
          destination: 'http://127.0.0.1:3200/rmp-gallery/:path*',
        },
        {
          source: '/rmp-designer/:path*',
          destination: 'http://127.0.0.1:3200/rmp-designer/:path*',
        },
        {
          source: '/svg-assets/:path*',
          destination: 'http://127.0.0.1:3200/svg-assets/:path*',
        },
        {
          source: '/rmg-runtime/:path*',
          destination: 'http://127.0.0.1:3200/rmg-runtime/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}


export default nextConfig
