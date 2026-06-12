// figma-api — thin Figma REST client. The ONLY module that touches the network
// (used by collect, and by status for freshness). Wraps fetch with a 429 backoff
// that honors the server `Retry-After` header, and exposes the four endpoints the
// toolchain needs. Errors are typed so callers can map them to exit codes:
//   FigmaQuotaError   → 429 retries exhausted (partial cache is still valid)
//   FigmaNetworkError → fetch threw (offline / DNS) — "unknown" for status
//   FigmaApiError     → non-2xx response (e.g. 404 page not found)

import type { FigmaNode } from "./types";

const API = "https://api.figma.com/v1";
const MAX_429_RETRIES = 5;
// On the Starter plan an exhausted bucket can return a Retry-After of many hours.
// Honoring that literally would hang an interactive tool, so cap the wait: beyond
// it the quota is treated as hard-exhausted (throw FigmaQuotaError → resume later).
const MAX_RETRY_WAIT_S = 120;

export class FigmaApiError extends Error {
	constructor(
		message: string,
		readonly status: number,
	) {
		super(message);
		this.name = "FigmaApiError";
	}
}
export class FigmaQuotaError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FigmaQuotaError";
	}
}
export class FigmaNetworkError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FigmaNetworkError";
	}
}

function token(): string {
	const t = process.env.FIGMA_TOKEN;
	if (!t)
		throw new FigmaNetworkError(
			"Missing FIGMA_TOKEN — run a network command with --env-file=.env.development.",
		);
	return t;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** fetch with auth + 429 backoff honoring Retry-After. Throws typed errors. */
async function apiFetch(url: string, attempt = 0): Promise<Response> {
	let res: Response;
	try {
		res = await fetch(url, { headers: { "X-Figma-Token": token() } });
	} catch (err) {
		throw new FigmaNetworkError(
			`Network error calling Figma: ${err instanceof Error ? err.message : String(err)}`,
		);
	}
	if (res.status === 429) {
		if (attempt >= MAX_429_RETRIES)
			throw new FigmaQuotaError(
				`Rate limit (429) not cleared after ${MAX_429_RETRIES} retries.`,
			);
		const header = Number(res.headers.get("retry-after"));
		const waitS =
			Number.isFinite(header) && header > 0 ? header : 15 * (attempt + 1);
		if (waitS > MAX_RETRY_WAIT_S)
			throw new FigmaQuotaError(
				`Rate limit exhausted — Figma asks to wait ${waitS}s (> ${MAX_RETRY_WAIT_S}s cap). The cache is left intact; re-run \`figma collect\` once the quota recovers.`,
			);
		console.error(`  429 rate-limited — waiting ${waitS}s (Retry-After)…`);
		await sleep(waitS * 1000);
		return apiFetch(url, attempt + 1);
	}
	return res;
}

async function apiJson<T>(url: string): Promise<T> {
	const res = await apiFetch(url);
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new FigmaApiError(
			`${url} → ${res.status} ${res.statusText}\n${body}`,
			res.status,
		);
	}
	return (await res.json()) as T;
}

// ── Response shapes (only the fields we read are declared) ─────────────────────

export interface NodesResponse {
	name: string;
	lastModified: string;
	version: string;
	nodes: Record<
		string,
		{
			document: FigmaNode;
			components: Record<string, unknown>;
			componentSets: Record<string, unknown>;
			styles: Record<string, unknown>;
		} | null
	>;
}

export interface FileMetaResponse {
	name: string;
	lastModified: string;
	version: string;
	document?: FigmaNode;
}

export interface ImageFillsResponse {
	error: boolean;
	status: number;
	meta: { images: Record<string, string> };
}

export interface RenderResponse {
	err: string | null;
	images: Record<string, string | null>;
}

// ── Endpoints ──────────────────────────────────────────────────────────────────

/** GET /files/:key/nodes?ids=… — no `depth` ⇒ the FULL subtree of each id (EF-006). */
export function getNodes(
	fileKey: string,
	ids: string[],
): Promise<NodesResponse> {
	return apiJson<NodesResponse>(
		`${API}/files/${fileKey}/nodes?ids=${encodeURIComponent(ids.join(","))}`,
	);
}

/** GET /files/:key?depth=1 — light file object: name, lastModified, version (freshness). */
export function getFileMeta(fileKey: string): Promise<FileMetaResponse> {
	return apiJson<FileMetaResponse>(`${API}/files/${fileKey}?depth=1`);
}

/** GET /files/:key/images — imageRef → source S3 URL for every image fill (1 call). */
export async function getImageFills(
	fileKey: string,
): Promise<ImageFillsResponse> {
	// This endpoint can return HTTP 200 with a body-level error envelope; surface it
	// rather than silently yielding an empty fills map (which sends every image to render).
	const resp = await apiJson<ImageFillsResponse>(
		`${API}/files/${fileKey}/images`,
	);
	if (resp.error)
		throw new FigmaApiError(
			`image-fills endpoint returned an error envelope (status ${resp.status}).`,
			resp.status,
		);
	return resp;
}

/** GET /images/:key?ids=…&format=png&scale=… — flattened node renders. */
export function renderImages(
	fileKey: string,
	ids: string[],
	scale = 2,
): Promise<RenderResponse> {
	return apiJson<RenderResponse>(
		`${API}/images/${fileKey}?ids=${encodeURIComponent(ids.join(","))}&format=png&scale=${scale}`,
	);
}

/** Fetch a (token-less, pre-signed) asset URL into memory + its content-type. */
export async function fetchBinary(
	url: string,
): Promise<{ data: Buffer; contentType: string | null }> {
	let res: Response;
	try {
		res = await fetch(url);
	} catch (err) {
		throw new FigmaNetworkError(
			`Network error downloading asset: ${err instanceof Error ? err.message : String(err)}`,
		);
	}
	if (!res.ok)
		throw new FigmaApiError(`download ${url} → ${res.status}`, res.status);
	const data = Buffer.from(await res.arrayBuffer());
	return { data, contentType: res.headers.get("content-type") };
}

/** Best-effort file extension from a download response's content-type. */
export function extFromContentType(contentType: string | null): string {
	if (!contentType) return "png";
	if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
	if (contentType.includes("webp")) return "webp";
	if (contentType.includes("svg")) return "svg";
	return "png";
}
