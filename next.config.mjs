import { fileURLToPath } from 'node:url';

import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createJiti from 'jiti';

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti('./src/libs/Env');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const sentryEnabled = Boolean(process.env.SENTRY_AUTH_TOKEN);

const withOptionalSentry = config =>
  sentryEnabled
    ? withSentryConfig(config, {
      // FIXME: Add your Sentry organization and project names
      org: 'nextjs-boilerplate-org',
      project: 'nextjs-boilerplate',
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: '/monitoring',
      hideSourceMaps: true,
      disableLogger: true,
      automaticVercelMonitors: true,
      telemetry: false,
    })
    : config;

/** @type {import('next').NextConfig} */
export default withOptionalSentry(
  bundleAnalyzer({
    eslint: {
      dirs: ['.'],
    },
    poweredByHeader: false,
    reactStrictMode: true,
    output: 'standalone',
    experimental: {
      serverComponentsExternalPackages: ['@electric-sql/pglite'],
    },
    webpack: (config) => {
      // Add rule for SVG files
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      });

      return config;
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '9000',
        },
      ],
    },
  }),
);
