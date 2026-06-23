"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

export type LeafletMapProps = {
	lat: number;
	lng: number;
	zoom: number;
	markerLabel: string;
};

// Branded teardrop pin (kit « location estuaire », ~50×61) as a divIcon — no image,
// so no bundler broken-icon issue. Colours via CSS vars (the icon lives in the DOM, so
// `--color-*` resolve) → no hard-coded brand colour (Principle X). Anchored at its tip.
const pinIcon = L.divIcon({
	className: "",
	iconSize: [40, 49],
	iconAnchor: [20, 49],
	html: `
		<svg width="40" height="49" viewBox="0 0 50 61" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M25 0C11.2 0 0 11.2 0 25c0 17.5 25 36 25 36s25-18.5 25-36C50 11.2 38.8 0 25 0z" fill="var(--color-ink)"/>
			<circle cx="25" cy="24" r="9" fill="var(--color-paper)"/>
		</svg>`,
});

/**
 * Interactive OpenStreetMap (react-leaflet) — free, no API key. Centred on the office
 * with the branded marker; drag + zoom controls enabled (FR-017), scroll-wheel zoom off
 * so it doesn't trap page scroll. Client-only (Leaflet touches the DOM) — loaded via
 * `ContactMap` with `ssr: false`. The address text in the page is the no-JS fallback.
 */
export default function LeafletMap({
	lat,
	lng,
	zoom,
	markerLabel,
}: LeafletMapProps) {
	return (
		<MapContainer
			center={[lat, lng]}
			zoom={zoom}
			scrollWheelZoom={false}
			className="h-full w-full"
		>
			{/* CARTO Positron (light) — matches the maquette's light/desaturated map; free
			    with attribution (CARTO + OpenStreetMap). */}
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
				url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
				subdomains="abcd"
				maxZoom={20}
			/>
			<Marker position={[lat, lng]} icon={pinIcon} title={markerLabel} />
		</MapContainer>
	);
}
