import React, { useEffect, useState } from 'react';
import {
  Server,
  Terminal,
  Activity,
  ArrowRight,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { CrapiAttackStep } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';

export const CrapiInvestigation: React.FC = () => {
  const [steps, setSteps] = useState<CrapiAttackStep[]>([]);
  const [statusInfo, setStatusInfo] = useState<{ docker: any; service: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // New step form
  const [stepNum, setStepNum] = useState(4);
  const [stepTitle, setStepTitle] = useState('');
  const [stepDesc, setStepDesc] = useState('');
  const [stepEndpoint, setStepEndpoint] = useState('');
  const [stepMethod, setStepMethod] = useState('GET');
  const [stepReq, setStepReq] = useState('');
  const [stepResp, setStepResp] = useState('');
  const [stepParam, setStepParam] = useState('');
  const [stepBehavior, setStepBehavior] = useState('');
  const [stepImpact, setStepImpact] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stepsData, statusData] = await Promise.all([
        api.getCrapiSteps(),
        api.getCrapiStatus()
      ]);
      setSteps(stepsData);
      setStatusInfo(statusData);
      setStepNum(stepsData.length + 1);
    } catch (err) {
      console.error('Failed to load crAPI investigation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCrapiStep({
        step_number: stepNum,
        title: stepTitle,
        description: stepDesc,
        endpoint: stepEndpoint,
        http_method: stepMethod,
        request_data: stepReq,
        response_data: stepResp,
        parameter_modified: stepParam,
        behavioral_change: stepBehavior,
        impact: stepImpact
      });
      setShowAddStepModal(false);
      loadData();
    } catch (err: any) {
      alert(`Error adding step: ${err.message}`);
    }
  };

  const copySetupCommands = () => {
    const cmds = "git clone https://github.com/OWASP/crAPI.git\ncd crAPI/deploy/docker\ndocker compose pull\ndocker compose up -d";
    navigator.clipboard.writeText(cmds);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Assessment Question Q3 • 10 Marks
            </span>
            <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              OWASP crAPI Multi-Step Attack Path
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            crAPI Practical Investigation & Attack Flow
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            End-to-end multi-request exploitation chaining demonstrating parameter tampering and behavioral deviations.
          </p>
        </div>

        <button
          onClick={() => setShowAddStepModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Add Attack Step
        </button>
      </div>

      {/* Target Container & Docker Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Docker Host Detection */}
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-blue-600" /> Host Docker Detection
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                statusInfo?.docker?.running
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {statusInfo?.docker?.running ? 'Daemon Running' : 'Daemon Standby / Offline'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {statusInfo?.docker?.message || 'Detecting Docker runtime...'}
          </p>
          <div className="mt-2 text-[11px] text-gray-500 font-mono">
            {statusInfo?.docker?.version || 'Docker CLI: Not detected on host'}
          </div>
        </div>

        {/* crAPI Gateway Connectivity */}
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" /> crAPI Gateway Reachability
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                statusInfo?.service?.reachable
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {statusInfo?.service?.reachable ? 'Reachable (HTTP 200)' : 'Lab Port 8888 (Local)'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Target Gateway: <span className="font-mono font-medium text-blue-700">http://localhost:8888</span>
          </p>
          <div className="mt-2 text-[11px] text-gray-500">
            Mailhog Inbox (OTP / Emails): <span className="font-mono text-gray-800">http://localhost:8025</span>
          </div>
        </div>
      </div>

      {/* Setup Instructions Card */}
      <WhiteCard
        title="Official OWASP crAPI Lab Setup Guide"
        subtitle="Step-by-step instructions for launching local containers"
        action={
          <button
            onClick={copySetupCommands}
            className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded flex items-center gap-1 bg-white"
          >
            {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCmd ? 'Commands Copied!' : 'Copy Commands'}
          </button>
        }
      >
        <div className="space-y-3 text-xs text-gray-700">
          <p>
            crAPI (Completely Ridiculous API) illustrates the OWASP API Security Top 10 vulnerabilities in a realistic vehicle management portal.
          </p>
          <pre className="p-3 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-800 overflow-x-auto">
            {`# 1. Clone the crAPI repository
git clone https://github.com/OWASP/crAPI.git
cd crAPI/deploy/docker

# 2. Pull and start microservices (Identity, Community, Workshop)
docker compose pull
docker compose up -d

# 3. Access web dashboard & API gateway:
# Web Portal: http://localhost:8888
# Mailhog Test Mailbox: http://localhost:8025`}
          </pre>
        </div>
      </WhiteCard>

      {/* Attack Flow Visualization */}
      <WhiteCard
        title="Multi-Step Attack Flow Visualization"
        subtitle="End-to-end chain from initial reconnaissance to full vehicle telemetry exfiltration"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {steps.map((s, idx) => (
            <div
              key={s.id}
              className="border border-blue-200 rounded-lg p-4 bg-blue-50/20 flex flex-col justify-between shadow-2xs relative"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                    STEP {s.step_number}
                  </span>
                  <StatusBadge label={s.http_method} type="method" />
                </div>
                <h4 className="font-bold text-gray-900 text-xs">{s.title}</h4>
                <div className="font-mono text-[11px] text-blue-800 bg-white p-1 rounded border border-gray-200 mt-1.5 truncate">
                  {s.endpoint}
                </div>
                <p className="text-gray-600 text-xs mt-2 leading-relaxed">{s.description}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-100 text-[11px] space-y-1">
                <div>
                  <span className="font-semibold text-gray-600">Parameter Tampered:</span>
                  <div className="font-mono text-amber-800 font-medium">{s.parameter_modified || 'None'}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Behavioral Shift:</span>
                  <div className="text-gray-700">{s.behavioral_change}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </WhiteCard>

      {/* Detailed Request & Response Evidence per Step */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-gray-900">Sanitized Attack Step Evidence Vault</h3>
        {steps.map((s) => (
          <WhiteCard
            key={s.id}
            title={
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                  STEP {s.step_number}
                </span>
                <span>{s.title}</span>
                <span className="font-mono text-xs text-blue-600">({s.http_method} {s.endpoint})</span>
              </div>
            }
          >
            <div className="space-y-3 text-xs">
              <p className="text-gray-700">{s.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {s.request_data && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Sanitized Request:</label>
                    <pre className="p-2.5 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-800 max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {s.request_data}
                    </pre>
                  </div>
                )}

                {s.response_data && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Sanitized Server Response:</label>
                    <pre className="p-2.5 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-800 max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {s.response_data}
                    </pre>
                  </div>
                )}
              </div>

              {s.impact && (
                <div className="p-2.5 bg-red-50/50 border border-red-200 rounded text-red-900 mt-2">
                  <span className="font-bold">Security Impact:</span> {s.impact}
                </div>
              )}
            </div>
          </WhiteCard>
        ))}
      </div>

      {/* Add Step Modal */}
      {showAddStepModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-xl w-full p-5 space-y-4 my-8">
            <h3 className="font-bold text-base text-gray-900">Add Attack Flow Step (Q3)</h3>
            <form onSubmit={handleCreateStep} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Step Number</label>
                  <input
                    type="number"
                    value={stepNum}
                    onChange={(e) => setStepNum(parseInt(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Step Title</label>
                  <input
                    type="text"
                    value={stepTitle}
                    onChange={(e) => setStepTitle(e.target.value)}
                    placeholder="e.g. Session Token Substitution"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Method</label>
                  <select
                    value={stepMethod}
                    onChange={(e) => setStepMethod(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block font-semibold text-gray-700 mb-1">API Endpoint</label>
                  <input
                    type="text"
                    value={stepEndpoint}
                    onChange={(e) => setStepEndpoint(e.target.value)}
                    placeholder="/identity/api/v2/..."
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={stepDesc}
                  onChange={(e) => setStepDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Parameter Modified</label>
                  <input
                    type="text"
                    value={stepParam}
                    onChange={(e) => setStepParam(e.target.value)}
                    placeholder="vehicleId changed 102 -> 103"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Behavioral Change</label>
                  <input
                    type="text"
                    value={stepBehavior}
                    onChange={(e) => setStepBehavior(e.target.value)}
                    placeholder="Server returned data for foreign tenant"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sanitized Request Data</label>
                  <textarea
                    value={stepReq}
                    onChange={(e) => setStepReq(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sanitized Response Data</label>
                  <textarea
                    value={stepResp}
                    onChange={(e) => setStepResp(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Final Impact</label>
                <input
                  type="text"
                  value={stepImpact}
                  onChange={(e) => setStepImpact(e.target.value)}
                  placeholder="Unauthorized location surveillance of customer"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStepModal(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-semibold"
                >
                  Save Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

