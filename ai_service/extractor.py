import io
import os
from typing import List, Dict, Any, Tuple

try:
    import pymupdf as fitz  # PyMuPDF
    HAVE_PYMUPDF = True
except ImportError:
    try:
        import fitz
        HAVE_PYMUPDF = True
    except ImportError:
        HAVE_PYMUPDF = False

try:
    import pypdf
    HAVE_PYPDF = True
except ImportError:
    HAVE_PYPDF = False

try:
    import docx
    HAVE_DOCX = True
except ImportError:
    HAVE_DOCX = False

def extract_text_from_pdf(file_bytes: bytes, filename: str = "document.pdf") -> List[Dict[str, Any]]:
    """
    Extracts text page by page from a PDF document.
    Returns a list of dicts: [{"page": 1, "text": "..."}]
    """
    pages = []
    if HAVE_PYMUPDF:
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text").strip()
                if text:
                    pages.append({"page": page_num + 1, "text": text})
            doc.close()
            if pages:
                return pages
        except Exception as e:
            print(f"[Extractor] PyMuPDF failed: {e}, falling back to PyPDF if available")

    if HAVE_PYPDF:
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for i, page in enumerate(reader.pages):
                text = (page.extract_text() or "").strip()
                if text:
                    pages.append({"page": i + 1, "text": text})
            if pages:
                return pages
        except Exception as e:
            print(f"[Extractor] PyPDF failed: {e}")

    # Fallback if both fail or empty
    if not pages:
        pages.append({"page": 1, "text": ""})
    return pages

def extract_text_from_docx(file_bytes: bytes, filename: str = "document.docx") -> List[Dict[str, Any]]:
    """
    Extracts text from DOCX files.
    """
    if not HAVE_DOCX:
        # Fallback if python-docx not installed
        try:
            text = file_bytes.decode('utf-8', errors='ignore')
            return [{"page": 1, "text": text}]
        except Exception:
            return [{"page": 1, "text": ""}]

    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    paragraphs.append(row_text)

        full_text = "\n\n".join(paragraphs)
        return [{"page": 1, "text": full_text}]
    except Exception as e:
        print(f"[Extractor] DOCX parsing error: {e}")
        return [{"page": 1, "text": ""}]

def extract_text_from_txt(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Extracts text from TXT files.
    """
    try:
        text = file_bytes.decode('utf-8')
    except UnicodeDecodeError:
        text = file_bytes.decode('latin-1', errors='ignore')
    return [{"page": 1, "text": text.strip()}]

def extract_document(file_bytes: bytes, filename: str) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Universal extractor routing by file extension.
    Returns: (full_text, pages_list)
    """
    ext = os.path.splitext(filename)[1].lower()
    pages: List[Dict[str, Any]] = []

    if ext == ".pdf":
        pages = extract_text_from_pdf(file_bytes, filename)
    elif ext in [".docx", ".doc"]:
        pages = extract_text_from_docx(file_bytes, filename)
    elif ext in [".txt", ".md", ".json"]:
        pages = extract_text_from_txt(file_bytes)
    else:
        # Generic text attempt
        pages = extract_text_from_txt(file_bytes)

    full_text = "\n\n".join(f"[Page {p['page']}]\n{p['text']}" for p in pages if p['text'])
    return full_text, pages
