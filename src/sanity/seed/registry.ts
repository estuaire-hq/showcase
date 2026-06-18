/**
 * Seed registry — the explicit, ordered list of document seeds the runner writes.
 * Order matters when seeds reference each other (write referenced docs first).
 * Add a new document's seed here after scaffolding + filling it.
 */
import aboutPage from "./documents/aboutPage.seed";
import footer from "./documents/footer.seed";
import homePage from "./documents/homePage.seed";
import sectorsPage from "./documents/sectorsPage.seed";

export const seeds = [homePage, aboutPage, sectorsPage, footer];
