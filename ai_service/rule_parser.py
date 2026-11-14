import re
from typing import List, Dict, Any
from schemas import Rule

CATEGORY_PREFIXES = {
    "Brand tone": "TONE",
    "Terminology": "TERM",
    "Messaging": "MESG",
    "Approved facts": "FACT",
    "Prohibited claims": "CLAIM",
    "Formatting": "FORM",
    "Visual identity": "VIS"
}

def detect_category(text: str) -> str:
    text_lower = text.lower()

    # Precedence 1: Explicit Section headers if present
    if "section 1:" in text_lower or "brand tone" in text_lower or "voice" in text_lower:
        if "tone" in text_lower or "voice" in text_lower:
            return "Brand tone"
    if "section 2:" in text_lower or "terminology" in text_lower or "product naming" in text_lower:
        return "Terminology"
    if "section 3:" in text_lower or "messaging" in text_lower or "value proposition" in text_lower:
        return "Messaging"
    if "section 4:" in text_lower or "prohibited claims" in text_lower:
        return "Prohibited claims"
    if "section 5:" in text_lower or "approved facts" in text_lower or "metrics" in text_lower:
        return "Approved facts"
    if "section 6:" in text_lower or "formatting" in text_lower or "typography" in text_lower:
        return "Formatting"
    if "section 7:" in text_lower or "visual identity" in text_lower or "color" in text_lower:
        return "Visual identity"

    # Precedence 2: Pattern match on rule text
    if any(k in text_lower for k in ["spell the product name", "spelling", "refer to our", "capitalization", "acronym", "abbreviation", "instead of"]):
        return "Terminology"
    if any(k in text_lower for k in ["never claim", "prohibited", "do not claim", "zero risk", "absolute guarantee", "cannot promise"]):
        return "Prohibited claims"
    if any(k in text_lower for k in ["approved metric", "institutional metric", "statistic", "verified teams", "founded in"]):
        return "Approved facts"
    if any(k in text_lower for k in ["tone", "voice", "empathetic", "professional", "slang", "attitude"]):
        return "Brand tone"
    if any(k in text_lower for k in ["headline", "title case", "exclamation", "oxford comma", "punctuation", "casing"]):
        return "Formatting"
    if any(k in text_lower for k in ["logo", "colors", "hex", "navy", "orange", "palette", "clear space"]):
        return "Visual identity"

    return "Messaging"

def extract_keywords(text: str) -> List[str]:
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    stop_words = {
        "this", "that", "with", "from", "have", "they", "will", "must", "should",
        "always", "never", "about", "their", "which", "would", "there", "could",
        "guideline", "guidelines", "rule", "rules", "brand", "ensure", "using"
    }
    filtered = [w for w in words if w not in stop_words]
    seen = set()
    result = []
    for w in filtered:
        if w not in seen:
            seen.add(w)
            result.append(w)
            if len(result) >= 12:
                break
    return result

def parse_rules_from_text(pages: List[Dict[str, Any]], source_doc: str = "Brand Guidelines.pdf") -> List[Rule]:
    """
    Parses document pages into coherent structured rules.
    Detects numbered lists, bullet points, and rule items while skipping document headers/metadata.
    """
    rules: List[Rule] = []
    cat_counters = {prefix: 1 for prefix in CATEGORY_PREFIXES.values()}

    for page_info in pages:
        page_num = page_info.get("page", 1)
        raw_text = page_info.get("text", "")
        if not raw_text.strip():
            continue

        text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

        # Split into blocks based on numbered list items
        blocks = re.split(r'\n(?=\s*(?:\d+\.\s+|Rule\s+\d+:?|\*|\-|\•))', text)
        if len(blocks) <= 1:
            blocks = [b.strip() for b in text.split("\n\n") if b.strip()]

        current_section = ""

        for block in blocks:
            cleaned = block.strip()
            # Clean up leading list bullet numbers e.g. "1. Rule 1: " -> ""
            clean_rule = re.sub(r'^(?:\d+\.\s*(?:Rule\s+\d+:?)?|Rule\s+\d+:?|\*|\-|\•)\s*', '', cleaned)

            # Check if this block is just a Section Title or Document Header
            if "SECTION " in cleaned.upper() or "BRANDGUARD AI - OFFICIAL" in cleaned.upper() or "ORGANIZATION:" in cleaned.upper():
                current_section = cleaned
                sub_lines = cleaned.split("\n")
                potential_rules = [l.strip() for l in sub_lines if re.match(r'^(?:\d+\.|\*|-|•|Rule\s+\d+)', l.strip())]
                if not potential_rules:
                    continue
                clean_rule = re.sub(r'^(?:\d+\.\s*(?:Rule\s+\d+:?)?|Rule\s+\d+:?|\*|\-|\•)\s*', '', potential_rules[0])

            # Ignore non-rules (metadata or headers without action words)
            action_verbs = ["must", "should", "always", "never", "avoid", "refer", "spell", "claim", "use", "prohibited", "trusted by", "approved", "colors are", "speak"]
            if not any(v in clean_rule.lower() for v in action_verbs) or len(clean_rule) < 25:
                continue

            # Detect category
            category = detect_category(f"{current_section} {clean_rule}")
            prefix = CATEGORY_PREFIXES.get(category, "RULE")
            rule_seq = cat_counters[prefix]
            cat_counters[prefix] += 1

            rule_id = f"RULE-{prefix}-{rule_seq:03d}"
            keywords = extract_keywords(clean_rule)

            explanation = (
                f"Approved {category.lower()} requirement from {source_doc} (Page {page_num}). "
                f"Creators must adhere to this guideline before publishing."
            )

            rules.append(Rule(
                rule_id=rule_id,
                category=category,
                rule_text=clean_rule,
                explanation=explanation,
                source_doc=source_doc,
                page_number=page_num,
                status="approved",
                keywords=keywords
            ))

    return rules
