import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import json

from schemas import (
    Rule,
    RuleExtractionRequest,
    RuleExtractionResponse,
    ContentAnalysisRequest,
    AnalysisResultResponse
)
from extractor import extract_document
from rule_parser import parse_rules_from_text
from analyzer import (
    analyze_content_end_to_end,
    retrieve_relevant_rules,
    GEMINI_KEY,
    OPENAI_KEY
)

app = FastAPI(
    title="BrandGuard AI - AI Governance Service",
    description="Python FastAPI service for document extraction, RAG retrieval, rule parsing, and grounded brand compliance checking.",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "BrandGuard AI - Intelligence Engine",
        "version": "1.0.0",
        "status": "online",
        "has_gemini_key": bool(GEMINI_KEY),
        "has_openai_key": bool(OPENAI_KEY),
        "mode": "hybrid-rag" if (GEMINI_KEY or OPENAI_KEY) else "local-deterministic-engine"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "active_engine": "Gemini 1.5 Flash" if GEMINI_KEY else "Local Deterministic Rule Engine",
        "llm_connected": bool(GEMINI_KEY or OPENAI_KEY),
        "supported_formats": [".pdf", ".docx", ".txt"]
    }

@app.post("/api/extract-text")
async def extract_text_endpoint(
    file: UploadFile = File(...)
):
    """
    Accepts PDF, DOCX, or TXT file and extracts page-aware text.
    """
    try:
        content_bytes = await file.read()
        filename = file.filename or "uploaded_document.txt"
        full_text, pages = extract_document(content_bytes, filename)
        
        return {
            "success": True,
            "filename": filename,
            "page_count": len(pages),
            "full_text": full_text,
            "pages": pages
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process file: {str(e)}"
        )

@app.post("/api/extract-rules", response_model=RuleExtractionResponse)
async def extract_rules_endpoint(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    source_name: Optional[str] = Form("Brand Guidelines.pdf")
):
    """
    Extracts brand rules from uploaded guideline document or raw text.
    Categorizes rules, extracts keywords, and assigns unique Rule IDs.
    """
    try:
        pages = []
        doc_name = source_name or "Brand Guidelines.pdf"

        if file:
            content_bytes = await file.read()
            doc_name = file.filename or doc_name
            _, pages = extract_document(content_bytes, doc_name)
        elif raw_text:
            pages = [{"page": 1, "text": raw_text}]
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either 'file' or 'raw_text' must be provided."
            )

        extracted_rules = parse_rules_from_text(pages, source_doc=doc_name)
        
        return RuleExtractionResponse(
            rules=extracted_rules,
            total_rules=len(extracted_rules),
            source_doc=doc_name
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Rule extraction error: {str(e)}"
        )

@app.post("/api/analyze-content", response_model=AnalysisResultResponse)
async def analyze_content_endpoint(payload: ContentAnalysisRequest):
    """
    Core BrandGuard AI analysis pipeline:
    1. Retrieves relevant approved rules from payload rules.
    2. Runs RAG / deterministic brand evaluation.
    3. Validates citations to prevent hallucinations.
    4. Returns structured compliance score, findings, and explanations.
    """
    try:
        result = analyze_content_end_to_end(
            title=payload.title,
            content=payload.content,
            rules=payload.rules,
            content_type=payload.content_type
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content analysis failed: {str(e)}"
        )

if __name__ == "__main__":
    port = int(os.environ.get("AI_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
