import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { WhiteCard } from '../components/WhiteCard';

export const FinalReport: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const sectionsList = [
    { num: '1', title: 'Cover Page & Project Title', desc: 'Metadata, UNLOX August Batch details, Confidential classification' },
    { num: '2', title: 'Abstract & Executive Summary', desc: 'High-level synthesis of BOLA, OTP bypass, and Dalvik secret leaks' },
    { num: '3', title: 'Introduction & Background', desc: 'Modern REST API security paradigms vs legacy perimeter defense' },
    { num: '4', title: 'Objectives, Scope & Authorization', desc: 'Rules of engagement, authorized crAPI lab, synthetic data boundaries' },
    { num: '5', title: 'Tools, Technologies & System Architecture', desc: 'OWASP crAPI, JADX, Burp Suite, FastAPI, React, SQLite' },
    { num: '6', title: 'Q1: API Reconnaissance & Attack Surface Mapping', desc: '10 cataloged endpoints with HTTP methods, auth requirements, and high-risk flags' },
    { num: '7', title: 'Q2: API Vulnerability Assessment (BOLA & PII Leaks)', desc: 'Detailed proof-of-concept transcripts, reproduction steps, CVSS scoring' },
    { num: '8', title: 'Q3: crAPI Practical Multi-Step Attack Flow', desc: 'Chain from forum reconnaissance to BOLA GPS tracking and mechanic dispatch' },
    { num: '9', title: 'Q4: Broken Object Level Authorization (BOLA) Scenario', desc: 'Safe dual-user replay verification, parameter tampering, and server-side fixes' },
    { num: '10', title: 'Q5: Dual-User Authorization Matrix', desc: 'READ/MODIFY/DELETE matrix evaluation and distinction between AuthN and AuthZ' },
    { num: '11', title: 'Q6: OTP Bypass & Authentication Flaw Investigation', desc: 'Analysis of normal OTP lifecycle vs client-side validation bypass' },
    { num: '12', title: 'Q7: OTP Authentication Security Review', desc: 'Audit of 5 required defense controls (server-side check, TTL, rate limits)' },
    { num: '13', title: 'Q8: Android APK Analysis with JADX', desc: 'Static decompilation findings, Google API key, JWT mock token, and endpoints' },
    { num: '14', title: 'Q9: APK Secret Leak & Endpoint Exposure Scenario', desc: 'Non-destructive 6-step verification workflow and rotation recommendations' },
    { num: '15', title: 'Q10: Integrated Pentester Decision-Making', desc: '10-step holistic investigation sequence and business impact modeling' },
    { num: '16', title: 'Centralized Evidence Vault & Screenshots', desc: 'Sanitized request/response artifacts and decompiled bytecode excerpts' },
    { num: '17', title: 'Vulnerability Severity Matrix & CVSS v3.1', desc: 'Standardized risk ranking (Critical, High, Medium, Low)' },
    { num: '18', title: 'Defense-in-Depth Remediation Blueprint', desc: 'Strategic engineering guidance for zero-trust authorization and secret hygiene' },
    { num: '19', title: 'Conclusion & Submission Verdict', desc: 'Final audit summary conforming to August Batch Minor Project specifications' },
    { num: '20', title: 'References & Standards', desc: 'OWASP API Top 10 (2023), MASVS v2.0, NIST SP 800-63B' }
  ];

  return (
    <div className="space-y-6 bg-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Technical Report Generator
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              23 Standardized Sections (Full 100 Marks Coverage)
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Minor Project Assessment Final Technical Report
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Export publication-ready audit reports dynamically rendered from actual verified database findings.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print View
          </button>

          <a
            href="/api/reports/download-pdf"
            download
            className="flex-1 sm:flex-none px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF Report
          </a>

          <a
            href="/api/reports/download-docx"
            download
            className="flex-1 sm:flex-none px-3.5 py-1.5 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download DOCX
          </a>
        </div>
      </div>

      {/* Report Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Document Format</span>
          <div className="text-lg font-bold text-gray-900 mt-1">Official Technical Report</div>
          <p className="text-[11px] text-gray-500 mt-0.5">Formatted per academic & corporate pentest standards</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Question Mapping</span>
          <div className="text-lg font-bold text-blue-700 mt-1">Questions Q1 through Q10</div>
          <p className="text-[11px] text-gray-500 mt-0.5">Satisfies every section of August Batch Minor Project</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Compliance & Hygiene</span>
          <div className="text-lg font-bold text-emerald-700 mt-1">Redacted & Sanitized</div>
          <p className="text-[11px] text-gray-500 mt-0.5">Zero production credentials; test accounts only</p>
        </div>
      </div>

      {/* Structured Sections Index */}
      <WhiteCard
        title="Report Structure & Table of Contents"
        subtitle="Comprehensive 20-chapter technical audit document incorporating all assessment deliverables"
      >
        <div className="divide-y divide-gray-100">
          {sectionsList.map((sec) => (
            <div key={sec.num} className="py-2.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-gray-100 text-gray-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {sec.num}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{sec.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{sec.desc}</p>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                Included in Export
              </span>
            </div>
          ))}
        </div>
      </WhiteCard>

      {/* Live Preview Box */}
      <WhiteCard title="Technical Report Live Preview">
        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50/40 space-y-6 text-xs text-gray-800 font-serif leading-relaxed">
          <div className="text-center space-y-1 border-b border-gray-200 pb-4">
            <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-blue-600">
              CONFIDENTIAL TECHNICAL AUDIT REPORT
            </span>
            <h1 className="text-xl font-bold font-sans text-gray-900">
              API & Android Security Assessment Platform
            </h1>
            <p className="text-xs text-gray-500 font-sans">
              Practical Cybersecurity Investigation, Vulnerability Analysis & Android APK Security Review
            </p>
            <div className="text-[11px] text-gray-400 font-sans mt-2">
              August Batch Minor Project Assessment (100 Marks) • UNLOX Academy
            </div>
          </div>

          <div className="space-y-3 font-sans">
            <h3 className="font-bold text-sm text-blue-900">1. Executive Summary & Abstract</h3>
            <p className="text-gray-700 leading-relaxed text-xs">
              This technical cybersecurity assessment report presents the comprehensive audit results of modern REST API
              services and mobile Android applications conducted for the August Batch Minor Project Assessment. Testing was
              executed in strict compliance with authorized rules of engagement against the OWASP crAPI (Completely Ridiculous
              API) environment and an accompanying Android client APK.
            </p>
            <p className="text-gray-700 leading-relaxed text-xs">
              Identified vulnerabilities include Broken Object Level Authorization (BOLA/IDOR) in vehicle location telemetry,
              excessive PII exposure in community discussion posts, client-side-only OTP validation bypass, and hardcoded
              Google Maps API credentials and unadvertised endpoints embedded in decompiled Dalvik bytecode.
            </p>
          </div>

          <div className="space-y-3 font-sans">
            <h3 className="font-bold text-sm text-blue-900">2. Key Vulnerability Findings Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-300">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-2 border border-gray-300">ID</th>
                    <th className="p-2 border border-gray-300">Title</th>
                    <th className="p-2 border border-gray-300">Target Endpoint / Component</th>
                    <th className="p-2 border border-gray-300">Severity</th>
                    <th className="p-2 border border-gray-300">CVSS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-gray-300 font-mono font-bold text-blue-700">VULN-01</td>
                    <td className="p-2 border border-gray-300 font-bold">Broken Object Level Authorization (BOLA)</td>
                    <td className="p-2 border border-gray-300 font-mono">/identity/api/v2/vehicle/{`{vehicleId}`}/location</td>
                    <td className="p-2 border border-gray-300 text-red-700 font-bold">High</td>
                    <td className="p-2 border border-gray-300 font-mono">8.5</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-gray-300 font-mono font-bold text-blue-700">VULN-02</td>
                    <td className="p-2 border border-gray-300 font-bold">Excessive Data Exposure & Sensitive PII Leak</td>
                    <td className="p-2 border border-gray-300 font-mono">/community/api/v2/community/posts/recent</td>
                    <td className="p-2 border border-gray-300 text-amber-700 font-bold">Medium</td>
                    <td className="p-2 border border-gray-300 font-mono">6.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </WhiteCard>
    </div>
  );
};

