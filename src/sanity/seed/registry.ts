/**
 * Seed registry — the explicit, ordered list of document seeds the runner writes.
 * Order matters when seeds reference each other (write referenced docs first).
 * Add a new document's seed here after scaffolding + filling it.
 */
import aboutPage from "./documents/aboutPage.seed";
import expertisesPage from "./documents/expertisesPage.seed";
import footer from "./documents/footer.seed";
import homePage from "./documents/homePage.seed";
import sectorDetailBureau from "./documents/sectorDetail.bureau.seed";
import sectorDetailResidentiel from "./documents/sectorDetail.residentiel.seed";
import sectorDetailRetail from "./documents/sectorDetail.retail.seed";
import sectorDetailScenographie from "./documents/sectorDetail.scenographie.seed";
import sectorsPage from "./documents/sectorsPage.seed";

export const seeds = [
	homePage,
	aboutPage,
	expertisesPage,
	sectorsPage,
	sectorDetailRetail,
	sectorDetailBureau,
	sectorDetailResidentiel,
	sectorDetailScenographie,
	footer,
];
