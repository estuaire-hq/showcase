/**
 * Seed registry — the explicit, ordered list of document seeds the runner writes.
 * Order matters when seeds reference each other (write referenced docs first).
 * Add a new document's seed here after scaffolding + filling it.
 */
import footer from "./documents/footer.seed";

export const seeds = [footer];
