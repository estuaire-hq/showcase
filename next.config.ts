import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Standalone output for Docker deployment (see Dockerfile)
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.sanity.io",
			},
		],
	},
};

export default nextConfig;
