/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  staticPageGenerationTimeout: 30,
  outputFileTracingIncludes: {
    '/api/city-icon/[slug]': ['./public/city-icons/*.ico'],
  },
  output: 'standalone',
  turbopack: {
    resolveAlias: {
      react: './node_modules/react',
      'react-dom': './node_modules/react-dom',
    },
  },
  async redirects() {
    return [
      {
        source: '/railmap-toolkit',
        destination: '/rmg-main',
        permanent: false,
      },
      {
        source: '/rmp',
        destination: '/rmp-main',
        permanent: false,
      },
      {
        source: '/rma',
        destination: '/rma-main',
        permanent: false,
      },
      {
        source: '/rmg-palette',
        destination: '/rmg-palette-main',
        permanent: false,
      },
      {
        source: '/rsg',
        destination: '/rsg-main',
        permanent: false,
      },
      {
        source: '/railmapgen.github.io-main',
        destination: '/rmg-main',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/rmg-palette/resources/:path*',
          destination: '/rmg-palette-main/resources/:path*',
        },
        {
          source: '/transitguesser',
          destination: '/transitguesser/index.html',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}

export default nextConfig
