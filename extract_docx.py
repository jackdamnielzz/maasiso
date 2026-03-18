import zipfile, sys, io, re
from xml.etree import ElementTree as ET

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

docx = zipfile.ZipFile('OCD CURES RESEARCH (AutoRecovered).docx')
xml_content = docx.read('word/document.xml')
tree = ET.fromstring(xml_content)

ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

paragraphs = []
for para in tree.iter(W + 'p'):
    texts = []
    is_bold = True
    has_runs = False
    for run in para.iter(W + 'r'):
        has_runs = True
        rPr = run.find('w:rPr', ns)
        run_bold = False
        if rPr is not None:
            b = rPr.find('w:b', ns)
            if b is not None:
                val = b.get(W + 'val', 'true')
                if val == 'false':
                    run_bold = False
                else:
                    run_bold = True

        for t in run.iter(W + 't'):
            if t.text:
                texts.append(t.text)

        # Check if this non-bold run has actual text content
        run_texts = [t.text for t in run.iter(W + 't') if t.text and t.text.strip()]
        if not run_bold and run_texts:
            is_bold = False

    if not has_runs:
        is_bold = False

    text = ''.join(texts).strip()
    paragraphs.append({'text': text, 'bold': is_bold})

# Save as intermediate format
with open('_extracted_content.txt', 'w', encoding='utf-8') as f:
    for p in paragraphs:
        marker = 'B' if p['bold'] else 'N'
        f.write(f'{marker}|{p["text"]}\n')

print(f'Extracted {len(paragraphs)} paragraphs')
