import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['@mdxeditor/editor'],
  reactStrictMode: false,
  webpack: (config) => {
    // this will override the experiments
    config.experiments = { ...config.experiments, topLevelAwait: true }
    // this will just update topLevelAwait property of config.experiments
    // config.experiments.topLevelAwait = true
    return config
  }
};

export default nextConfig;
