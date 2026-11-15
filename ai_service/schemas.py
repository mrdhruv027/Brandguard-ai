from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Rule(BaseModel):
    rule_id: str = Field(..., description="Unique rule identifier e.g. RULE-TONE-001")
    category: str = Field(..., description="Category: Brand tone, Terminology, Messaging, Approved facts, Prohibited claims, Formatting, Visual identity")
    rule_text: str = Field(..., description="Exact approved guideline rule statement")
    explanation: Optional[str] = Field(None, description="Why this rule exists and how to apply it")
    source_doc: Optional[str] = Field("Unknown", description="Source document name")
    page_number: Optional[int] = Field(None, description="Page number where rule was located")
    status: str = Field("approved", description="approved | draft | under_review | archived")
    keywords: Optional[List[str]] = Field(default_factory=list, description="Keywords for retrieval matching")

class RuleExtractionRequest(BaseModel):
    text: str
    source_doc: Optional[str] = "Uploaded Document"

class RuleExtractionResponse(BaseModel):
    rules: List[Rule]
    total_rules: int
    source_doc: str

class ContentAnalysisRequest(BaseModel):
    title: str = "Untitled Content"
    content_type: str = "Social Media Post"  # Social Media Post, Advertisement, Email, Document
    content: str
    rules: List[Rule] = Field(default_factory=list)
    confidence_threshold: float = 0.65

class ViolationFinding(BaseModel):
    finding_id: str
    flagged_text: str = Field(..., description="Exact passage or phrase that violates the guideline")
    category: str = Field(..., description="Violation category matching the rule")
    severity: str = Field("Medium", description="High | Medium | Low")
    rule_id: str = Field(..., description="Exact rule ID that is violated")
    supporting_quotation: str = Field(..., description="Exact quotation from the approved rule text")
    explanation: str = Field(..., description="Explanation of why this content violates the rule")
    suggested_correction: str = Field(..., description="Proposed on-brand alternative")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    engine: Optional[str] = Field("Local Deterministic Rule Engine", description="AI/RAG Engine that detected this finding")
    verified_citation: bool = Field(True, description="True if verified against retrieved approved rules")
    status: str = Field("open", description="open | accepted | ignored | flagged_for_review")
    ignore_reason: Optional[str] = None

class AnalysisResultResponse(BaseModel):
    compliance_score: int = Field(..., ge=0, le=100)
    status: str = Field(..., description="Compliant | Issues Found | Needs Review")
    summary: str
    total_issues: int
    severity_breakdown: Dict[str, int]  # {"High": 0, "Medium": 0, "Low": 0}
    findings: List[ViolationFinding]
    unclear_guidelines: List[Dict[str, Any]] = Field(default_factory=list)
    retrieved_rules_count: int
    model_used: str
    analyzed_at: str
