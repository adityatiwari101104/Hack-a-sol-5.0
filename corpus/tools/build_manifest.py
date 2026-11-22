"""Copy hand-downloaded RBI PDFs into corpus/real/rbi/ and build the manifest.

Usage:
    python corpus/tools/build_manifest.py [DOWNLOAD_DIR]   (default: ~/Downloads)

Reads corpus/sources.csv (hand-maintained metadata), copies each file from
DOWNLOAD_DIR to corpus/real/rbi/<file> if it is not already there, then writes:
  - corpus/MANIFEST.csv : metadata + pages, sha256, circular no. and date found in the PDF text
  - corpus/real/rbi/SHA256SUMS : verify with `cd corpus/real/rbi && shasum -a 256 -c SHA256SUMS`

Requires: pypdf (pip install pypdf). PDFs themselves are git-ignored (RBI reserves rights);
only the manifest and checksums are committed.
"""
import csv
import hashlib
import re
import shutil
import sys
from datetime import date
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "real" / "rbi"
SOURCES = ROOT / "sources.csv"
MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December"


def pdf_facts(path: Path) -> dict:
    reader = PdfReader(str(path))
    first = re.sub(r"\s+", " ", " ".join((p.extract_text() or "") for p in reader.pages[:2]))
    # RBI PDFs sometimes extract as "RBI /2024-25/18"; normalise spaces around slashes.
    first_norm = re.sub(r"\s*/\s*", "/", first)
    ref = re.search(r"RBI(?:/DOR)?/\d{4}-\d{2}/\d+", first_norm)
    when = re.search(rf"\b({MONTHS}) \d{{1,2}}, \d{{4}}", first)
    empty_pages = sum(1 for p in reader.pages if len((p.extract_text() or "").strip()) < 30)
    return {
        "pages": len(reader.pages),
        "circular_no_in_text": ref.group(0) if ref else "",
        "first_date_in_text": when.group(0) if when else "",
        "near_empty_pages": empty_pages,
    }


def main() -> None:
    download_dir = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else Path.home() / "Downloads"
    DEST.mkdir(parents=True, exist_ok=True)
    rows, sums, missing = [], [], []
    with SOURCES.open(newline="", encoding="utf-8") as fh:
        for src in csv.DictReader(fh):
            target = DEST / src["file"]
            if not target.exists():
                origin = download_dir / src["download_name"]
                if not origin.exists():
                    missing.append(src["download_name"])
                    continue
                shutil.copy2(origin, target)
            digest = hashlib.sha256(target.read_bytes()).hexdigest()
            facts = pdf_facts(target)
            if not src["circular_no"].startswith("RBI"):
                match = "n/a"  # press releases etc. carry no RBI/yyyy-yy/n reference
            elif facts["circular_no_in_text"] == src["circular_no"]:
                match = "yes"
            else:
                match = "CHECK"
            rows.append({
                "file": src["file"], "title": src["title"], "circular_no": src["circular_no"],
                "circular_no_in_text": facts["circular_no_in_text"], "circular_no_matches": match,
                "first_date_in_text": facts["first_date_in_text"], "pages": facts["pages"],
                "near_empty_pages": facts["near_empty_pages"], "sha256": digest,
                "role": src["role"], "pdf_url": src["pdf_url"], "html_url": src["html_url"],
                "hindi_html_url": src["hindi_html_url"], "manifest_built": date.today().isoformat(),
            })
            sums.append(f"{digest}  {src['file']}")

    with (ROOT / "MANIFEST.csv").open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    (DEST / "SHA256SUMS").write_text("\n".join(sums) + "\n", encoding="utf-8")

    print(f"{len(rows)} documents in manifest")
    for r in rows:
        print(f"  [{r['circular_no_matches']:5}] {r['file']}  pages={r['pages']}  date={r['first_date_in_text']}")
    if missing:
        print("MISSING downloads (not copied):", *missing, sep="\n  ")


if __name__ == "__main__":
    main()
