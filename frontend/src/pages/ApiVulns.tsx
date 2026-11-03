import React, { useEffect, useState } from 'react';
import {
  Bug,
  Plus,
  Play,
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Edit2,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { Vulnerability, HttpTestResponse } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';

export const ApiVulns: React.FC = () => {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'findings' | 'tester'>('findings');

  // Interactive HTTP Tester State
  const [testUrl, setTestUrl] = useState('http://localhost:8888/identity/api/v2/vehicle/103/location');
  const [testMethod, setTestMethod] = useState('GET');
  const [testAuthToken, setTestAuthToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDIiLCJuYW1lIjoiVXNlciBBIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [testHeaders, setTestHeaders] = useState('{\n  "Accept": "application/json"\n}');
  const [testBody, setTestBody] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<HttpTestResponse | null>(null);

  // New Finding Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Broken Object Level Authorization');
  const [affectedEndpoint, setAffectedEndpoint] = useState('');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [description, setDescription] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [requestEvidence, setRequestEvidence] = useState('');
  const [responseEvidence, setResponseEvidence] = useState('');
  const [impact, setImpact] = useState('');
  const [severity, setSeverity] = useState('High');
  const [cvssScore, setCvssScore] = useState<number>(8.5);
  const [remediation, setRemediation] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('Verified');

  useEffect(() => {
    loadVulns();
  }, []);

  const loadVulns = async () => {
    try {
      setLoading(true);
      const data = await api.getVulnerabilities();
      setVulns(data);
    } catch (err) {
      console.error('Failed to load vulnerabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTest = async () => {
    setTesting(true);
    setTestResponse(null);
    try {
      let headersObj = {};
      try {
        if (testHeaders.trim()) headersObj = JSON.parse(testHeaders);
      } catch (e) {
        alert('Invalid JSON in headers.');
        setTesting(false);
        return;
      }

      const res = await api.executeHttpTest({
        url: testUrl,
        method: testMethod,
        headers: headersObj,
        auth_token: testAuthToken,
        body: testBody || undefined
      });
      setTestResponse(res);
    } catch (err: any) {
      alert(`Test failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSaveFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createVulnerability({
        title,
        category,
        affected_endpoint: affectedEndpoint,
        http_method: httpMethod,
        description,
        reproduction_steps: reproductionSteps,
        request_evidence: requestEvidence,
        response_evidence: responseEvidence,
        impact,
        severity,
        cvss_score: cvssScore,
        remediation,
        verification_status: verificationStatus,
        assessment_question: 'Q2'
      });
      setShowAddModal(false);
      resetModal();
      loadVulns();
    } catch (err: any) {
      alert(`Error saving vulnerability: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this vulnerability record?')) {
      try {
        await api.deleteVulnerability(id);
        loadVulns();
      } catch (err: any) {
        alert(`Error deleting: ${err.message}`);
      }
    }
  };

  const handleConvertResponseToFinding = () => {
    if (!testResponse) return;
    setAffectedEndpoint(testUrl);
    setHttpMethod(testMethod);
    setRequestEvidence(`${testMethod} ${testUrl}\nAuthorization: Bearer [REDACTED_USER_A]\n\n${testBody}`);
    setResponseEvidence(`HTTP/1.1 ${testResponse.status_code}\n${testResponse.body}`);
    setShowAddModal(true);
  };

  const resetModal = () => {
    setTitle('');
    setCategory('Broken Object Level Authorization');
    setAffectedEndpoint('');
    setHttpMethod('GET');
    setDescription('');
    setReproductionSteps('');
    setRequestEvidence('');
    setResponseEvidence('');
    setImpact('');
    setSeverity('High');
    setCvssScore(8.5);
    setRemediation('');
    setVerificationStatus('Verified');
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Assessment Question Q2 • 15 Marks
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {vulns.length} Demonstrated Vulnerabilities Documented (≥2 Required)
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">API Vulnerability Assessment</h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Practical demonstration and evidence collection for Broken Object Level Authorization (BOLA) and Excessive Data Exposure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-0.5 rounded border border-gray-200">
            <button
              onClick={() => setActiveTab('findings')}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                activeTab === 'findings' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Documented Findings ({vulns.length})
            </button>
            <button
              onClick={() => setActiveTab('tester')}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                activeTab === 'tester' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Live HTTP Workbench
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Finding
          </button>
        </div>
      </div>

      {/* Main Content Tabs */}
      {activeTab === 'findings' ? (
        <div className="space-y-6">
          {vulns.map((v) => (
            <WhiteCard
              key={v.id}
              title={
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {v.vuln_code}
                  </span>
                  <span className="text-base font-bold text-gray-900">{v.title}</span>
                </div>
              }
              action={
                <div className="flex items-center gap-2">
                  <StatusBadge label={v.severity} type="severity" />
                  {v.cvss_score && (
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-gray-100 text-gray-800 border border-gray-200">
                      CVSS {v.cvss_score}
                    </span>
                  )}
                  <StatusBadge label={v.verification_status} />
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Finding"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              }
            >
              <div className="space-y-4 text-xs text-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-gray-100">
                  <div>
                    <span className="font-semibold text-gray-500">Affected Target Endpoint:</span>
                    <div className="mt-1 font-mono text-gray-900 bg-gray-50 p-1.5 rounded border border-gray-200 font-semibold">
                      <span className="text-blue-700 mr-2">{v.http_method}</span>
                      {v.affected_endpoint}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Vulnerability Category:</span>
                    <div className="mt-1 font-medium text-gray-900 bg-gray-50 p-1.5 rounded border border-gray-200">
                      {v.category}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Vulnerability Description:</h4>
                  <p className="text-gray-600 leading-relaxed bg-white">{v.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Steps to Reproduce:</h4>
                  <pre className="p-2.5 bg-gray-50 rounded border border-gray-200 font-mono text-xs text-gray-700 whitespace-pre-wrap">
                    {v.reproduction_steps}
                  </pre>
                </div>

                {/* Evidence Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {v.request_evidence && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Request Evidence:</h4>
                      <pre className="p-2.5 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-800 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {v.request_evidence}
                      </pre>
                    </div>
                  )}

                  {v.response_evidence && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Response Evidence (Sanitized):</h4>
                      <pre className="p-2.5 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-800 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {v.response_evidence}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Security Impact:</h4>
                    <p className="text-gray-600 leading-relaxed">{v.impact}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Remediation Recommendation:</h4>
                    <p className="text-emerald-800 font-medium leading-relaxed bg-emerald-50/50 p-2 rounded border border-emerald-200">
                      {v.remediation}
                    </p>
                  </div>
                </div>
              </div>
            </WhiteCard>
          ))}
        </div>
      ) : (
        /* Live HTTP Workbench */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WhiteCard title="Request Composer" subtitle="Send live test queries against authorized crAPI endpoints">
            <div className="space-y-4 text-xs">
              <div className="flex gap-2">
                <select
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 font-bold text-gray-800"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input
                  type="text"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="http://localhost:8888/..."
                  className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 font-mono text-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Authorization Bearer Token:</label>
                <input
                  type="text"
                  value={testAuthToken}
                  onChange={(e) => setTestAuthToken(e.target.value)}
                  placeholder="Bearer JWT..."
                  className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 font-mono text-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Request Headers (JSON):</label>
                <textarea
                  value={testHeaders}
                  onChange={(e) => setTestHeaders(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded p-2 font-mono text-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Request Body (Optional):</label>
                <textarea
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  rows={4}
                  placeholder='{"vehicleId": "103"}'
                  className="w-full bg-white border border-gray-300 rounded p-2 font-mono text-gray-900"
                />
              </div>

              <button
                onClick={handleRunTest}
                disabled={testing}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                {testing ? 'Executing Query...' : 'Execute Request'}
              </button>
            </div>
          </WhiteCard>

          <WhiteCard
            title="Response Inspection"
            subtitle="Server telemetry and sanitized body output"
            action={
              testResponse && (
                <button
                  onClick={handleConvertResponseToFinding}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold hover:bg-blue-100 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Log as Finding
                </button>
              )
            }
          >
            {testResponse ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-600">Status:</span>
                    <span className="font-bold text-gray-900 font-mono">HTTP {testResponse.status_code}</span>
                  </div>
                  <div className="text-gray-500 font-mono">Duration: {testResponse.duration_ms} ms</div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Response Body:</label>
                  <pre className="p-3 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-800 max-h-72 overflow-y-auto whitespace-pre-wrap">
                    {testResponse.body}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-400 text-xs">
                Send an HTTP test request to view status, telemetry, and body.
              </div>
            )}
          </WhiteCard>
        </div>
      )}

      {/* Add Finding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-2xl w-full p-5 space-y-4 my-8">
            <h3 className="font-bold text-base text-gray-900">Document API Vulnerability Finding (Q2)</h3>
            <form onSubmit={handleSaveFinding} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Vulnerability Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken Object Level Authorization in Location API"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Vulnerability Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                  >
                    <option value="Broken Object Level Authorization">Broken Object Level Authorization (BOLA)</option>
                    <option value="Broken Function Level Authorization">Broken Function Level Authorization (BFLA)</option>
                    <option value="Excessive Data Exposure">Excessive Data Exposure</option>
                    <option value="Weak Input Validation">Weak Input Validation</option>
                    <option value="Insecure Business Logic">Insecure Business Logic</option>
                    <option value="Authentication Weaknesses">Authentication Weaknesses</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Severity & CVSS</label>
                  <div className="flex gap-2">
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-2/3 bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Informational">Informational</option>
                    </select>
                    <input
                      type="number"
                      step="0.1"
                      value={cvssScore}
                      onChange={(e) => setCvssScore(parseFloat(e.target.value))}
                      placeholder="CVSS"
                      className="w-1/3 bg-white border border-gray-300 rounded px-2 py-1.5 font-mono text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">HTTP Method</label>
                  <select
                    value={httpMethod}
                    onChange={(e) => setHttpMethod(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block font-semibold text-gray-700 mb-1">Affected Endpoint</label>
                  <input
                    type="text"
                    value={affectedEndpoint}
                    onChange={(e) => setAffectedEndpoint(e.target.value)}
                    placeholder="/identity/api/v2/vehicle/{vehicleId}/location"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reproduction Steps</label>
                <textarea
                  value={reproductionSteps}
                  onChange={(e) => setReproductionSteps(e.target.value)}
                  rows={2}
                  placeholder="1. Authenticate as User A... 2. Change parameter to User B... 3. Replay query..."
                  className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Request Evidence</label>
                  <textarea
                    value={requestEvidence}
                    onChange={(e) => setRequestEvidence(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded p-2 font-mono text-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Response Evidence</label>
                  <textarea
                    value={responseEvidence}
                    onChange={(e) => setResponseEvidence(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded p-2 font-mono text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Security Impact</label>
                <textarea
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Remediation Recommendation</label>
                <textarea
                  value={remediation}
                  onChange={(e) => setRemediation(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                >
                  Save Vulnerability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

