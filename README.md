# API & Android Security Assessment Platform

### August Batch Minor Project Assessment — Practical & Scenario-Based Evaluation (Total Marks: 100)
**Organization:** UNLOX Academy / RIVOQUIX LEARNING PRIVATE LIMITED  
**Role:** Senior Cybersecurity Engineer, Full-Stack Developer, API Security Tester, Android Security Analyst  
**Design Standard:** Pure White Background (`#FFFFFF`) with Professional Blue Accents

---

## 1. Executive Summary & Overview

The **API & Android Security Assessment Platform** is a full-stack cybersecurity workstation and technical investigation dashboard engineered to satisfy every requirement of the UNLOX Minor Project Assessment (August Batch).

The platform bridges real-time security testing with structured documentation, supporting practical vulnerability evaluation across:
* **API Reconnaissance & Attack Surface Mapping** (OWASP API Top 10)
* **Broken Object Level Authorization (BOLA / IDOR)**
* **Multi-Step Attack Path Chaining in OWASP crAPI**
* **Dual-User Permission Matrices & AuthN vs AuthZ Distinction**
* **OTP Authentication Lifecycle & Client-Side Verification Bypass**
* **Android APK Reverse Engineering & Decompilation with JADX**
* **Exposed Credential & Internal Route Leak Investigation**
* **Integrated Pentester Decision-Making & Strategy**
* **Centralized Evidence Management & Redaction Vault**
* **Automated Publication of 23-Section PDF & DOCX Technical Reports**

---

## 2. Assessment Question Mapping (100% Coverage)

| Question | Topic | Marks | Platform Implementation | Verification Status |
| :--- | :--- | :---: | :--- | :---: |
| **Q1** | **API Reconnaissance & Attack Surface Mapping** | 15 | Structured endpoint register (10 endpoints, method, auth, params, security function). 3 priority targets flagged for deep BOLA testing. OpenAPI JSON import. | **Complete** |
| **Q2** | **API Vulnerability Assessment** | 15 | Two verified weaknesses demonstrated with sanitized request/response evidence: BOLA in vehicle location API (CVSS 8.5) and Excessive PII exposure in forum posts (CVSS 6.5). | **Complete** |
| **Q3** | **crAPI Practical Investigation** | 10 | 3-step chained exploit: Forum PII harvesting $\rightarrow$ BOLA GPS tracking $\rightarrow$ Malicious mechanic contact request exfiltrating vehicle telemetry. | **Complete** |
| **Q4** | **Broken Object Level Authorization (BOLA)** | 10 | User A (102) vs User B (103) replay verification console. Impact analysis, synthetic data safeguards, and server-side authorization code guards. | **Complete** |
| **Q5** | **Authorization Testing Matrix** | 10 | Cross-account permission matrix (T1–T6) evaluating READ, MODIFY, DELETE permissions. Diagnostic guide distinguishing HTTP 401 AuthN from HTTP 403 AuthZ. | **Complete** |
| **Q6** | **OTP Bypass Investigation** | 10 | 7-stage normal OTP workflow diagram + safe testing of client-side validation bypass and lack of rate limiting. Evidence, impact, and remediation. | **Complete** |
| **Q7** | **Authentication Security Review** | 5 | Technical audit checklist of 5 mandatory controls (Server-side validation, Expiry TTL, Attempt limits, Replay single-use, Session tokens) per NIST SP 800-63B. | **Complete** |
| **Q8** | **Android APK Reconnaissance with JADX** | 10 | JADX decompiler CLI integration + native Dalvik DEX bytecode scanner. Findings table with Google API key, JWT mock tokens, hidden endpoints, and secret redaction. | **Complete** |
| **Q9** | **APK Secret Leak Investigation** | 5 | 6-question non-destructive evaluation workflow determining sensitivity, validity, and scope of exposed keys. 4-step developer key rotation playbook. | **Complete** |
| **Q10** | **Integrated Pentester Decision-Making** | 10 | 10-step holistic investigation plan correlating mobile decompilation, hidden routes, BOLA parameter tampering, and client-side OTP logic. | **Complete** |
| **Total** | | **100** | **All 10 Questions Satisfied & Verified** | **100% COMPLETE** |

---

## 3. Strict Website Design Compliance

The platform strictly conforms to the mandatory **Pure White Background** requirement:

* **Canvas & Main Background:** Pure White (`#FFFFFF`).
* **Content Cards:** Pure White (`#FFFFFF`) with subtle gray borders (`#E5E7EB`, `#E2E8F0`).
* **Sidebar & Navigation:** Pure White (`#FFFFFF`) with blue active indicators (`bg-blue-50 text-blue-700`).
* **Navbar:** Pure White (`#FFFFFF`) with subtle bottom border (`#E5E7EB`).
* **Typography:** Dark charcoal / black (`#111827`, `#1E293B`) for optimal contrast and readability.
* **Primary Accent:** Professional Blue (`#2563EB`, `#1D4ED8`).
* **Data Tables & Inputs:** White background fields with crisp light gray borders.
* **Zero Dark Mode / Zero Full-Screen Gradients:** Designed as an enterprise cybersecurity auditor console.

---

## 4. Application Architecture & Technology Stack

* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React icons, Recharts data visualization.
* **Backend:** Python 3.13, FastAPI REST API, Uvicorn ASGI server, Pydantic data schemas.
* **Database & Persistence:** SQLite 3 with SQLAlchemy ORM (persisted at `database/security_platform.db`).
* **Mobile Analysis:** JADX decompiler integration with fallback native Dalvik DEX bytecode & AndroidManifest string extractor.
* **Live HTTP Testing:** Python requests with header sanitization and duration telemetry.
* **Reporting Engines:** ReportLab (custom `NumberedCanvas` PDF generation) and python-docx (Microsoft Word `.docx` generation).

---

## 5. Website Navigation Structure (All 15 Pages Functional)

1. **Dashboard (`/`):** Summary cards, vulnerability distribution charts, completion percentage, recent activity.
2. **Project Overview (`/project-overview`):** Assessment metadata, target lab URL configuration, ethical rules of engagement.
3. **API Reconnaissance (`/api-recon` - Q1):** 10 cataloged endpoints, OpenAPI spec importer, filter by method/auth/status, deep test flags.
4. **API Vulnerability Assessment (`/api-vulns` - Q2):** Interactive HTTP testing workbench, BOLA and PII leak proof-of-concept records.
5. **crAPI Investigation (`/crapi` - Q3):** Docker daemon detection, crAPI setup guide, 3-step chained exploit visualization.
6. **BOLA Testing (`/bola` - Q4):** User A vs User B profile comparison console, server-side fix blueprint.
7. **Authorization Testing (`/auth-matrix` - Q5):** Multi-tenant READ/MODIFY/DELETE matrix, AuthN vs AuthZ diagnostic guide.
8. **OTP Security (`/otp-security` - Q6 & Q7):** 7-step OTP state machine, bypass test cases, and 5 mandatory defense controls.
9. **Android APK Analysis (`/apk-analysis` - Q8):** APK uploader, sample APK generator, JADX status, disassembled code findings table with secret masking.
10. **APK Leak Investigation (`/apk-leak` - Q9):** 6-step non-destructive secret evaluation workflow, developer rotation guide.
11. **Integrated Assessment (`/integrated` - Q10):** 10-step holistic pentest strategy, risk assessment, data protection safeguards.
12. **Evidence Manager (`/evidence`):** Centralized evidence vault with file previews (PNG, JPG, TXT, JSON) and token redaction.
13. **Vulnerability Reports (`/vuln-reports`):** Centralized severity register with search, filtering, and CVSS scoring.
14. **Final Report (`/final-report`):** 23-chapter technical report preview with one-click PDF & DOCX download.
15. **Settings (`/settings`):** Tool diagnostics (Docker, JADX, Database), target URLs, secret redaction controls.

---

## 6. Quick Start & Execution Guide

### Prerequisites
* Windows 10/11
* Python 3.10+ (Python 3.13 installed)
* Node.js v18+ (Node v26.13 installed with npm)

### Option A: One-Click Startup (Recommended for Windows)
Double-click `start_platform.bat` or run in terminal:
```powershell
.\start_platform.bat
```
This automatically launches:
* **Backend:** FastAPI on `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`)
* **Frontend:** Vite React dev server on `http://localhost:5173`

### Option B: Manual Startup

**1. Launch Backend:**
```powershell
# Using Python 3.13 executable:
& "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**2. Launch Frontend:**
```powershell
cd frontend
npm run dev
```
Open your browser to: **`http://localhost:5173`** (or access the compiled single-origin app directly at **`http://localhost:8000`**).

---

## 7. Generating Technical Reports

* **PDF Export:** Click **Export PDF** in the top navigation bar or navigate to **Final Report** $\rightarrow$ **Download PDF Report**.
* **DOCX Export:** Click **Export DOCX** in the top navigation bar or navigate to **Final Report** $\rightarrow$ **Download DOCX**.
* Output documents are stored in the `reports/` directory and incorporate all 23 required sections with zero fabricated results.

---

## 8. Ethical Testing Guardrails & Credential Redaction

* **Scope Restriction:** All active testing features are restricted to authorized local sandbox instances (e.g., OWASP crAPI on `http://localhost:8888`).
* **Automated Redaction:** Passwords, Authorization Bearer JWTs, and API keys are automatically masked in request histories, evidence vaults, and PDF/DOCX reports (e.g. `AIzaSyD-7k...****...XyZ1`).
* **Synthetic Data Only:** Tests rely exclusively on dedicated synthetic test tenants (User A: ID 102, User B: ID 103) to eliminate data privacy exposure risks.

---
*Created for UNLOX Minor Project Assessment (August Batch) — Developed by Senior Cybersecurity Engineering Team.*

