// Tree traversal — the shared primitives for walking a Figma node subtree.
// Both `collect` (split/scan) and `read` (digest/inventory) operate on the same
// lossless tree, so the walk, the node count and the by-id lookup live here once.
// Pure (no I/O).

import type { FigmaNode } from "./types";

/** Pre-order walk: invoke `fn` on `node` then recurse into its children. */
export function walk(node: FigmaNode, fn: (n: FigmaNode) => void): void {
	fn(node);
	for (const child of node.children ?? []) walk(child, fn);
}

/** Total node count of a subtree (completeness checklist — EF-004). */
export function countNodes(node: FigmaNode): number {
	let count = 1;
	for (const child of node.children ?? []) count += countNodes(child);
	return count;
}

/** Depth-first search for a node by id within a subtree (early-exit). */
export function findNode(root: FigmaNode, id: string): FigmaNode | null {
	if (root.id === id) return root;
	for (const child of root.children ?? []) {
		const found = findNode(child, id);
		if (found) return found;
	}
	return null;
}
