import { withPayload } from "@payloadcms/next/withPayload";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {
    root: path.join(dirname, "../..")
  },
  serverExternalPackages: [
    "payload",
    "@payloadcms/db-postgres",
    "@payloadcms/drizzle",
    "drizzle-kit",
    "drizzle-orm",
    "esbuild",
    "pg",
    "postgres"
  ],
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

export default withPayload(nextConfig);
