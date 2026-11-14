import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import docx

def create_pdf(pdf_path, text_content):
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#F97316'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    story = []
    lines = text_content.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            story.append(Spacer(1, 6))
        elif line.startswith('BRANDGUARD AI'):
            story.append(Paragraph(line, title_style))
        elif line.startswith('SECTION'):
            story.append(Spacer(1, 8))
            story.append(Paragraph(line, h2_style))
        else:
            story.append(Paragraph(line, body_style))

    doc.build(story)
    print(f"[Sample Generator] Created PDF: {pdf_path}")

def create_docx(docx_path, text_content):
    doc = docx.Document()
    doc.add_heading("BRANDGUARD AI - OFFICIAL BRAND GOVERNANCE MANUAL 2026", 0)
    
    lines = text_content.strip().split('\n')
    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue
        elif line.startswith('SECTION'):
            doc.add_heading(line, level=1)
        elif line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.', '13.', '14.', '15.')):
            doc.add_paragraph(line, style='List Number')
        else:
            doc.add_paragraph(line)

    doc.save(docx_path)
    print(f"[Sample Generator] Created DOCX: {docx_path}")

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    txt_path = os.path.join(base_dir, "Brand_Governance_Manual_2026.txt")
    with open(txt_path, "r", encoding="utf-8") as f:
        text = f.read()

    pdf_out = os.path.join(base_dir, "Brand_Governance_Manual_2026.pdf")
    docx_out = os.path.join(base_dir, "Brand_Governance_Manual_2026.docx")
    
    create_pdf(pdf_out, text)
    create_docx(docx_out, text)

    # Sample violating draft
    violating_text = (
        "🚀 Exciting news from brandguard!\n\n"
        "We are thrilled to launch our next-gen solution that is 100% bug-free and dirt cheap compared to outdated alternatives. "
        "Over 9,000 teams trust us already for their marketing governance needs!! "
        "Sign up today for our zero risk guarantee and experience the difference."
    )
    with open(os.path.join(base_dir, "sample_violating_post.txt"), "w", encoding="utf-8") as f:
        f.write(violating_text)

    # Sample compliant draft
    compliant_text = (
        "Introducing BrandGuard AI: Intelligent Brand Governance.\n\n"
        "Catch inconsistencies before content is published. BrandGuard AI empowers modern marketing organizations "
        "to maintain institutional tone, adhere to approved facts, and eliminate off-brand claims. "
        "Trusted by over 450+ enterprise compliance teams worldwide, our grounded governance engine suggests actionable fixes while human reviewers retain final approval authority."
    )
    with open(os.path.join(base_dir, "sample_compliant_post.txt"), "w", encoding="utf-8") as f:
        f.write(compliant_text)

    print("[Sample Generator] All test assets generated successfully.")
