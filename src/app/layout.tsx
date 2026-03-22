import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "Estuaire",
		template: "%s | Estuaire",
	},
	description: "Estuaire — par Mosaique Production",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="fr">
			<body className="font-sans antialiased">{children}</body>
		</html>
	);
}
