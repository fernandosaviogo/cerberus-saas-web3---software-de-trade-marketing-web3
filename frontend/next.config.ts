import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: path.join(process.cwd(), ".."),
  },
  env: {
    AUTH_MSG: process.env.AUTH_MSG || "Autenticating to Cerberus. Timestamp: <timestamp>",
    CERBERUS_PAY_CONTRACT: process.env.CERBERUS_PAY_CONTRACT,
    BACKEND_URL: process.env.BACKEND_URL,
    WSS_URL: process.env.WSS_URL,
    UNISWAP_GRAPH_URL: process.env.UNISWAP_GRAPH_URL,
  }
};

export default nextConfig;
