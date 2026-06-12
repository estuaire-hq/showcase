// Cache I/O — the single module every command uses to touch the local cache.
// Owns: path resolution, safe-id encoding, atomic writes (temp → rename, so the
// cache is never half-written), and typed read/write of config / manifest / index
// / frame files. No network here.

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Config, FrameFile, IndexFile, Manifest } from "./types";

const HERE = dirname(fileURLToPath(import.meta.url)); // .design/scripts/lib

/** Absolute path to `.design/figma-cache/`. */
export function cacheDir(): string {
	return resolve(HERE, "..", "..", "figma-cache");
}
export function framesDir(): string {
	return join(cacheDir(), "frames");
}
export function assetsDir(): string {
	return join(cacheDir(), "assets");
}
export function configPath(): string {
	return join(cacheDir(), "config.json");
}
export function manifestPath(): string {
	return join(cacheDir(), "manifest.json");
}
export function indexPath(): string {
	return join(cacheDir(), "index.json");
}

/**
 * Encode a raw Figma id for use in a file name: `:` and `;` → `-`.
 * Used ONLY for file names (`frames/51-2221.json`, `assets/51-2380.png`); JSON
 * keys keep the raw id with `:` (one-to-one correspondence).
 */
export function safeId(id: string): string {
	return id.replace(/[:;]/g, "-");
}

export function framePath(frameId: string): string {
	return join(framesDir(), `${safeId(frameId)}.json`);
}

/** Asset file path for an image-bearing node (extension defaults to png). */
export function assetPath(nodeId: string, ext = "png"): string {
	return join(assetsDir(), `${safeId(nodeId)}.${ext}`);
}

/** Repo-relative path (forward slashes) for storing in the manifest. */
export function assetRelPath(nodeId: string, ext = "png"): string {
	return `assets/${safeId(nodeId)}.${ext}`;
}

// ── JSON read/write ────────────────────────────────────────────────────────────

function readJson<T>(filePath: string): T {
	return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

/** Write JSON atomically: temp file in the same dir, then rename. */
export function writeJsonAtomic(filePath: string, data: unknown): void {
	mkdirSync(dirname(filePath), { recursive: true });
	const tmp = `${filePath}.${process.pid}.tmp`;
	writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
	renameSync(tmp, filePath);
}

// ── Typed accessors ──────────────────────────────────────────────────────────

export function readConfig(): Config {
	return readJson<Config>(configPath());
}

export function hasManifest(): boolean {
	return existsSync(manifestPath());
}

/** Read the manifest, or null if the cache is empty (never collected). */
export function readManifest(): Manifest | null {
	return existsSync(manifestPath()) ? readJson<Manifest>(manifestPath()) : null;
}

export function writeManifest(manifest: Manifest): void {
	writeJsonAtomic(manifestPath(), manifest);
}

/** Read the curated index, or null if it doesn't exist yet. */
export function readIndex(): IndexFile | null {
	return existsSync(indexPath()) ? readJson<IndexFile>(indexPath()) : null;
}

export function frameFileExists(frameId: string): boolean {
	return existsSync(framePath(frameId));
}

export function readFrameFile(frameId: string): FrameFile {
	return readJson<FrameFile>(framePath(frameId));
}

export function writeFrameFile(frameId: string, frame: FrameFile): void {
	writeJsonAtomic(framePath(frameId), frame);
}

/** Routing: a node id → its top-level frame id, or null if not collected. */
export function findFrameForNode(manifest: Manifest, nodeId: string): string | null {
	return manifest.nodeToFrame[nodeId] ?? null;
}

const ASSET_EXTS = ["png", "jpg", "webp", "svg"] as const;

/** Repo-relative path of an already-downloaded asset for a node, or null. */
export function findExistingAsset(nodeId: string): string | null {
	for (const ext of ASSET_EXTS) {
		if (existsSync(assetPath(nodeId, ext))) return assetRelPath(nodeId, ext);
	}
	return null;
}
