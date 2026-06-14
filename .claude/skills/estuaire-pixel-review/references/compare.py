#!/usr/bin/env python3
"""
Estuaire pixel-perfect comparison helper (see the `estuaire-pixel-review` skill).

Aligns a Figma REFERENCE render and a DEV screenshot for close, section-scoped
comparison. Both inputs are first normalised to a COMMON WIDTH, so coordinates line
up; then each is cropped to a section's Y-range and composed as:
  - side  : reference | dev, aspect-preserved, padded to equal height (DEFAULT — most
            readable for spotting layout / proportion / content differences);
  - overlay: dev resized onto the reference box, blended 50% (onion-skin — ghosting
            reveals positional / size misalignment);
  - diff  : per-pixel difference on the same box (bright = differs);
  - all   : the three stacked.

KEY TRICK — coordinates after width-normalisation:
  A Figma frame export keeps the frame's aspect, so once the reference is scaled to
  the breakpoint width (1920 / 768 / 390) its height equals the frame height and a
  section's `--ref-rows` are exactly the node's Y-range (`figma.ts read` → `@(x,y) w×h`).
  The dev screenshot is already that width, so `--dev-rows` are the section's DOM
  Y-range (`el.getBoundingClientRect().top + scrollY` and `+ height`). Omit both rows
  to compare the WHOLE page.

Usage:
  python3 compare.py REF.png DEV.png OUT.png \
      [--ref-rows Y0:Y1] [--dev-rows Y0:Y1] [--mode side|overlay|diff|all] [--width N]
"""
import argparse

from PIL import Image, ImageChops, ImageDraw, ImageOps

INK = (14, 18, 21)
PAPER = (255, 255, 255)
FRAME = (210, 210, 210)


def parse_rows(s):
    if not s:
        return None
    a, b = s.split(":")
    return int(float(a)), int(float(b))


def to_width(img, w):
    if img.width == w:
        return img
    h = round(img.height * w / img.width)
    return img.resize((w, h), Image.LANCZOS)


def crop_rows(img, rows):
    if rows is None:
        return img
    y0, y1 = rows
    return img.crop((0, max(0, y0), img.width, min(img.height, y1)))


def label(img, text):
    bar_h = 30
    bar = Image.new("RGB", (img.width, bar_h), INK)
    ImageDraw.Draw(bar).text((10, 8), text, fill=PAPER)
    out = Image.new("RGB", (img.width, img.height + bar_h), PAPER)
    out.paste(bar, (0, 0))
    out.paste(img.convert("RGB"), (0, bar_h))
    return out


def pad(img, size):
    return ImageOps.pad(img, size, color=PAPER, centering=(0, 0))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ref")
    ap.add_argument("dev")
    ap.add_argument("out")
    ap.add_argument("--ref-rows")
    ap.add_argument("--dev-rows")
    ap.add_argument("--mode", default="side", choices=["side", "overlay", "diff", "all"])
    ap.add_argument("--width", type=int, default=0, help="common width (default: min of the two)")
    ap.add_argument("--gap", type=int, default=24)
    a = ap.parse_args()

    ref = Image.open(a.ref).convert("RGB")
    dev = Image.open(a.dev).convert("RGB")

    # 1) normalise BOTH to a common width so coordinates line up
    w = a.width or min(ref.width, dev.width)
    ref, dev = to_width(ref, w), to_width(dev, w)

    # 2) crop each to its section (rows are in the width-normalised space)
    ref = crop_rows(ref, parse_rows(a.ref_rows))
    dev = crop_rows(dev, parse_rows(a.dev_rows))

    panels = []
    if a.mode in ("side", "all"):
        h = max(ref.height, dev.height)
        canvas = Image.new("RGB", (w * 2 + a.gap, h + 30), FRAME)
        canvas.paste(label(pad(ref, (w, h)), "FIGMA (ref)"), (0, 0))
        canvas.paste(label(pad(dev, (w, h)), "DEV"), (w + a.gap, 0))
        panels.append(canvas)
    if a.mode in ("overlay", "all"):
        dev_r = dev.resize(ref.size, Image.LANCZOS)
        panels.append(label(Image.blend(ref, dev_r, 0.5), "OVERLAY 50% (ghost = misaligned)"))
    if a.mode in ("diff", "all"):
        dev_r = dev.resize(ref.size, Image.LANCZOS)
        panels.append(label(ImageChops.difference(ref, dev_r), "DIFF (bright = differs)"))

    if len(panels) == 1:
        result = panels[0]
    else:
        W = max(p.width for p in panels)
        H = sum(p.height for p in panels) + a.gap * (len(panels) - 1)
        result = Image.new("RGB", (W, H), FRAME)
        y = 0
        for p in panels:
            result.paste(p, (0, y))
            y += p.height + a.gap

    result.save(a.out)
    print(f"wrote {a.out}  {result.size}  (common width {w}px)")


if __name__ == "__main__":
    main()
