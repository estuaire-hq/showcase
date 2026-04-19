import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import Script from "next/script";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/lib/sanity/live";
import "./globals.css";

const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export const metadata: Metadata = {
	title: {
		default: "Estuaire",
		template: "%s | Estuaire",
	},
	description: "Estuaire — par Mosaique Production",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isEnabled: isDraftMode } = await draftMode();
	return (
		<html lang="fr">
			<body className="font-sans antialiased">
				{children}
				{umamiScriptUrl && umamiWebsiteId && (
					<Script
						defer
						src={umamiScriptUrl}
						data-website-id={umamiWebsiteId}
						strategy="afterInteractive"
					/>
				)}
				{isDraftMode && (
					<>
						<SanityLive />
						<VisualEditing />
					</>
				)}
			</body>
		</html>
	);
}
