#!/usr/bin/env python3
"""Build the FICTIONAL Hindi circular used to test Hindi-document support.

    python corpus/demo/hindi/build_hindi_pdf.py

Writes eucb-hindi-circular.pdf (text layer, rendered by headless Chrome, so the Devanagari goes through a real
font's ToUnicode map) and eucb-hindi-circular-scan.pdf (the same pages as 200 dpi images, no text layer: the OCR
path). The bank, circular number and names are invented. Commit the PDFs: their sha256 fixes the upload doc id.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CLAUSES = [
    ("१.", "यह परिपत्र 1 अगस्त 2026 से लागू होगा और इस विषय पर पहले के सभी आंतरिक निर्देशों का स्थान लेगा।", []),
    ("२.", "पूर्व-भुगतान शुल्क:", [
        ("(क)", "व्यक्तियों को गैर-व्यावसायिक उद्देश्य के लिए स्वीकृत फ्लोटिंग दर ऋणों पर कोई पूर्व-भुगतान शुल्क नहीं लिया जाएगा।"),
        ("(ख)", "सूक्ष्म और लघु उद्यमों को ₹50 लाख तक स्वीकृत फ्लोटिंग दर ऋणों पर भी कोई पूर्व-भुगतान शुल्क नहीं लिया जाएगा।"),
        ("(ग)", "स्थिर दर ऋणों पर पूर्व-भुगतान शुल्क बकाया मूलधन के 2 प्रतिशत से अधिक नहीं होगा।"),
    ]),
    ("३.", "दंडात्मक शुल्क:", [
        ("(क)", "ऋण की शर्तों के उल्लंघन पर लगाया गया दंडात्मक शुल्क ब्याज दर में नहीं जोड़ा जाएगा और उस पर कोई ब्याज नहीं लिया जाएगा।"),
        ("(ख)", "दंडात्मक शुल्क की अधिकतम राशि ₹5,000 प्रति माह होगी।"),
    ]),
    ("४.", "संपत्ति दस्तावेज़ों की वापसी:", [
        ("(क)", "पूरा ऋण चुकाने के 30 दिनों के भीतर सभी मूल चल और अचल संपत्ति दस्तावेज़ उधारकर्ता को लौटाए जाएंगे।"),
        ("(ख)", "देरी होने पर बैंक उधारकर्ता को देरी के प्रत्येक दिन के लिए ₹5,000 का मुआवज़ा देगा।"),
    ]),
    ("५.", "सभी खुदरा और एमएसएमई ऋणों के लिए ऋण अनुबंध से पहले उधारकर्ता को मुख्य तथ्य विवरण (केएफएस) दिया जाएगा। "
           "केएफएस में वार्षिक प्रतिशत दर बताई जाएगी।", []),
    ("६.", "ब्याज दर रीसेट के समय उधारकर्ता को ईएमआई बढ़ाने, अवधि बढ़ाने या दोनों के संयोजन का विकल्प दिया जाएगा।", []),
    ("७.", "इस परिपत्र से संबंधित शिकायतें नोडल अधिकारी श्री रमेश कुमार वर्मा को भेजी जा सकती हैं, जो 15 कार्य दिवसों में "
           "उत्तर देंगे।", []),
]


def html():
    body = []
    for num, text, subs in CLAUSES:
        body.append(f"<p class='c'>{num} {text}</p>")
        body += [f"<p class='s'>{m} {t}</p>" for m, t in subs]
    return f"""<!doctype html><html lang="hi"><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 22mm 20mm; }}
body {{ font-family: 'Kohinoor Devanagari', 'Devanagari MT', sans-serif; font-size: 12.5pt; line-height: 1.55; }}
h1 {{ font-size: 15pt; text-align: center; margin: 0 0 4pt; }} .m {{ text-align: center; margin: 0; }}
.c {{ margin: 10pt 0 2pt; }} .s {{ margin: 2pt 0 2pt 26pt; }} .sig {{ margin-top: 28pt; }}
</style></head><body>
<h1>उदाहरण शहरी सहकारी बैंक लिमिटेड (काल्पनिक)</h1>
<p class="m">प्रधान कार्यालय, ऋण विभाग</p>
<p class="m">परिपत्र सं. उशसबैं/ऋण/2026-27/09 &nbsp; दिनांक: 15 जुलाई 2026</p>
<p class="c">सभी शाखा प्रबंधक</p>
<p class="c">विषय: ऋणों पर पूर्व-भुगतान शुल्क, दंडात्मक शुल्क और संपत्ति दस्तावेज़ों की वापसी</p>
{''.join(body)}
<p class="sig">(सुरेश चंद्र शर्मा)<br>महाप्रबंधक</p>
</body></html>"""


def main():
    out = HERE / "eucb-hindi-circular.pdf"
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "c.html"
        src.write_text(html(), encoding="utf-8")
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                        f"--print-to-pdf={out}", src.as_uri()], check=True, capture_output=True, timeout=120)
    import pdfplumber
    from PIL import Image
    imgs = []
    with pdfplumber.open(out) as pdf:
        for p in pdf.pages:
            imgs.append(p.to_image(resolution=200).original.convert("RGB"))
    scan = HERE / "eucb-hindi-circular-scan.pdf"
    imgs[0].save(scan, save_all=True, append_images=imgs[1:], resolution=200)
    print(out, scan)


if __name__ == "__main__":
    sys.exit(main())
