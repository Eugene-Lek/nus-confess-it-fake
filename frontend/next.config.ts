import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@mdxeditor/editor'],
  reactStrictMode: false,
  output: "standalone",
  webpack: (config) => {
    // this will override the experiments
    config.experiments = { ...config.experiments, topLevelAwait: true }
    // this will just update topLevelAwait property of config.experiments
    // config.experiments.topLevelAwait = true
    return config
  }
};

export default nextConfig;
