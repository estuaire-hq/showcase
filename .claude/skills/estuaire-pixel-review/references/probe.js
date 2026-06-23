// probe.js — Estuaire readability / layout-soundness probe (estuaire-pixel-review, Régime B).
//
// At an INTERMEDIATE flagship resolution there is no Figma frame, so there is no pixel
// oracle. The pass criterion is *correctness*, not a diff. This probe catches the
// OBJECTIVE defects deterministically; the subjective ones (balance, orphans, marooned
// fixed-width blocks, hero proportion) stay a human visual scan of the screenshot.
//
// HOW TO RUN — paste this whole file once per page (after navigate) via the Playwright MCP:
//   browser_evaluate({ function: "() => { <contents of this file> ; return 'probe installed' }" })
// It installs window.__estuaireProbe + window.__estuaireSections. Then, per width:
//   browser_resize({ width: W, height: 1000 })
//   browser_evaluate({ function: "() => window.__estuaireProbe()", filename: "probe-<page>-<W>.json" })
// __estuaireProbe scrolls the page through once first (so estuaire-motion reveals settle),
// then measures the CURRENT viewport.
//
// ⚠️ PINNED / scrubbed sections (GSAP `pin: true`, e.g. the home PinnedCaseStudies): their panels
// are transformed/absolute during the pin (pre-offset off-canvas to slide in on scroll), so a
// STATIC probe sees phantom h-overflow and the panels render as an empty band in a screenshot.
// Capture/probe such pages under `page.emulateMedia({reducedMotion:'reduce'})` — the panels fall
// back to normal flow (FR-016), which is the authoritative read of their layout soundness AND
// verifies the reduced-motion UX. (Post-mortem 0016.)
//
// Returns: { width, ok, pageHeight, htmlOverflowX, defects: [ … ] }
// Defect types:
//   h-overflow     — a horizontal scrollbar exists (document wider than viewport) + offenders
//   img-distortion — <img> rendered at an aspect ≠ its natural aspect, with object-fit NOT
//                    cover/contain/scale-down (i.e. the pixels are actually squashed/stretched)
//   tiny-text      — visible text computed below the legibility floor (11px)
//   text-clip      — an overflow:hidden LEAF whose own text is horizontally cut (image/media
//                    crops are deliberate in this design and are NOT flagged)
// See SKILL.md §"Régime B — lisibilité / solidité" for the per-defect pass criteria.

window.__estuaireSettle = async () => {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const fullH = document.documentElement.scrollHeight;
	const step = Math.max(200, Math.round(window.innerHeight * 0.8));
	for (let y = 0; y <= fullH; y += step) {
		window.scrollTo(0, y);
		await sleep(90);
	}
	window.scrollTo(0, fullH);
	await sleep(250);
	window.scrollTo(0, 0);
	await sleep(250);
};

window.__estuaireProbe = async () => {
	await window.__estuaireSettle();
	const W = window.innerWidth;
	const cs = (el) => getComputedStyle(el);
	const visible = (el, r) => {
		if (r.width < 1 || r.height < 1) return false;
		const s = cs(el);
		return s.visibility !== "hidden" && s.display !== "none" && +s.opacity !== 0;
	};
	const cls = (el) => (el.className && el.className.toString().slice(0, 70)) || "";
	const defects = [];
	const all = Array.from(document.querySelectorAll("body *"));

	// 1) Horizontal overflow via REAL element edges, not scrollWidth.
	//    Estuaire sets `overflow-x: clip` on <html>, so a child overflowing the viewport does
	//    NOT grow document.scrollWidth (no scrollbar) — it is silently CLIPPED, yet its content
	//    runs off-screen and is cut. A scrollWidth check misses this entirely (it missed the
	//    univers @1024 « Infos clés » title overrun). So scan element rects for the max right edge.
	//    Only count an element that STRADDLES the right edge (left < W < right) AND is NOT
	//    contained by a clipping ancestor: a deliberate crop (a scale-125/scale-105 cover image
	//    inside an overflow-hidden box, a carousel/scroller) is contained and fine; a title/box
	//    overflowing normal-flow containers up to <html> is the real, user-visible defect.
	//    (NB: a fullPage screenshot WIDER than the viewport is the same oracle from outside.)
	const docW = document.documentElement.scrollWidth;
	const htmlOverflowX = cs(document.documentElement).overflowX;
	const clipsX = (s) =>
		["hidden", "clip", "auto", "scroll"].includes(s.overflowX) ||
		["hidden", "clip", "auto", "scroll"].includes(s.overflow);
	const contained = (el) => {
		let p = el.parentElement;
		while (p && p !== document.body && p !== document.documentElement) {
			if (clipsX(cs(p))) return true;
			p = p.parentElement;
		}
		return false;
	};
	let maxRight = W;
	const offenders = [];
	for (const el of all) {
		const r = el.getBoundingClientRect();
		if (r.width < 2 || r.height < 2) continue;
		if (cs(el).position === "fixed") continue; // sticky chrome, not page flow
		if (r.left >= W || r.right <= W + 1) continue; // not straddling the right edge
		if (contained(el)) continue; // deliberate crop / scroller clipped by an ancestor
		if (r.right > maxRight) maxRight = r.right;
		offenders.push({ tag: el.tagName.toLowerCase(), cls: cls(el), right: Math.round(r.right), w: Math.round(r.width) });
	}
	const overflowPx = Math.round(maxRight - W);
	if (overflowPx > 1) {
		offenders.sort((a, b) => b.right - a.right);
		defects.push({ type: "h-overflow", overflowPx, htmlOverflowX, scrollWidthSawIt: docW > W + 1, offenders: offenders.slice(0, 8) });
	}

	// 2) Distorted images — only when object-fit can't hide a squash/stretch.
	const imgs = [];
	for (const img of document.querySelectorAll("img")) {
		const r = img.getBoundingClientRect();
		if (!visible(img, r)) continue;
		const nw = img.naturalWidth;
		const nh = img.naturalHeight;
		if (!nw || !nh) continue;
		const fit = cs(img).objectFit;
		if (fit === "cover" || fit === "contain" || fit === "scale-down") continue;
		const renderAR = r.width / r.height;
		const natAR = nw / nh;
		const dev = Math.abs(renderAR - natAR) / natAR;
		if (dev > 0.03) {
			imgs.push({
				src: (img.currentSrc || img.src || "").split("/").pop()?.slice(0, 44),
				fit,
				natAR: +natAR.toFixed(3),
				renderAR: +renderAR.toFixed(3),
				devPct: Math.round(dev * 100),
			});
		}
	}
	if (imgs.length) defects.push({ type: "img-distortion", images: imgs.slice(0, 12) });

	// 3) Tiny text — visible text below the legibility floor.
	const FLOOR = 11;
	const tiny = [];
	const seen = new Set();
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	let node;
	while ((node = walker.nextNode())) {
		const t = node.textContent.trim();
		if (t.length < 3) continue;
		const el = node.parentElement;
		if (!el) continue;
		const r = el.getBoundingClientRect();
		if (!visible(el, r)) continue;
		const fs = parseFloat(cs(el).fontSize);
		if (fs && fs < FLOOR) {
			const key = el.tagName + "|" + fs + "|" + t.slice(0, 18);
			if (seen.has(key)) continue;
			seen.add(key);
			tiny.push({ fontPx: +fs.toFixed(1), tag: el.tagName.toLowerCase(), sample: t.slice(0, 44) });
		}
	}
	if (tiny.length) defects.push({ type: "tiny-text", floorPx: FLOOR, items: tiny.slice(0, 12) });

	// 4) TEXT clipping only — a leaf whose own text is cut. Image/media crops (overflow-hidden
	//    on a full-bleed slide, a hover-zoom card) are DELIBERATE here, so they are excluded.
	const clipped = [];
	for (const el of all) {
		const s = cs(el);
		if (s.overflowX !== "hidden" && s.overflow !== "hidden") continue;
		if (el.childElementCount !== 0) continue; // not a leaf → likely a media/layout crop
		const text = el.textContent.trim();
		if (text.length < 2) continue;
		const cut = el.scrollWidth - el.clientWidth;
		if (cut > 2 && el.clientWidth > 8) {
			clipped.push({ tag: el.tagName.toLowerCase(), cls: cls(el), cutPx: cut, sample: text.slice(0, 40) });
		}
	}
	if (clipped.length) defects.push({ type: "text-clip", items: clipped.slice(0, 10) });

	return {
		width: W,
		ok: defects.length === 0,
		pageHeight: document.documentElement.scrollHeight,
		htmlOverflowX,
		defects,
	};
};

// Top-level <section> Y-ranges (DOM) for the pixel-match diff at anchor widths.
window.__estuaireSections = () =>
	Array.from(document.querySelectorAll("main section, main > *[class*='section'], main > section, section")).map((el, i) => {
		const r = el.getBoundingClientRect();
		const top = Math.round(r.top + window.scrollY);
		return { i, top, bottom: top + Math.round(r.height), h: Math.round(r.height), cls: (el.className || "").toString().slice(0, 60) };
	});
