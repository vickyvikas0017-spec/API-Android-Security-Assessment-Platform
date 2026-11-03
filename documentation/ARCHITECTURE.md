# System Architecture & Technical Design

## API & Android Security Assessment Platform

### 1. High-Level Architecture

The platform is designed following a modern decoupled client-server architecture:

```
[ Browser Client: React 18 + TypeScript + Tailwind CSS ]
                         │
                  HTTP / REST (JSON)
                         ▼
[ Application Server: Python 3.13 + FastAPI + Uvicorn ]
    ├── Core Engines
    │     ├── HTTP Live Request Engine (requests + duration + redaction)
    │     ├── Android APK & DEX Parser (ZIP + regex entropy scanner)
    │     ├── JADX CLI Subprocess Wrapper
    │     ├── crAPI / Docker Daemon Prober
    │     └── Technical Report Generator (ReportLab PDF + python-docx DOCX)
    └── Persistence Layer
          └── SQLite 3 via SQLAlchemy ORM (13 Relational Tables)
```

---

### 2. Frontend Design Principles

* **Pure White Background (#FFFFFF):** The entire application adheres to a pure white canvas (`#FFFFFF`) with subtle slate-200 borders (`#E2E8F0`), charcoal typography (`#111827`, `#1E293B`), and professional royal blue accents (`#2563EB`). Dark mode and full-screen gradients are strictly excluded.
* **Responsive Layout:** CSS Grid and Flexbox responsive layouts ensure flawless usability across desktop monitors (1920x1080), laptops (1366x768), tablets (768px), and smartphones.
* **Component-Driven:** Built using modular components (`Navbar`, `Sidebar`, `WhiteCard`, `StatusBadge`, `HttpTesterModal`) with TypeScript strict contracts.

---

### 3. Backend Core Services

#### A. HTTP Live Testing Sandbox (`http_service.py`)
* Executes real HTTP GET, POST, PUT, PATCH, DELETE requests against authorized local lab endpoints.
* Calculates precise network response duration in milliseconds.
* Automatically sanitizes sensitive HTTP request and response headers (`Authorization`, `Cookie`, `X-API-Key`).
* Redacts raw JWT bearer tokens and private keys matching regex patterns.

#### B. Android APK Static Analysis Engine (`apk_service.py`)
* Operates in dual-mode:
  1. **JADX CLI Integration:** If JADX is detected on the host system, runs `jadx -d <out> <apk>` to extract Java source code.
  2. **Native Dalvik Bytecode & Manifest Parser:** If JADX is not present in PATH, native Python extracts `classes.dex`, `AndroidManifest.xml`, and resources from the APK zip archive, scans UTF-8/ASCII byte pools, and executes high-confidence regex pattern matching for cloud credentials, API keys, and routes.
* Redacts all sensitive key previews (e.g. `AIzaSyD-7k...****...XyZ1`) to preserve confidentiality.

#### C. Report Generation Engine (`report_service.py`)
* **PDF Engine:** Uses `reportlab.platypus` with custom `NumberedCanvas` generating 23 comprehensive technical sections, styled tables, color-coded CVSS severity badges, reproduction steps, sanitized evidence, and running headers/footers with dynamic page numbering ("Page X of Y").
* **Word Engine:** Uses `python-docx` to output fully editable `.docx` deliverables matching academic and enterprise pentest formatting requirements.

---

### 4. Database Schema (SQLite + SQLAlchemy)

1. `projects`: Primary assessment project details, batch metadata, target lab URL.
2. `api_endpoints`: Catalog of mapped endpoints, HTTP methods, authentication schemes, security functions, risk flags (Q1).
3. `vulnerabilities`: Detailed vulnerability finding records, CVSS scores, reproduction steps, evidence, remediation (Q2).
4. `crapi_attack_steps`: Sequential attack flow steps, parameter modifications, behavioral deviations (Q3).
5. `bola_test_cases`: Dual-user BOLA test records (User A vs User B), object ID swaps, verification status (Q4).
6. `auth_matrix_tests`: Multi-tenant READ, MODIFY, DELETE authorization matrix (Q5).
7. `otp_investigations`: Documented OTP bypass test scenarios (client validation bypass, rate limit flaws) (Q6).
8. `otp_control_reviews`: Audit checklist for the 5 mandatory OTP controls (NIST SP 800-63B) (Q7).
9. `apk_analysis_records`: Uploaded APK metadata (package, version, SDKs, components) (Q8).
10. `apk_findings`: Decompiled code findings (Google API key, JWT mock tokens, hidden endpoints) (Q8).
11. `apk_leak_scenarios`: Structured 6-step investigation of exposed credentials and endpoints (Q9).
12. `integrated_assessment_plans`: 10-step holistic pentesting strategy and risk model (Q10).
13. `evidence`: Centralized evidence vault with file attachments, timestamps, and redaction (Evidence Manager).
14. `api_request_history`: Interactive HTTP request telemetry and response cache.

