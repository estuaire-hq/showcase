import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Standalone output for Docker deployment (see Dockerfile)
	output: "standalone",
	// Per-worktree dev origins served by portless (http://[<branch>.]estuaire.localhost:1355).
	// Lets Next's dev server accept their cross-origin HMR/asset requests. See ADR 0013.
	allowedDevOrigins: ["estuaire.localhost", "*.estuaire.localhost"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.sanity.io",
				pathname: "/images/**",
			},
		],
	},
};

export default nextConfig;
