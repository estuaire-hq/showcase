import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/lib/sanity/live";
import "./globals.css";

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
	return (
		<html lang="fr">
			<body className="font-sans antialiased">
				{children}
				<SanityLive />
				{(await draftMode()).isEnabled && <VisualEditing />}
			</body>
		</html>
	);
}
