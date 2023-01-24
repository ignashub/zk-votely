import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx'],
  compiler: {
    // https://nextjs.org/docs/advanced-features/compiler#remove-react-properties
    // Removes data-testid for production builds
    reactRemoveProperties: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        stream: false,
        path: false,
        worker_threads: false,
        // crypto: require.resolve('crypto-browserify'),
        os: false,
        assert: false,
      };
    }

    return config;
  },
};

const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.NEXT_ANALYZE_BUNDLE === 'true',
});

export default bundleAnalyzerConfig(nextConfig);
