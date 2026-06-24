"use client";

import dynamic from "next/dynamic";
import type { LeafletMapProps } from "./LeafletMap";

// Client wrapper that loads the Leaflet map with `ssr: false` (Leaflet needs `window`).
// `ssr: false` in `next/dynamic` is only allowed inside a Client Component — hence this
// "use client" boundary (the page stays a Server Component). While loading / if the chunk
// fails, a neutral cream surface stands in; the address text in the page is the real
// fallback for locating Estuaire (FR-018).
const DynamicLeafletMap = dynamic(() => import("./LeafletMap"), {
	ssr: false,
	loading: () => <div className="h-full w-full bg-cream" />,
});

export function ContactMap(props: LeafletMapProps) {
	return <DynamicLeafletMap {...props} />;
}
