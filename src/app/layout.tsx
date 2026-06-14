import type { Metadata, Viewport } from "next";
import { Montserrat, Montserrat_Alternates } from "next/font/google";
import { draftMode } from "next/headers";
import Script from "next/script";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/lib/sanity/live";
import "./globals.css";

const montserrat = Montserrat({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-montserrat",
	display: "swap",
});

const montserratAlternates = Montserrat_Alternates({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	style: ["normal", "italic"],
	variable: "--font-montserrat-alternates",
	display: "swap",
});

const umamiScriptUrl = process.env.UMAMI_SCRIPT_URL;
const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID;

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
		<html
			lang="fr"
			className={`overflow-x-clip ${montserrat.variable} ${montserratAlternates.variable}`}
		>
			{/* overflow-x-clip (not hidden) prevents horizontal scroll without creating a
			    scroll container — safe with Lenis + ScrollTrigger pins (position: fixed). */}
			<body className="overflow-x-clip font-sans antialiased">
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
