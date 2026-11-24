"""Crop the 2x UI captures (assets/ui, 2880x1800) into the deck images (assets/crops) and write callout positions.
Boxes are (x0, y0, x1, y1) in original pixels. Callouts are (n, fx, fy): fractions of the crop."""
import json
from pathlib import Path
from PIL import Image

D = Path(__file__).resolve().parents[1] / "assets"
k = 2880 / 1100  # thumbnails were read at 1100 px wide
def t(*b): return tuple(round(v * k) for v in b)

CROPS = {
    "hero-withheld.png": ("02-sep-tray-full.png", t(175, 322, 668, 687)),
    "answer-workspace.png": ("01-answer-full.png", (432, 480, 2880, 1800)),
    "conflict.png": ("04-conflict-card.png", (0, 99, 1282, 501)),
    "upload.png": ("05b-upload-report.png", t(245, 82, 862, 232)),
    "summary-hi.png": ("06b-summary-hi-full.png", t(175, 418, 668, 532)),
    "withheld-tray.png": ("02-withheld-tray.png", None),
    "calc.png": ("09-calc-card.png", None),
    "abstain.png": ("08a-abstain-card.png", None),
    "ins-conflict.png": ("12-ins-conflict.png", None),
    "clause-history.png": ("14-history-full.png", (600, 520, 2700, 1650)),
    "audit.png": ("10-audit-verified.png", (600, 470, 2700, 1780)),
}
CALLOUTS = {  # dots with fx < 0 sit just outside the image's left edge, beside the row they point at
    "hero-withheld.png": [(1, -0.05, 0.203), (2, -0.05, 0.405), (3, -0.05, 0.578)],
    "answer-workspace.png": [(1, -0.035, 0.563), (2, -0.035, 0.829), (3, 0.40, 0.228), (4, 0.594, 0.703)],
}
for out, (src, box) in CROPS.items():
    p = D / "ui" / src
    if not p.exists():
        print("missing", src); continue
    im = Image.open(p).convert("RGB")
    if box: im = im.crop(box)
    im.save(D / "crops" / out, optimize=True)
    print(out, im.size)
# Hide model names printed in the UI (the deck carries no model details): fill with the surrounding background.
MASKS = {
    "hero-withheld.png": [(318, 428, 552, 464), (670, 826, 900, 864)],
    "answer-workspace.png": [(340, 778, 600, 818), (340, 1270, 580, 1310)],
}
from PIL import ImageDraw
for name, boxes in MASKS.items():
    im = Image.open(D / "crops" / name).convert("RGB"); dr = ImageDraw.Draw(im)
    for x0, y0, x1, y1 in boxes:
        dr.rectangle((x0, y0, x1, y1), fill=im.getpixel((x1 + 6, (y0 + y1) // 2)))
    im.save(D / "crops" / name, optimize=True)
(D / "crops" / "callouts.json").write_text(json.dumps(CALLOUTS, indent=1))
