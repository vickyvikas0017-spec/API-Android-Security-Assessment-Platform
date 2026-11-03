import React, { useEffect, useState } from 'react';
import {
  KeyRound,
  ShieldAlert,
  Play,
  Save,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { BolaTestCase } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';

export const BolaTesting: React.FC = () => {
  const [cases, setCases] = useState<BolaTestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<BolaTestCase | null>(null);

  // Form State for editing or executing BOLA case
  const [endpoint, setEndpoint] = useState('/api/users/{id}/profile');
  const [userA, setUserA] = useState('user_a_test@lab.internal (ID: 102)');
  const [userB, setUserB] = useState('user_b_test@lab.internal (ID: 103)');
  const [origId, setOrigId] = useState('102');
  const [modId, setModId] = useState('103');
  const [origResp, setOrigResp] = useState('{\n  "id": 102,\n  "name": "User A",\n  "email": "user_a@lab.internal"\n}');
  const [modResp, setModResp] = useState('{\n  "id": 103,\n  "name": "User B",\n  "email": "user_b@lab.internal",\n  "credit_balance": 450.00\n}');
  const [httpStatus, setHttpStatus] = useState(200);
  const [authResult, setAuthResult] = useState('Vulnerable');
  const [evidence, setEvidence] = useState('Replaying GET /api/users/103/profile using User A token returned HTTP 200 with User B profile.');
  const [impact, setImpact] = useState('Unauthorized cross-tenant data disclosure of customer personal records and account balances.');
  const [remediation, setRemediation] = useState('Verify that requested user ID matches the authenticated session subject ID at the repository level.');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await api.getBolaCases();
      setCases(data);
      if (data.length > 0) {
        populateForm(data[0]);
      }
    } catch (err) {
      console.error('Failed to load BOLA cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (c: BolaTestCase) => {
    setSelectedCase(c);
    setEndpoint(c.endpoint);
    setUserA(c.user_a_identifier);
    setUserB(c.user_b_test_identifier);
    setOrigId(c.original_object_id);
    setModId(c.modified_object_id);
    setOrigResp(c.original_response || '');
    setModResp(c.modified_response || '');
    setHttpStatus(c.http_status);
    setAuthResult(c.auth_result);
    setEvidence(c.evidence || '');
    setImpact(c.impact || '');
    setRemediation(c.remediation || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedCase) {
        const updated = await api.updateBolaCase(selectedCase.id, {
          endpoint,
          user_a_identifier: userA,
          user_b_test_identifier: userB,
          original_object_id: origId,
          modified_object_id: modId,
          original_response: origResp,
          modified_response: modResp,
          http_status: httpStatus,
          auth_result: authResult,
          evidence,
          impact,
          remediation
        });
        setSelectedCase(updated);
      } else {
        const created = await api.createBolaCase({
          title: 'User Profile Access BOLA Verification',
          endpoint,
          user_a_identifier: userA,
          user_b_test_identifier: userB,
          original_object_id: origId,
          modified_object_id: modId,
          original_response: origResp,
          modified_response: modResp,
          http_status: httpStatus,
          auth_result: authResult,
          evidence,
          impact,
          remediation
        });
        setSelectedCase(created);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      loadCases();
    } catch (err: any) {
      alert(`Error saving test case: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Title */}
      <div className="border-b border-gray-200 pb-4 bg-white">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Assessment Question Q4 • 10 Marks
          </span>
          <StatusBadge label={authResult} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Broken Object Level Authorization (BOLA) Scenario
        </h2>
        <p className="text-xs text-gray-600 mt-0.5">
          Controlled testing workflow for verifying authorization boundaries when substituting object identifiers between authenticated tenants.
        </p>
      </div>

      {/* Conceptual Explanation Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WhiteCard title="What is Broken Object Level Authorization (BOLA)?">
          <p className="text-xs text-gray-700 leading-relaxed">
            Broken Object Level Authorization (OWASP API1:2023), traditionally termed Insecure Direct Object Reference (IDOR),
            occurs when an API endpoint accepts an object identifier (e.g. <code>/api/users/102/profile</code>) and retrieves
            the database object without verifying whether the authenticated user possesses valid authorization to access that specific entity.
          </p>
        </WhiteCard>

        <WhiteCard title="Safe Verification Safeguards">
          <ul className="text-xs text-gray-700 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>Employ strictly synthetic test accounts (e.g., User A: ID 102, User B: ID 103).</li>
            <li>Never attempt identifier enumeration or data harvesting on production databases.</li>
            <li>Always redact real auth tokens and personal identifiable information (PII).</li>
            <li>Verify server response codes: HTTP 403 Forbidden is expected on secure servers.</li>
          </ul>
        </WhiteCard>
      </div>

      {/* BOLA Controlled Testing Workspace */}
      <WhiteCard
        title="BOLA Scenario Testing Console"
        subtitle="Controlled verification between User A and User B"
        action={
          <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
            Target: GET {endpoint}
          </span>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Identifiers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/60 p-3 rounded-lg border border-gray-200">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">User A Identifier:</label>
              <input
                type="text"
                value={userA}
                onChange={(e) => setUserA(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">User B Identifier:</label>
              <input
                type="text"
                value={userB}
                onChange={(e) => setUserB(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Original Object ID (User A):</label>
              <input
                type="text"
                value={origId}
                onChange={(e) => setOrigId(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Modified Object ID (User B):</label>
              <input
                type="text"
                value={modId}
                onChange={(e) => setModId(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono text-gray-900"
                required
              />
            </div>
          </div>

          {/* Side-by-side Response Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Baseline Response (User A Object: {origId}):
              </label>
              <textarea
                value={origResp}
                onChange={(e) => setOrigResp(e.target.value)}
                rows={6}
                className="w-full bg-white border border-gray-300 rounded p-2 font-mono text-gray-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Modified Replay Response (Swapped to Object: {modId}):
              </label>
              <textarea
                value={modResp}
                onChange={(e) => setModResp(e.target.value)}
                rows={6}
                className="w-full bg-white border border-gray-300 rounded p-2 font-mono text-gray-800"
              />
            </div>
          </div>

          {/* Result Classification & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Server HTTP Status Code:</label>
              <input
                type="number"
                value={httpStatus}
                onChange={(e) => setHttpStatus(parseInt(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Authorization Result Classification:</label>
              <select
                value={authResult}
                onChange={(e) => setAuthResult(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-semibold text-gray-900"
              >
                <option value="Vulnerable">Vulnerable (Returned User B Object)</option>
                <option value="Not Vulnerable">Not Vulnerable (Rejected with 403 Forbidden)</option>
                <option value="Inconclusive">Inconclusive (Requires Further Probing)</option>
                <option value="Not Tested">Not Tested</option>
              </select>
            </div>
          </div>

          {/* Evidence, Impact, Remediation */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Collected Verification Evidence:</label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={2}
              className="w-full bg-white border border-gray-300 rounded p-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Business Impact:</label>
              <textarea
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                rows={2}
                className="w-full bg-white border border-gray-300 rounded p-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Recommended Server-Side Fix:</label>
              <textarea
                value={remediation}
                onChange={(e) => setRemediation(e.target.value)}
                rows={2}
                className="w-full bg-white border border-gray-300 rounded p-2"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> BOLA test case documented & updated successfully!
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save BOLA Assessment Record'}
            </button>
          </div>
        </form>
      </WhiteCard>

      {/* Code Architecture Fix Box */}
      <WhiteCard title="Server-Side Defense Implementation Blueprint">
        <div className="space-y-2 text-xs text-gray-700">
          <p className="font-semibold text-gray-900">
            Recommended Controller / Repository Authorization Guard:
          </p>
          <pre className="p-3 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-800 overflow-x-auto">
{`// Server-Side Authorization Guard Pattern
@GetMapping("/api/users/{requestedId}/profile")
public ResponseEntity<?> getUserProfile(@PathVariable Long requestedId, @AuthenticationPrincipal UserSession session) {
    // 1. Mandatory Identity-to-Object Cross-Validation
    if (!session.getUserId().equals(requestedId) && !session.hasRole("ROLE_ADMIN")) {
        log.warn("BOLA attempt blocked: user {} attempted to access profile {}", session.getUserId(), requestedId);
        throw new AccessDeniedException("Access Denied: You are not authorized to view this object.");
    }

    // 2. Query scoped strictly to authorized tenant
    UserProfile profile = userRepository.findByIdAndTenant(requestedId, session.getTenantId())
        .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

    return ResponseEntity.ok(profile);
}`}
          </pre>
        </div>
      </WhiteCard>
    </div>
  );
};

