import sys
import os

ai_dir = os.path.join(os.path.dirname(__file__), '..', 'ai_service')
sys.path.append(os.path.abspath(ai_dir))

from extractor import extract_document
from rule_parser import parse_rules_from_text
from analyzer import analyze_content_end_to_end

def run_tests():
    sample_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_path = os.path.join(sample_dir, "Brand_Governance_Manual_2026.pdf")
    docx_path = os.path.join(sample_dir, "Brand_Governance_Manual_2026.docx")
    violating_path = os.path.join(sample_dir, "sample_violating_post.txt")
    compliant_path = os.path.join(sample_dir, "sample_compliant_post.txt")

    print("=== TEST 1: PDF EXTRACTION ===")
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
    text, pages = extract_document(pdf_bytes, "Brand_Governance_Manual_2026.pdf")
    print(f"Extracted {len(pages)} pages. Total length: {len(text)} chars.")
    assert len(pages) > 0

    print("\n=== TEST 2: RULE PARSING ===")
    rules = parse_rules_from_text(pages, "Brand_Governance_Manual_2026.pdf")
    print(f"Parsed {len(rules)} brand rules:")
    for r in rules[:5]:
        print(f"  [{r.rule_id}] ({r.category}) Page {r.page_number}: {r.rule_text[:70]}...")
    assert len(rules) >= 5

    print("\n=== TEST 3: DOCX EXTRACTION ===")
    with open(docx_path, "rb") as f:
        docx_bytes = f.read()
    d_text, d_pages = extract_document(docx_bytes, "Brand_Governance_Manual_2026.docx")
    d_rules = parse_rules_from_text(d_pages, "Brand_Governance_Manual_2026.docx")
    print(f"DOCX extracted {len(d_rules)} rules.")
    assert len(d_rules) >= 5

    print("\n=== TEST 4: VIOLATING CONTENT CHECK ===")
    with open(violating_path, "r", encoding="utf-8") as f:
        bad_content = f.read()
    bad_result = analyze_content_end_to_end(
        title="Q1 Product Launch Announcement",
        content=bad_content,
        rules=rules,
        content_type="Social Media Post"
    )
    print(f"Status: {bad_result.status}, Score: {bad_result.compliance_score}/100, Issues: {bad_result.total_issues}")
    print(f"Severity Breakdown: {bad_result.severity_breakdown}")
    for f in bad_result.findings:
        print(f"  - Flagged: '{f.flagged_text}' -> Violation of {f.rule_id} ({f.category}, {f.severity})")
        print(f"    Suggested Correction: '{f.suggested_correction}'")
        print(f"    Quotation: '{f.supporting_quotation[:60]}...'")
    assert bad_result.total_issues > 0
    assert bad_result.compliance_score < 70

    print("\n=== TEST 5: COMPLIANT CONTENT CHECK ===")
    with open(compliant_path, "r", encoding="utf-8") as f:
        good_content = f.read()
    good_result = analyze_content_end_to_end(
        title="Compliant Brand Announcement",
        content=good_content,
        rules=rules,
        content_type="Social Media Post"
    )
    print(f"Status: {good_result.status}, Score: {good_result.compliance_score}/100, Issues: {good_result.total_issues}")
    assert good_result.compliance_score >= 80

    print("\n ALL PIPELINE UNIT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
