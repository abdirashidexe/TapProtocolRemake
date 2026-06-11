/** @type {import('next').NextConfig} */
const repo = "TapProtocolRemake";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  // GitHub Pages serves project sites from /RepoName — assets must use that prefix.
  ...(isProd && {
    basePath: `/${repo}`,
    assetPrefix: `/${repo}/`,
  }),
};

export default nextConfig;
