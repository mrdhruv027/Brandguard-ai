# 🛡️ BRANDGUARD AI
> **Intelligent Brand Governance – Catch inconsistencies before content is published.**  
> Built for **CodeNova India 2026 – Round 2** by **Team Innovexa**  
> *Team Leader: Isha Upadhyay (Backend & AI/ML) · Dhruv Sharma (Frontend & Database)*  
> *JSS Academy of Technical Education, Noida · CSE (AI/ML)*

---

## 🌟 Executive Summary & Product Overview

### The Problem
Companies publish advertisements, social media posts, emails, and marketing documents without systematic governance against approved brand guidelines. This leads to **brand drift**: inconsistent messaging, outdated facts, unauthorized claims, off-brand tone, and misspellings of corporate trademarks before anyone notices.

### Our Solution
**BrandGuard AI** is an enterprise AI brand governance platform that evaluates content against an organization's approved guidelines **BEFORE publication**.

### Our Core Differentiator
> *"We don't just detect brand violations. We show the **exact approved rule** behind every finding, help creators fix it, and identify when the company's own guidelines are unclear. The AI suggests corrections, but an authorized human always makes the final approval decision."*

```
   ┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
   │ 1. INGEST     │ ──> │ 2. CHECK      │ ──> │ 3. GROUNDED   │ ──> │ 4. FIX &      │ ──> │ 5. HUMAN      │
   │ Brand Manuals │     │ Content Copy  │     │ RAG FINDINGS  │     │ REVISE        │     │ APPROVAL      │
   └───────────────┘     └───────────────┘     └───────────────┘     └───────────────┘     └───────────────┘
```

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies | Responsibilities |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons | Responsive Enterprise SaaS UI, diff viewer, real-time status badges, 1-click persona selector. |
| **Backend** | Node.js, Express.js, Socket.IO, Multer | REST API orchestration, file upload buffering, role-based authorization, audit log generator. |
| **AI Intelligence** | Python 3, FastAPI, RAG, PyMuPDF, python-docx | Multi-format document parser, rule chunker, citation validation, Gemini 1.5 Flash / Deterministic Rule Engine. |
| **Database** | MongoDB & Mongoose | Schemas for Users, Guidelines, Rules, Submissions, Analyses, Comments, Approvals, and AuditLogs. Resilient in-memory fallback included. |

---

## 🔄 The 6 Core Product Workflow Steps

### Step 1: Organization Guideline Upload
- Supported formats: **PDF**, **DOCX**, **TXT**, and direct raw text input.
- High-fidelity text extraction via **PyMuPDF** and **python-docx** with page numbers retained.
- Auto-chunking into structured rules with unique IDs (e.g. `RULE-CLAIM-002`, `RULE-TERM-002`).
- 7 core governance categories:
  1. **Brand tone**
  2. **Terminology**
  3. **Messaging**
  4. **Approved facts**
  5. **Prohibited claims**
  6. **Formatting**
  7. **Visual identity**
- Full rule review, edit, create, and delete management.

### Step 2: Content Submission Workspace
- Direct rich-text editor or document file upload (.pdf, .docx, .txt).
- Content classification: **Social Media Post**, **Advertisement**, **Email**, **Document**.
- Pre-filled sample draft buttons: *"Load Violating Copy"* and *"Load Compliant Copy"*.
- Prominent primary CTA: **"Check with BrandGuard AI"**.

### Step 3: AI Brand Analysis & Grounded RAG
- **Retrieve First:** Multi-signal semantic and lexical search matches candidate rules to the content.
- **Cite or it Doesn't Count:** Every finding references an exact `rule_id` and verbatim guideline quotation.
- **Strict Citation Validation:** Ensures cited rules exist in MongoDB; unsupported findings are purged.
- **Hybrid Inference:** Powered by Gemini 1.5 Flash when API key is provided, or a high-precision local deterministic engine when offline.

### Step 4: Analysis Results Dashboard
- Compliance Health Gauge (0–100%) and Severity breakdown (High, Medium, Low).
- Flagged text passages highlighted directly within context.
- Verbatim rule citation with document and page origin.
- Action items:
  - **Accept & Apply Suggestion:** 1-click replacement, auto-increments revision version (v1 → v2).
  - **Edit Manually:** In-line editorial revision.
  - **Ignore with Reason:** Records formal exemption in audit log.
  - **Rerun Analysis:** Immediate re-verification.

### Step 5: Human Review & Approval Workflow
- Status lifecycle: `Draft` → `Submitted` → `Analyzing` → `Issues Found` → `Revised` → `Under Review` → `Changes Requested` → `Approved` / `Rejected`.
- **Side-by-Side Diff Viewer:** Compares Original Draft vs Current Revised Copy.
- Threaded reviewer discussion comments.
- **Authorized Decision Sign-off:** Restricted to Brand Managers and Compliance Admins with recorded timestamp, reviewer identity, decision, and comments.

### Step 6: Immutable Audit History
- Chronological trail of every critical event:
  - `guideline_uploaded`
  - `rule_created` / `rule_updated`
  - `content_submitted`
  - `ai_analysis_completed`
  - `suggestion_applied`
  - `content_revised`
  - `comment_added`
  - `changes_requested`
  - `content_approved` / `content_rejected`

---

## 👥 User Roles & Demo Credentials

Switch personas in **1 click** via the top navbar selector or log in with these credentials:

| Role | Name | Email | Password | Permissions |
|---|---|---|---|---|
| **Content Creator** | Dhruv Sharma | `creator@brandguard.ai` | `password123` | Draft, check copy, accept fixes, revise, submit for review. |
| **Brand Manager** | Isha Upadhyay | `manager@brandguard.ai` | `password123` | Inspect queue, view diffs, post comments, approve/reject. |
| **Compliance Admin** | Compliance Officer | `admin@brandguard.ai` | `password123` | Upload manuals, manage rules, review audit logs, approve. |

---

## 🚀 Quick Start & Run Instructions

### Option 1: 1-Click Launch (Recommended on Windows)
Simply double click or run:
```powershell
.\start_all.bat
```
This automatically boots both the Python AI service (port 8000) and the Node.js web server (port 5000), then opens your default browser at `http://localhost:5000`.

---

### Option 2: Running Services Individually

#### 1. Python AI Service (Port 8000)
```powershell
cd ai_service
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Health check:* `http://localhost:8000/health`  
*Swagger Docs:* `http://localhost:8000/docs`

#### 2. Node.js Backend & Web UI (Port 5000)
```powershell
cd server
node src/index.js
```
*Web Application:* `http://localhost:5000`  
*REST API Health:* `http://localhost:5000/api/health`

#### 3. Frontend Hot-Reload Development (Port 3000, Optional)
```powershell
cd client
npm run dev
```

---

## 🧪 Automated Testing & Verification

Run the end-to-end integration test suite:
```powershell
cd server
node test_e2e.js
```
*Tests all 11 steps: health probe, user auth, guideline parsing, violation detection, suggested fix auto-patching, version tracking, role-gated approval, unauthorized prevention, and audit history.*

Run the Python AI pipeline unit tests:
```powershell
python sample_data/test_pipeline.py
```
*Tests PDF extraction with PyMuPDF, DOCX extraction with python-docx, rule chunking, and deterministic violation detection.*

---

## 📁 Sample Test Files Provided

Found in the `sample_data/` folder:
- `Brand_Governance_Manual_2026.pdf` (Formatted multi-page manual with headers and rules)
- `Brand_Governance_Manual_2026.docx` (Word manual)
- `Brand_Governance_Manual_2026.txt` (Text guidelines)
- `sample_violating_post.txt` (Contains 4 real violations: prohibited claims, wrong trademark spelling, aggressive slang, unapproved metrics)
- `sample_compliant_post.txt` (Clean enterprise compliant copy)

---

## 🔑 Environment Variables (`.env`)

```ini
PORT=5000
NODE_ENV=production
JWT_SECRET=brandguard-hackathon-secret-key-2026
MONGODB_URI=mongodb://127.0.0.1:27017/brandguard_ai
AI_SERVICE_URL=http://127.0.0.1:8000
AI_PORT=8000

# Optional: Add Gemini API key for external LLM inference
# GEMINI_API_KEY=AIzaSy...
```

---

## 🌐 Public Cloud Deployment Guide

1. **Docker / Container Deployment:**
   - Run the FastAPI service on container port 8000.
   - Run the Node.js server on container port 5000 (serving `client/dist`).
2. **Platform as a Service (Render / Railway / Vercel):**
   - Connect GitHub repository.
   - Backend service: Build `cd server && npm install`, Start `node src/index.js`.
   - AI service: Build `cd ai_service && pip install -r requirements.txt`, Start `uvicorn main:app --host 0.0.0.0 --port 8000`.
   - Frontend service: Build `cd client && npm install && npm run build`.

---

© 2026 Team Innovexa · CodeNova India Hackathon Round 2.
