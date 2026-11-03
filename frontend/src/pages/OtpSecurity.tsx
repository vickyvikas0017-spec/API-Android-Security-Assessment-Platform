import React, { useEffect, useState } from 'react';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Save,
  Download,
  Key,
  Clock,
  RotateCcw,
  CheckSquare,
  Square
} from 'lucide-react';
import { api } from '../services/api';
import { OtpInvestigation, OtpControlReview } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';

export const OtpSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'q6' | 'q7'>('q6');
  const [investigations, setInvestigations] = useState<OtpInvestigation[]>([]);
  const [reviews, setReviews] = useState<OtpControlReview[]>([]);
  const [loading, setLoading] = useState(true);

  // New Investigation form
  const [showAddModal, setShowAddModal] = useState(false);
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [normalStep, setNormalStep] = useState('Step 5 & 6: Client submits OTP -> Server validates');
  const [suspectedWeakness, setSuspectedWeakness] = useState('Client-Side-Only OTP Validation');
  const [origReq, setOrigReq] = useState('');
  const [modReq, setModReq] = useState('');
  const [serverResp, setServerResp] = useState('');
  const [httpStatus, setHttpStatus] = useState(200);
  const [testResult, setTestResult] = useState('Vulnerable');
  const [impact, setImpact] = useState('');
  const [remediation, setRemediation] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, revData] = await Promise.all([
        api.getOtpInvestigations(),
        api.getOtpReviews()
      ]);
      setInvestigations(invData);
      setReviews(revData);
    } catch (err) {
      console.error('Failed to load OTP security data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateControlStatus = async (controlId: string, newStatus: string) => {
    try {
      await api.updateOtpReview(controlId, { status: newStatus });
      loadData();
    } catch (err: any) {
      alert(`Error updating control: ${err.message}`);
    }
  };

  const handleCreateInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createOtpInvestigation({
        scenario_title: scenarioTitle,
        normal_flow_step: normalStep,
        suspected_weakness: suspectedWeakness,
        original_request: origReq,
        modified_request: modReq,
        server_response: serverResp,
        http_status: httpStatus,
        test_result: testResult,
        security_impact: impact,
        recommended_remediation: remediation
      });
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      alert(`Error creating OTP investigation: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Assessment Questions Q6 & Q7 • 15 Marks
            </span>
            <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              OTP Authentication Security
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            OTP Bypass Investigation & Security Review
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Practical examination of OTP authentication workflows, client-side validation bypass, and 5 mandatory defense controls.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-gray-100 p-0.5 rounded border border-gray-200">
          <button
            onClick={() => setActiveTab('q6')}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${
              activeTab === 'q6' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Q6: OTP Bypass Investigation (10M)
          </button>
          <button
            onClick={() => setActiveTab('q7')}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${
              activeTab === 'q7' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Q7: OTP Security Review (5M)
          </button>
        </div>
      </div>

      {activeTab === 'q6' ? (
        <div className="space-y-6">
          {/* Normal OTP Workflow Visualization */}
          <WhiteCard
            title="Normal OTP Authentication Workflow (Baseline)"
            subtitle="Seven-stage state machine for secure multi-factor authentication"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {[
                { step: '1', title: 'Enter Credentials', desc: 'User submits primary email/password' },
                { step: '2', title: 'App Requests OTP', desc: 'Client requests OTP challenge' },
                { step: '3', title: 'Server Generates OTP', desc: 'Secure random 6-digit code created' },
                { step: '4', title: 'Delivery Out-of-Band', desc: 'OTP dispatched to email (Mailhog)' },
                { step: '5', title: 'User Submits Code', desc: 'User enters OTP into client form' },
                { step: '6', title: 'Server Validates', desc: 'Backend checks code & attempt limit' },
                { step: '7', title: 'Session Creation', desc: 'JWT session issued upon success' }
              ].map((s) => (
                <div key={s.step} className="border border-gray-200 rounded p-2.5 bg-gray-50/50 text-center">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold flex items-center justify-center mx-auto mb-1.5">
                    {s.step}
                  </span>
                  <div className="font-bold text-gray-900 text-[11px]">{s.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1 leading-tight">{s.desc}</div>
                </div>
              ))}
            </div>
          </WhiteCard>

          {/* Investigated Vulnerability Cases */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900">Documented OTP Investigation Scenarios</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              Add Scenario
            </button>
          </div>

          <div className="space-y-4">
            {investigations.map((item) => (
              <WhiteCard
                key={item.id}
                title={
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
                      {item.test_code}
                    </span>
                    <span className="text-base font-bold text-gray-900">{item.scenario_title}</span>
                  </div>
                }
                action={<StatusBadge label={item.test_result} />}
              >
                <div className="space-y-3 text-xs text-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-gray-100">
                    <div>
                      <span className="font-semibold text-gray-500">Suspected Weakness:</span>
                      <div className="mt-0.5 font-bold text-gray-900">{item.suspected_weakness}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500">Affected Workflow Stage:</span>
                      <div className="mt-0.5 text-gray-700">{item.normal_flow_step}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.original_request && (
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Baseline Request:</label>
                        <pre className="p-2.5 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-800 whitespace-pre-wrap">
                          {item.original_request}
                        </pre>
                      </div>
                    )}
                    {item.modified_request && (
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Tampered Verification Request:</label>
                        <pre className="p-2.5 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-800 whitespace-pre-wrap">
                          {item.modified_request}
                        </pre>
                      </div>
                    )}
                  </div>

                  {item.server_response && (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Server Response:</label>
                      <pre className="p-2.5 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-800 whitespace-pre-wrap">
                        {item.server_response}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <span className="font-semibold text-gray-700">Security Impact:</span>
                      <p className="text-gray-600 mt-0.5 leading-relaxed">{item.security_impact}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Recommended Remediation:</span>
                      <p className="text-emerald-800 font-medium mt-0.5 bg-emerald-50/50 p-2 rounded border border-emerald-200 leading-relaxed">
                        {item.recommended_remediation}
                      </p>
                    </div>
                  </div>
                </div>
              </WhiteCard>
            ))}
          </div>
        </div>
      ) : (
        /* Q7: OTP Security Review (5 Controls) */
        <div className="space-y-6">
          <WhiteCard
            title="Five Mandatory OTP Security Controls Review"
            subtitle="Technical checklist of required server-side defenses conforming to Assessment Question Q7"
            action={
              <span className="text-xs font-semibold text-gray-600">
                Audited: {reviews.filter((r) => r.status === 'Implemented').length} of 5 Controls Active
              </span>
            }
          >
            <div className="space-y-4">
              {reviews.map((ctrl) => (
                <div
                  key={ctrl.control_id}
                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {ctrl.control_id}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900">{ctrl.control_name}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateControlStatus(ctrl.control_id, 'Implemented')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                          ctrl.status === 'Implemented'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        ✓ Implemented
                      </button>
                      <button
                        onClick={() => handleUpdateControlStatus(ctrl.control_id, 'Not Implemented')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                          ctrl.status === 'Not Implemented'
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        ✕ Not Implemented
                      </button>
                      <button
                        onClick={() => handleUpdateControlStatus(ctrl.control_id, 'Not Verified')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                          ctrl.status === 'Not Verified'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        ? Not Verified
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-700">
                    <div>
                      <span className="font-semibold text-gray-500">Why It Is Important:</span>
                      <p className="mt-1 leading-relaxed text-gray-800">{ctrl.why_important}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-red-700">Risk If Missing:</span>
                      <p className="mt-1 leading-relaxed text-red-900 bg-red-50/50 p-2 rounded border border-red-200">
                        {ctrl.risk_if_missing}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-800">Recommended Implementation:</span>
                      <p className="mt-1 leading-relaxed text-emerald-900 bg-emerald-50/50 p-2 rounded border border-emerald-200">
                        {ctrl.recommended_implementation}
                      </p>
                    </div>
                  </div>

                  {ctrl.audit_notes && (
                    <div className="pt-2 text-xs text-gray-500 border-t border-gray-100 flex items-center justify-between">
                      <span>Audit Notes: {ctrl.audit_notes}</span>
                      <span className="font-mono text-[10px]">Standard: NIST SP 800-63B</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </WhiteCard>
        </div>
      )}

      {/* Add Investigation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-xl w-full p-5 space-y-4 my-8">
            <h3 className="font-bold text-base text-gray-900">Log OTP Investigation Finding (Q6)</h3>
            <form onSubmit={handleCreateInvestigation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Scenario Title</label>
                <input
                  type="text"
                  value={scenarioTitle}
                  onChange={(e) => setScenarioTitle(e.target.value)}
                  placeholder="e.g. OTP Verification Step Skipping via Direct Token Request"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Suspected Weakness</label>
                <select
                  value={suspectedWeakness}
                  onChange={(e) => setSuspectedWeakness(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                >
                  <option value="Client-side-only OTP validation">Client-side-only OTP validation</option>
                  <option value="OTP verification step skipping">OTP verification step skipping</option>
                  <option value="Improper server-side validation">Improper server-side validation</option>
                  <option value="OTP replay">OTP replay</option>
                  <option value="Missing expiry validation">Missing expiry validation</option>
                  <option value="Insufficient attempt restrictions">Insufficient attempt restrictions</option>
                  <option value="Improper session creation">Improper session creation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Original Request</label>
                  <textarea
                    value={origReq}
                    onChange={(e) => setOrigReq(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Modified Request</label>
                  <textarea
                    value={modReq}
                    onChange={(e) => setModReq(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Security Impact</label>
                <input
                  type="text"
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  placeholder="Account takeover without accessing user OTP inbox"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Recommended Remediation</label>
                <input
                  type="text"
                  value={remediation}
                  onChange={(e) => setRemediation(e.target.value)}
                  placeholder="Enforce mandatory server-side state token check"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-semibold"
                >
                  Save Investigation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

