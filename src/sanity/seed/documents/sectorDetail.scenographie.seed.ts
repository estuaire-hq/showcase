import { buildSectorSeed } from "./sectorDetail.build";

// Scénographie ships two PNG sources (intro-main + citation-1); the rest are JPEG.
export default buildSectorSeed("scenographie", {
	hero: "hero.jpg",
	introMain: "intro-main.png",
	introPortrait: "intro-portrait.jpg",
	introSquare: "intro-square.jpg",
	citation1: "citation-1.png",
	citation2: "citation-2.jpg",
});
