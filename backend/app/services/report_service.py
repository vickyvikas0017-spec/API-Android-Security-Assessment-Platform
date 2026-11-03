import os
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber > 1: # Suppress on cover page
            self.saveState()
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            # Header
            self.drawString(54, 750, "API & Android Security Assessment Platform — August Batch Minor Project")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

            # Footer
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 36, page_text)
            self.drawString(54, 36, "CONFIDENTIAL — FOR AUTHORIZED AUDIT PURPOSES ONLY")
            self.line(54, 46, 558, 46)
            self.restoreState()

def generate_pdf_report(
    output_path: Path,
    project_data: Dict[str, Any],
    endpoints: List[Any],
    vulns: List[Any],
    crapi_steps: List[Any],
    bola_cases: List[Any],
    auth_tests: List[Any],
    otp_cases: List[Any],
    otp_reviews: List[Any],
    apk_findings: List[Any],
    apk_leaks: List[Any],
    integrated_plans: List[Any],
    evidence_list: List[Any]
) -> str:
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=colors.HexColor('#1e3a8a'),
        alignment=1
    )
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor('#475569'),
        alignment=1
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=20,
        textColor=colors.HexColor('#1d4ed8'),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=6
    )
    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0f172a'),
        backColor=colors.HexColor('#f8fafc'),
        borderColor=colors.HexColor('#cbd5e1'),
        borderWidth=0.5,
        borderPadding=6,
        spaceAfter=6
    )
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1e3a8a')
    )
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#1e293b')
    )

    story = []

    # 1. COVER PAGE
    story.append(Spacer(1, 1.2 * inch))
    story.append(Paragraph("CYBERSECURITY ASSESSMENT REPORT", ParagraphStyle('CoverPre', fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=colors.HexColor('#2563eb'), alignment=1)))
    story.append(Spacer(1, 12))
    story.append(Paragraph("API & Android Security Assessment Platform", title_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Practical Cybersecurity Investigation, Vulnerability Analysis & Android APK Security Review", subtitle_style))
    story.append(Spacer(1, 24))
    story.append(HRFlowable(width="80%", thickness=2, color=colors.HexColor("#2563eb"), spaceAfter=24, spaceBefore=0))

    meta_table_data = [
        [Paragraph("<b>Assessment Batch:</b>", table_header_style), Paragraph("August Batch Minor Project Assessment (Total Marks: 100)", table_cell_style)],
        [Paragraph("<b>Target Applications:</b>", table_header_style), Paragraph("OWASP crAPI (Authorized Lab) & Android APK Client", table_cell_style)],
        [Paragraph("<b>Assessment Mode:</b>", table_header_style), Paragraph("Practical Hands-on Security Testing + Scenario-Based Evaluation", table_cell_style)],
        [Paragraph("<b>Report Classification:</b>", table_header_style), Paragraph("Confidential — Technical Audit & Proof of Concept", table_cell_style)],
        [Paragraph("<b>Date of Evaluation:</b>", table_header_style), Paragraph(datetime.now().strftime("%B %d, %Y"), table_cell_style)],
        [Paragraph("<b>Methodology:</b>", table_header_style), Paragraph("OWASP API Security Top 10 & OWASP Mobile Top 10 (MASVS)", table_cell_style)]
    ]
    meta_table = Table(meta_table_data, colWidths=[2.2 * inch, 4.3 * inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(meta_table)
    story.append(PageBreak())

    # 2. TABLE OF CONTENTS / SUMMARY
    story.append(Paragraph("TABLE OF CONTENTS", h1_style))
    toc_data = [
        ["1.", "Cover Page & Project Metadata", "1"],
        ["2.", "Project Title & Executive Summary", "2"],
        ["3.", "Abstract", "2"],
        ["4.", "Introduction", "2"],
        ["5.", "Objectives & Scope of Evaluation", "3"],
        ["6.", "Tools, Frameworks & System Architecture", "3"],
        ["7.", "Q1: API Reconnaissance & Attack Surface Mapping (15M)", "4"],
        ["8.", "Q2: API Vulnerability Assessment & Proof of Concept (15M)", "5"],
        ["9.", "Q3: crAPI Practical Multi-Step Attack Flow (10M)", "6"],
        ["10.", "Q4: Broken Object Level Authorization (BOLA) Scenario (10M)", "7"],
        ["11.", "Q5: Dual-User Authorization Matrix (10M)", "8"],
        ["12.", "Q6: OTP Bypass & Authentication Flaw Investigation (10M)", "9"],
        ["13.", "Q7: OTP Authentication Security Review (5M)", "10"],
        ["14.", "Q8: Android APK Analysis with JADX (10M)", "11"],
        ["15.", "Q9: APK Secret Leak & Endpoint Exposure Scenario (5M)", "12"],
        ["16.", "Q10: Integrated Pentester Decision-Making (10M)", "13"],
        ["17.", "Centralized Evidence & Verification Log", "14"],
        ["18.", "Vulnerability Severity Matrix & CVSS Scoring", "15"],
        ["19.", "Remediation & Defense-in-Depth Recommendations", "16"],
        ["20.", "Conclusion & Final Assessment Verdict", "17"],
        ["21.", "References & Security Standards", "17"]
    ]
    toc_table = Table([[Paragraph(c[0], table_cell_style), Paragraph(c[1], table_cell_style), Paragraph(c[2], table_cell_style)] for c in toc_data], colWidths=[0.5 * inch, 5.5 * inch, 0.8 * inch])
    toc_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#f1f5f9')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(toc_table)
    story.append(Spacer(1, 14))

    # 3. ABSTRACT & INTRODUCTION
    story.append(Paragraph("3. ABSTRACT", h1_style))
    story.append(Paragraph(
        "Modern cloud backends and mobile client ecosystems rely extensively on Representational State Transfer (REST) APIs. "
        "However, authorization logic, token lifecycle management, and mobile binary compilation frequently expose severe security weaknesses. "
        "This assessment report provides an exhaustive, practical technical audit fulfilling the UNLOX Minor Project Assessment (August Batch). "
        "Testing was conducted across the OWASP crAPI (completely ridiculous API) authorized environment and an accompanying Android APK client. "
        "Identified vulnerabilities include Broken Object Level Authorization (BOLA/IDOR), excessive data exposure, multi-step attack chaining, "
        "client-side OTP verification bypass, and hardcoded credential leaks in decompiled Dalvik bytecode.",
        body_style
    ))

    story.append(Paragraph("4. INTRODUCTION & BACKGROUND", h1_style))
    story.append(Paragraph(
        "Application Programming Interfaces (APIs) represent the primary attack surface for contemporary enterprise applications. "
        "Unlike traditional web architectures where server-side templates render sanitized views, REST APIs deliver structured raw JSON/XML objects directly "
        "to client applications, placing the burden of authorization filtering entirely on backend endpoint controllers. "
        "When developers assume that mobile applications or client frontends operate within a trusted perimeter, catastrophic flaws such as BOLA (OWASP API1:2023) "
        "and hardcoded static secrets (OWASP Mobile M1:2024) manifest.",
        body_style
    ))

    # 5. OBJECTIVES & SCOPE
    story.append(Paragraph("5. OBJECTIVES & SCOPE", h1_style))
    story.append(Paragraph(
        "<b>Primary Objectives:</b><br/>"
        "• Perform structured API reconnaissance and attack surface documentation across crAPI endpoints.<br/>"
        "• Execute proof-of-concept testing against authorization barriers (BOLA/BFLA) and input validation logic.<br/>"
        "• Dissect a realistic multi-step attack chain demonstrating parameter tampering and behavioral deviations.<br/>"
        "• Analyze OTP authentication lifecycles and safely evaluate verification bypass mechanisms.<br/>"
        "• Perform static Dalvik bytecode deconstruction using JADX and regex entropy analysis to extract exposed secrets.<br/>"
        "• Synthesize findings into an actionable pentester decision-making matrix and defense-in-depth remediation blueprint.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Scope & Authorization:</b> Testing was strictly confined to authorized local containerized lab targets (http://localhost:8888) "
        "and standalone APK binaries in compliance with educational security assessment guidelines. Zero production endpoints or live user data were accessed.",
        body_style
    ))

    # 6. TOOLS & TECHNOLOGIES
    story.append(Paragraph("6. TOOLS & SYSTEM ARCHITECTURE", h1_style))
    tools_data = [
        [Paragraph("<b>Component / Layer</b>", table_header_style), Paragraph("<b>Technology / Tool</b>", table_header_style), Paragraph("<b>Function / Role</b>", table_header_style)],
        [Paragraph("Target Lab", table_cell_style), Paragraph("OWASP crAPI (Dockerized)", table_cell_style), Paragraph("Intentionally vulnerable microservices architecture for realistic API testing", table_cell_style)],
        [Paragraph("Mobile Decompiler", table_cell_style), Paragraph("JADX v1.5+ & Built-in DEX Parser", table_cell_style), Paragraph("DEX/APK decompilation, Manifest parsing, and string extraction", table_cell_style)],
        [Paragraph("Proxy & HTTP Engine", table_cell_style), Paragraph("Burp Suite CE & Custom Python Engine", table_cell_style), Paragraph("Request interception, header manipulation, and response telemetry", table_cell_style)],
        [Paragraph("Platform UI & Backend", table_cell_style), Paragraph("React + TypeScript + FastAPI + SQLite", table_cell_style), Paragraph("Centralized audit platform, real-time evidence vault, and report generation", table_cell_style)]
    ]
    tools_table = Table(tools_data, colWidths=[1.8 * inch, 2.2 * inch, 2.7 * inch])
    tools_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(tools_table)
    story.append(PageBreak())

    # 7. Q1: API RECONNAISSANCE
    story.append(Paragraph("7. Q1: API RECONNAISSANCE & ATTACK SURFACE MAPPING (15 MARKS)", h1_style))
    story.append(Paragraph(
        "Systematic reconnaissance was conducted against the target API lab to catalog endpoints, parameters, authentication requirements, "
        "and security functions. A minimum of 8 key endpoints were mapped, with 3 high-risk endpoints flagged for deep authorization analysis.",
        body_style
    ))

    recon_headers = [Paragraph(h, table_header_style) for h in ["ID", "Method", "API Path", "Auth", "Security Function", "Deep Test"]]
    recon_rows = [recon_headers]
    for ep in endpoints[:10]:
        recon_rows.append([
            Paragraph(ep.endpoint_code or f"EP-{ep.id}", table_cell_style),
            Paragraph(f"<b>{ep.method}</b>", table_cell_style),
            Paragraph(ep.path, table_cell_style),
            Paragraph("Bearer" if ep.auth_required else "Public", table_cell_style),
            Paragraph(ep.security_function or "Data Service", table_cell_style),
            Paragraph("YES (High Risk)" if ep.deep_testing_worthy else "No", table_cell_style)
        ])
    recon_table = Table(recon_rows, colWidths=[0.8 * inch, 0.7 * inch, 2.5 * inch, 0.7 * inch, 1.3 * inch, 0.9 * inch])
    recon_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eff6ff')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(recon_table)
    story.append(Spacer(1, 10))

    # 8. Q2: API VULNERABILITY ASSESSMENT
    story.append(Paragraph("8. Q2: API VULNERABILITY ASSESSMENT & FINDINGS (15 MARKS)", h1_style))
    story.append(Paragraph(
        "Targeted testing demonstrated two high-severity API security weaknesses: Broken Object Level Authorization (BOLA) and Excessive Data Exposure.",
        body_style
    ))

    for v in vulns[:2]:
        story.append(Paragraph(f"<b>Finding {v.vuln_code}: {v.title}</b> (Severity: {v.severity} | CVSS: {v.cvss_score})", h2_style))
        vuln_details = [
            [Paragraph("<b>Affected Endpoint:</b>", table_header_style), Paragraph(f"<code>{v.http_method} {v.affected_endpoint}</code>", table_cell_style)],
            [Paragraph("<b>Category:</b>", table_header_style), Paragraph(v.category, table_cell_style)],
            [Paragraph("<b>Description:</b>", table_header_style), Paragraph(v.description, table_cell_style)],
            [Paragraph("<b>Steps to Reproduce:</b>", table_header_style), Paragraph(v.reproduction_steps, table_cell_style)],
            [Paragraph("<b>Security Impact:</b>", table_header_style), Paragraph(v.impact, table_cell_style)],
            [Paragraph("<b>Remediation:</b>", table_header_style), Paragraph(v.remediation, table_cell_style)],
        ]
        vt = Table(vuln_details, colWidths=[1.8 * inch, 4.9 * inch])
        vt.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ffffff')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#93c5fd')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(vt)
        story.append(Spacer(1, 8))

    story.append(PageBreak())

    # 9. Q3: crAPI PRACTICAL INVESTIGATION
    story.append(Paragraph("9. Q3: crAPI PRACTICAL INVESTIGATION & ATTACK FLOW (10 MARKS)", h1_style))
    story.append(Paragraph(
        "The crAPI attack chain demonstrates a compound privilege escalation scenario involving multi-step request chaining. "
        "The tester manipulates vehicle identifiers to extract sensitive mechanic contact records and unmask private tracking telemetry.",
        body_style
    ))
    for s in crapi_steps:
        story.append(Paragraph(f"<b>Step {s.step_number}: {s.title}</b> — <code>{s.http_method} {s.endpoint}</code>", h2_style))
        story.append(Paragraph(f"<b>Description:</b> {s.description}", body_style))
        story.append(Paragraph(f"<b>Parameter Modified:</b> <code>{s.parameter_modified or 'None'}</code>", body_style))
        story.append(Paragraph(f"<b>Behavioral Change:</b> {s.behavioral_change or 'Application returned unexpected sensitive data'}", body_style))
        if s.request_data:
            story.append(Paragraph(f"<b>Sanitized Request Data:</b><br/>{s.request_data}", code_style))
        if s.response_data:
            story.append(Paragraph(f"<b>Sanitized Server Response:</b><br/>{s.response_data}", code_style))
        story.append(Spacer(1, 4))

    # 10. Q4: BOLA SCENARIO
    story.append(Paragraph("10. Q4: BROKEN OBJECT LEVEL AUTHORIZATION (BOLA) SCENARIO (10 MARKS)", h1_style))
    story.append(Paragraph(
        "<b>Scenario Analysis:</b> A tester authenticated as User A observes the profile request <code>GET /api/users/102/profile</code>. "
        "Upon modifying the numerical object identifier in the URI path to <code>103</code> (User B), the application server fails to cross-validate "
        "the subject identity in the JWT session token against the requested object ID in the database.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Safe Verification Methodology:</b><br/>"
        "1. Provision two dedicated synthetic test accounts (User A: ID 102, User B: ID 103).<br/>"
        "2. Record baseline profile response for User A with valid Bearer token.<br/>"
        "3. Send replay request replacing ID 102 with 103 while preserving User A's token.<br/>"
        "4. Confirm BOLA: HTTP 200 returned with User B's email, VIN, and phone instead of HTTP 403 Forbidden.<br/>"
        "5. Avoid accessing production accounts or harvesting bulk identifiers.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Recommended Server-Side Fix:</b><br/>"
        "Implement mandatory object-level authorization checks at the repository layer:<br/>"
        "<code>if (requestedUser.getId() != authenticatedSession.getUserId() && !currentUser.hasAdminRole()) { throw new AccessDeniedException(\"Forbidden\"); }</code>",
        code_style
    ))

    # 11. Q5: AUTHORIZATION TESTING MATRIX
    story.append(Paragraph("11. Q5: DUAL-USER AUTHORIZATION TESTING MATRIX (10 MARKS)", h1_style))
    story.append(Paragraph(
        "To rigorously distinguish authentication (identity verification) from authorization (permission verification), a cross-account "
        "privilege matrix was executed between User A (Standard Privilege) and User B (Standard Privilege).",
        body_style
    ))

    auth_headers = [Paragraph(h, table_header_style) for h in ["Test", "User", "Target Object", "Operation", "Expected", "Actual", "Result"]]
    auth_rows = [auth_headers]
    for row in auth_tests:
        is_vuln = row.actual_result == "Allowed" and row.expected_result == "Denied"
        auth_rows.append([
            Paragraph(row.test_code, table_cell_style),
            Paragraph(row.user_label, table_cell_style),
            Paragraph(row.target_object, table_cell_style),
            Paragraph(row.operation, table_cell_style),
            Paragraph(row.expected_result, table_cell_style),
            Paragraph(row.actual_result, table_cell_style),
            Paragraph("<font color='red'><b>VULNERABLE</b></font>" if is_vuln else "<font color='green'>SECURE</font>", table_cell_style)
        ])
    auth_table = Table(auth_rows, colWidths=[0.6 * inch, 0.9 * inch, 1.8 * inch, 0.8 * inch, 0.9 * inch, 0.9 * inch, 1.0 * inch])
    auth_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eff6ff')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(auth_table)
    story.append(PageBreak())

    # 12. Q6: OTP BYPASS INVESTIGATION
    story.append(Paragraph("12. Q6: OTP BYPASS INVESTIGATION (10 MARKS)", h1_style))
    story.append(Paragraph(
        "<b>Normal OTP Authentication Lifecycle:</b><br/>"
        "1. User submits registered primary credentials (email/password).<br/>"
        "2. Backend generates cryptographically secure 6-digit OTP, salts/hashes value, and stores with a 5-minute TTL.<br/>"
        "3. OTP delivered via out-of-band test channel (e.g., Mailhog lab port 8025).<br/>"
        "4. Client submits OTP.<br/>"
        "5. Backend evaluates attempt limits, matches token, invalidates OTP, and issues session JWT.<br/><br/>"
        "<b>Investigation of Suspected Weaknesses:</b><br/>"
        "• <i>Client-Side Validation Only:</i> Interception showed client receiving JSON with <code>{\"otp\": \"4921\", \"status\": \"PENDING\"}</code>, validating locally before sending simple boolean flag.<br/>"
        "• <i>Step Skipping:</i> Directly calling the password reset finalize endpoint without an OTP verification token was tested.<br/>"
        "• <i>Missing Rate Limiting:</i> The endpoint lacked IP or account throttle limits, permitting unlimited brute-force attempts.",
        body_style
    ))

    # 13. Q7: OTP SECURITY REVIEW
    story.append(Paragraph("13. Q7: OTP AUTHENTICATION SECURITY REVIEW (5 MARKS)", h1_style))
    otp_headers = [Paragraph(h, table_header_style) for h in ["Control ID", "Security Control", "Status", "Risk if Missing", "Implementation Recommendation"]]
    otp_rows = [otp_headers]
    for c in otp_reviews:
        otp_rows.append([
            Paragraph(c.control_id, table_cell_style),
            Paragraph(f"<b>{c.control_name}</b>", table_cell_style),
            Paragraph(f"<b>{c.status}</b>", table_cell_style),
            Paragraph(c.risk_if_missing[:80] + "...", table_cell_style),
            Paragraph(c.recommended_implementation[:90] + "...", table_cell_style)
        ])
    ot = Table(otp_rows, colWidths=[0.8 * inch, 1.5 * inch, 0.9 * inch, 1.8 * inch, 1.9 * inch])
    ot.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eff6ff')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(ot)
    story.append(Spacer(1, 10))

    # 14. Q8: ANDROID APK ANALYSIS
    story.append(Paragraph("14. Q8: ANDROID APK ANALYSIS WITH JADX (10 MARKS)", h1_style))
    story.append(Paragraph(
        "Static decompilation of the authorized client APK using JADX revealed embedded API endpoints, third-party cloud service keys, "
        "and client authentication logic flags.",
        body_style
    ))

    apk_headers = [Paragraph(h, table_header_style) for h in ["Finding", "Location / Class", "Sensitivity", "Redacted Value Preview", "Recommended Action"]]
    apk_rows = [apk_headers]
    for af in apk_findings[:8]:
        apk_rows.append([
            Paragraph(af.finding_type, table_cell_style),
            Paragraph(af.location_class, table_cell_style),
            Paragraph(af.sensitivity, table_cell_style),
            Paragraph(af.value_preview, table_cell_style),
            Paragraph(af.recommended_action[:75] + "...", table_cell_style)
        ])
    at = Table(apk_rows, colWidths=[1.2 * inch, 1.6 * inch, 0.8 * inch, 1.6 * inch, 1.7 * inch])
    at.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eff6ff')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(at)
    story.append(PageBreak())

    # 15. Q9: APK LEAK SCENARIO
    story.append(Paragraph("15. Q9: APK SECRET LEAK & ENDPOINT EXPOSURE SCENARIO (5 MARKS)", h1_style))
    story.append(Paragraph(
        "<b>Scenario Analysis:</b> A decompiled APK exposes a production API endpoint <code>https://api.crapi-corp.internal/v2/orders</code> "
        "and an embedded API token <code>AIzaSyD-7k...****</code>.<br/><br/>"
        "<b>Controlled Verification Workflow (Non-Destructive):</b><br/>"
        "1. <i>Classification:</i> Examine whether the key is intended to be public (e.g., standard Google Maps Android Client Key) or an administrative service account secret.<br/>"
        "2. <i>Passive Verification:</i> Inspect associated metadata, scopes, and HTTP headers without executing write/delete commands against production assets.<br/>"
        "3. <i>Impact Analysis:</i> Potential quota theft, unauthorized database query execution, or server-side billing abuse.<br/>"
        "4. <i>Developer Remediation:</i> Immediately rotate the compromised credential in Google Cloud Console / AWS IAM, restrict usage by Android SHA-1 fingerprint, and migrate all sensitive queries to a backend proxy.",
        body_style
    ))

    # 16. Q10: INTEGRATED PENTESTER DECISION-MAKING
    story.append(Paragraph("16. Q10: INTEGRATED PENTESTER DECISION-MAKING (10 MARKS)", h1_style))
    story.append(Paragraph(
        "<b>Multi-Vulnerability Scenario:</b> An authorized mobile APK contains a hidden API endpoint, an object ID parameter, "
        "a suspected BOLA vulnerability, and an OTP verification flow with suspicious client-side logic.<br/><br/>"
        "<b>Professional 10-Step Investigation Sequence:</b><br/>"
        "1. <b>APK Decompilation:</b> Extract APK contents using JADX; parse AndroidManifest and DEX string pools.<br/>"
        "2. <b>Endpoint Extraction:</b> Identify unadvertised internal API routes (e.g., <code>/identity/api/v2/vehicle/{id}/location</code>).<br/>"
        "3. <b>Parameter Mapping:</b> Document URL parameters and JSON body fields (e.g., <code>vehicleId</code>, <code>userId</code>).<br/>"
        "4. <b>Auth Analysis:</b> Determine token requirements (Bearer JWT, API keys, or unauthenticated).<br/>"
        "5. <b>BOLA Verification:</b> Employ synthetic User A and User B accounts to test cross-tenant object access safely.<br/>"
        "6. <b>OTP Workflow Testing:</b> Intercept OTP submission in Burp Suite to test step-skipping and parameter tampering.<br/>"
        "7. <b>Evidence Redaction:</b> Capture HTTP request/response transcripts; redact all live auth tokens and PII.<br/>"
        "8. <b>Business Impact Modeling:</b> Quantify financial, operational, and data-privacy exposure (GDPR/HIPAA).<br/>"
        "9. <b>Severity Assignment:</b> Calculate CVSS 3.1 base metrics (BOLA: High 8.5; OTP Client Logic: High 7.5).<br/>"
        "10. <b>Final Reporting:</b> Publish structured remediation roadmap for executive and engineering stakeholders.",
        body_style
    ))

    # 17. EVIDENCE LOG
    story.append(Paragraph("17. CENTRALIZED EVIDENCE LOG", h1_style))
    ev_headers = [Paragraph(h, table_header_style) for h in ["Evidence ID", "Title", "Assessment Question", "Category", "File Type", "Date Collected"]]
    ev_rows = [ev_headers]
    for ev in evidence_list[:6]:
        ev_rows.append([
            Paragraph(ev.evidence_id, table_cell_style),
            Paragraph(ev.title, table_cell_style),
            Paragraph(ev.related_question, table_cell_style),
            Paragraph(ev.vulnerability_category or "Reconnaissance", table_cell_style),
            Paragraph(ev.file_type, table_cell_style),
            Paragraph(ev.date_collected.strftime("%Y-%m-%d"), table_cell_style)
        ])
    et = Table(ev_rows, colWidths=[1.1 * inch, 2.0 * inch, 0.9 * inch, 1.4 * inch, 0.7 * inch, 0.8 * inch])
    et.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eff6ff')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(et)
    story.append(Spacer(1, 14))

    # 18. REMEDIATION & CONCLUSION
    story.append(Paragraph("18. REMEDIATION RECOMMENDATIONS", h1_style))
    story.append(Paragraph(
        "1. <b>Zero-Trust Object Level Authorization:</b> Enforce server-side user-to-object ownership validation on every data access query.<br/>"
        "2. <b>Server-Side OTP Verification:</b> Invalidate OTP upon initial verification; issue session JWT strictly from the backend server.<br/>"
        "3. <b>Credential Rotation & Secret Management:</b> Revoke hardcoded Google API and AWS keys; inject secrets at runtime via cloud KMS.<br/>"
        "4. <b>Mobile Code Obfuscation & R8:</b> Enable ProGuard/R8 with string encryption to deter trivial decompilation of internal routes.",
        body_style
    ))

    story.append(Paragraph("19. CONCLUSION", h1_style))
    story.append(Paragraph(
        "This assessment confirms that client-side assumptions represent severe vulnerabilities in API and Android applications. "
        "Implementing defense-in-depth authorization, server-side state enforcement, and strict secret hygiene will decisively mitigate the observed attack paths.",
        body_style
    ))

    story.append(Paragraph("20. REFERENCES", h1_style))
    story.append(Paragraph(
        "• OWASP API Security Top 10 (2023) — API1: Broken Object Level Authorization<br/>"
        "• OWASP Mobile Application Security Verification Standard (MASVS v2.0)<br/>"
        "• OWASP crAPI Project Documentation & Vulnerability Lab Specifications<br/>"
        "• NIST Special Publication 800-63B — Digital Identity Guidelines: Authentication Lifecycle",
        body_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    return str(output_path)

def generate_docx_report(
    output_path: Path,
    project_data: Dict[str, Any],
    endpoints: List[Any],
    vulns: List[Any],
    crapi_steps: List[Any],
    bola_cases: List[Any],
    auth_tests: List[Any],
    otp_cases: List[Any],
    otp_reviews: List[Any],
    apk_findings: List[Any],
    apk_leaks: List[Any],
    integrated_plans: List[Any],
    evidence_list: List[Any]
) -> str:
    doc = docx.Document()

    # Document Title
    title = doc.add_paragraph()
    title_run = title.add_run("API & Android Security Assessment Report")
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(30, 58, 138)

    sub = doc.add_paragraph("August Batch Minor Project Assessment — Technical Audit & Documentation")
    sub.runs[0].font.size = Pt(13)
    sub.runs[0].font.italic = True

    doc.add_paragraph(f"Evaluation Date: {datetime.now().strftime('%B %d, %Y')}")
    doc.add_paragraph("Classification: CONFIDENTIAL — AUTHORIZED AUDIT USE ONLY")
    doc.add_heading("1. Executive Summary & Abstract", level=1)
    doc.add_paragraph(
        "This technical cybersecurity assessment was executed to evaluate the security posture of modern REST APIs "
        "and mobile Android applications. Testing was performed against the OWASP crAPI lab environment and a decompiled Android client APK. "
        "Key vulnerability areas investigated include Broken Object Level Authorization (BOLA), client-side OTP verification bypass, "
        "excessive data exposure, and exposed credentials in Dalvik bytecode."
    )

    doc.add_heading("2. Q1: API Reconnaissance & Attack Surface Mapping", level=1)
    t = doc.add_table(rows=1, cols=5)
    t.style = 'Table Grid'
    hdr_cells = t.rows[0].cells
    hdr_cells[0].text = "Endpoint ID"
    hdr_cells[1].text = "Method"
    hdr_cells[2].text = "API Path"
    hdr_cells[3].text = "Auth"
    hdr_cells[4].text = "Deep Test Worthy"
    for ep in endpoints:
        row = t.add_row().cells
        row[0].text = ep.endpoint_code or f"EP-{ep.id}"
        row[1].text = ep.method
        row[2].text = ep.path
        row[3].text = "Bearer Token" if ep.auth_required else "Public"
        row[4].text = "YES" if ep.deep_testing_worthy else "No"

    doc.add_heading("3. Q2: Demonstrated Vulnerabilities", level=1)
    for v in vulns:
        doc.add_heading(f"{v.vuln_code}: {v.title} ({v.severity})", level=2)
        doc.add_paragraph(f"Affected Endpoint: {v.http_method} {v.affected_endpoint}")
        doc.add_paragraph(f"Category: {v.category}")
        doc.add_paragraph(f"Description: {v.description}")
        doc.add_paragraph(f"Reproduction: {v.reproduction_steps}")
        doc.add_paragraph(f"Remediation: {v.remediation}")

    doc.add_heading("4. Q3: crAPI Practical Attack Flow", level=1)
    for s in crapi_steps:
        doc.add_paragraph(f"Step {s.step_number}: {s.title} ({s.http_method} {s.endpoint})")
        doc.add_paragraph(f"Description: {s.description}")
        doc.add_paragraph(f"Parameter Modified: {s.parameter_modified}")

    doc.add_heading("5. Q4 & Q5: BOLA & Authorization Matrix", level=1)
    doc.add_paragraph("Dual-user testing confirmed that changing object IDs enables cross-tenant data access without proper server-side ownership validation.")

    doc.add_heading("6. Q6 & Q7: OTP Security & Review", level=1)
    doc.add_paragraph("Evaluated 5 mandatory security controls: Server-side validation, Expiry, Rate limiting, Replay protection, and Session tokens.")

    doc.add_heading("7. Q8 & Q9: Android APK Analysis & Secret Leaks", level=1)
    for af in apk_findings[:5]:
        doc.add_paragraph(f"Finding: {af.finding_type} in {af.location_class} (Sensitivity: {af.sensitivity}) - Preview: {af.value_preview}")

    doc.add_heading("8. Q10: Integrated Pentester Decision-Making", level=1)
    doc.add_paragraph("Outlined the professional 10-step investigation workflow from static APK decompilation to severity assignment.")

    doc.save(str(output_path))
    return str(output_path)

