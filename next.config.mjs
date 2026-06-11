/** @type {import('next').NextConfig} */
const repo = "TapProtocolRemake";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  ...(isProd && {
    basePath: `/${repo}`,
    assetPrefix: `/${repo}/`,
  }),
};

export default nextConfig;
