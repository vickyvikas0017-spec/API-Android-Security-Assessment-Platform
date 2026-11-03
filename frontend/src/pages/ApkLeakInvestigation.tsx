import React, { useEffect, useState } from 'react';
import {
  SearchCode,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RotateCcw,
  ExternalLink,
  Save,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { ApkLeakScenario } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';

export const ApkLeakInvestigation: React.FC = () => {
  const [scenarios, setScenarios] = useState<ApkLeakScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<ApkLeakScenario | null>(null);

  // Form State
  const [isSensitive, setIsSensitive] = useState('Confirmed Sensitive');
  const [isPublic, setIsPublic] = useState('Secret/Confidential');
  const [isValid, setIsValid] = useState('Active/Valid (Lab Target)');
  const [permissions, setPermissions] = useState('Google Maps JavaScript & Places API Quota');
  const [impact, setImpact] = useState('Quota theft, financial billing exhaustion, and map data spoofing.');
  const [remediation, setRemediation] = useState('Revoke key, rotate affected secrets, restrict by package name SHA-1, move calls server-side.');
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const data = await api.getApkLeakScenarios();
      setScenarios(data);
      if (data.length > 0) {
        setSelectedScenario(data[0]);
        setIsSensitive(data[0].is_sensitive);
        setIsPublic(data[0].is_public_intended);
        setIsValid(data[0].is_still_valid);
        setPermissions(data[0].permissions_granted || '');
        setImpact(data[0].business_impact);
        setRemediation(data[0].developer_remediation);
      }
    } catch (err) {
      console.error('Failed to load APK leak scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScenario) return;
    try {
      const updated = await api.updateApkLeakScenario(selectedScenario.id, {
        is_sensitive: isSensitive,
        is_public_intended: isPublic,
        is_still_valid: isValid,
        permissions_granted: permissions,
        business_impact: impact,
        developer_remediation: remediation
      });
      setSelectedScenario(updated);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
      loadScenarios();
    } catch (err: any) {
      alert(`Error updating scenario: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Title */}
      <div className="border-b border-gray-200 pb-4 bg-white">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Assessment Question Q9 • 5 Marks
          </span>
          <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Hardcoded Credential & Route Leak Scenario
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          APK Leak Investigation Workflow
        </h2>
        <p className="text-xs text-gray-600 mt-0.5">
          Structured methodology for safely assessing decompiled API keys, production endpoints, and token leakage without abusing credentials.
        </p>
      </div>

      {/* Safety Guardrails Box */}
      <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-amber-800">
          <AlertTriangle className="w-4 h-4" />
          <span>Non-Destructive Investigation Rules (Mandatory Assessment Standard)</span>
        </div>
        <p className="leading-relaxed">
          • <b>Do NOT authenticate against unauthorized production infrastructure:</b> Test exclusively via offline analysis or against authorized lab simulators.<br/>
          • <b>Do NOT test credential scope by modifying or exfiltrating data:</b> Inspect public documentation, client scopes, and bundle metadata.<br/>
          • <b>Responsible Disclosure & Rotation:</b> Treat any leaked token as compromised and follow structured rotation steps immediately.
        </p>
      </div>

      {/* 6-Step Investigation Matrix */}
      {selectedScenario && (
        <WhiteCard
          title={
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
                {selectedScenario.leak_code}
              </span>
              <span>{selectedScenario.leak_title}</span>
            </div>
          }
          subtitle={`Discovered Artifact: ${selectedScenario.finding_ref} • Referenced Endpoint: ${selectedScenario.endpoint_identified}`}
          action={<StatusBadge label={selectedScenario.status} />}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* The 6 Diagnostic Questions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/60 p-4 rounded-lg border border-gray-200">
              {/* Question 1: Is it a secret? */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  1. Is the value actually a secret?
                </label>
                <select
                  value={isSensitive}
                  onChange={(e) => setIsSensitive(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                >
                  <option value="Confirmed Sensitive">Confirmed Sensitive (Private Key/Secret)</option>
                  <option value="False Positive">False Positive (Public Identifier / Hash)</option>
                  <option value="Non-Sensitive">Non-Sensitive Configuration String</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">High entropy alphanumeric string matching key patterns.</p>
              </div>

              {/* Question 2: Is it intended to be public? */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  2. Is it intended to be public?
                </label>
                <select
                  value={isPublic}
                  onChange={(e) => setIsPublic(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                >
                  <option value="Secret/Confidential">Secret / Confidential (Backend Only)</option>
                  <option value="Intended Public">Intended Public (e.g. Firebase App ID)</option>
                  <option value="Unknown">Unknown / Under Investigation</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">Backend service credentials must never exist in client APKs.</p>
              </div>

              {/* Question 3: Is it still valid? */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  3. Is it still valid? (Passive Check)
                </label>
                <select
                  value={isValid}
                  onChange={(e) => setIsValid(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                >
                  <option value="Active/Valid (Lab Target)">Active / Valid (Authorized Lab Target)</option>
                  <option value="Revoked/Expired">Revoked / Expired</option>
                  <option value="Not Verified Offline">Not Verified (Passive Audit Only)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">Verify passively without generating suspicious traffic.</p>
              </div>
            </div>

            {/* Question 4: Permissions Granted */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                4. What permissions or scopes does the credential grant?
              </label>
              <input
                type="text"
                value={permissions}
                onChange={(e) => setPermissions(e.target.value)}
                placeholder="Google Maps SDK, Places API, Geocoding Quota"
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                required
              />
            </div>

            {/* Question 5: Potential Impact */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                5. What potential business & security impact exists?
              </label>
              <textarea
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                rows={2}
                className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900"
                required
              />
            </div>

            {/* Question 6: Developer Remediation */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                6. How should the development team remediate the exposure?
              </label>
              <textarea
                value={remediation}
                onChange={(e) => setRemediation(e.target.value)}
                rows={3}
                className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 font-mono text-xs"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                {savedMsg && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Leak scenario investigation saved!
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" /> Save Leak Assessment
              </button>
            </div>
          </form>
        </WhiteCard>
      )}

      {/* Developer Remediation Checklist Card */}
      <WhiteCard title="Standardized 6-Step Remediation Playbook">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
          <div className="border border-gray-200 p-3 rounded bg-white space-y-1">
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center">1</span>
              Immediate Revocation & Rotation
            </span>
            <p className="text-gray-600">Revoke the leaked credential in Cloud Console / IAM. Generate a new key and update active environments.</p>
          </div>

          <div className="border border-gray-200 p-3 rounded bg-white space-y-1">
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center">2</span>
              Application-Level Restrictions
            </span>
            <p className="text-gray-600">Lock the key to the specific Android Package Name and SHA-1 certificate fingerprint.</p>
          </div>

          <div className="border border-gray-200 p-3 rounded bg-white space-y-1">
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center">3</span>
              Server-Side Proxy Architecture
            </span>
            <p className="text-gray-600">Move sensitive third-party API calls behind a backend proxy so client APKs never hold master keys.</p>
          </div>

          <div className="border border-gray-200 p-3 rounded bg-white space-y-1">
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center">4</span>
              ProGuard / R8 Obfuscation & CI Scanning
            </span>
            <p className="text-gray-600">Integrate Trufflehog or Gitleaks in CI/CD pipelines to prevent secret commits to APK builds.</p>
          </div>
        </div>
      </WhiteCard>
    </div>
  );
};

