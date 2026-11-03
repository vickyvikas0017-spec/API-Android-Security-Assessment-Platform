import React, { useEffect, useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  AlertTriangle,
  Save,
  CheckSquare,
  Square
} from 'lucide-react';
import { api } from '../services/api';
import { IntegratedAssessmentPlan } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';

export const IntegratedAssessment: React.FC = () => {
  const [plan, setPlan] = useState<IntegratedAssessmentPlan | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskSummary, setRiskSummary] = useState('');
  const [precautions, setPrecautions] = useState('');
  const [remediationSummary, setRemediationSummary] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const data = await api.getIntegratedPlan();
      if (data) {
        setPlan(data);
        setRiskSummary(data.risk_summary || '');
        setPrecautions(data.data_protection_precautions || '');
        setRemediationSummary(data.remediation_summary || '');
        try {
          const parsed = JSON.parse(data.steps_json);
          setSteps(parsed);
        } catch (e) {
          console.error('Error parsing steps JSON:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load integrated plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStep = (stepNumber: number) => {
    const updated = steps.map((s) => {
      if (s.step === stepNumber) {
        return {
          ...s,
          status: s.status === 'Completed' ? 'In Progress' : 'Completed'
        };
      }
      return s;
    });
    setSteps(updated);
  };

  const handleSavePlan = async () => {
    if (!plan) return;
    try {
      await api.updateIntegratedPlan({
        title: plan.title,
        scope_description: plan.scope_description,
        steps_json: JSON.stringify(steps),
        status: plan.status,
        risk_summary: riskSummary,
        data_protection_precautions: precautions,
        remediation_summary: remediationSummary
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err: any) {
      alert(`Error saving plan: ${err.message}`);
    }
  };

  if (loading || !plan) {
    return (
      <div className="p-8 bg-white min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const completedStepsCount = steps.filter((s) => s.status === 'Completed').length;

  return (
    <div className="space-y-6 bg-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Assessment Question Q10 • 10 Marks
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {completedStepsCount} of 10 Methodology Steps Completed
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Integrated Pentester Decision-Making & Strategy
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Holistic assessment sequence connecting APK decompilation, hidden routes, BOLA parameter tampering, and client-side OTP validation.
          </p>
        </div>

        <button
          onClick={handleSavePlan}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          {savedMsg ? 'Saved Plan!' : 'Save Progress'}
        </button>
      </div>

      {/* Target Scenario Box */}
      <WhiteCard title="Target Assessment Scenario Blueprint">
        <div className="p-3.5 bg-blue-50/40 border border-blue-200 rounded-lg text-xs text-blue-950 space-y-2 leading-relaxed">
          <p className="font-semibold text-blue-900">
            Compound Threat Landscape Evaluated:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
            <div className="bg-white p-2 rounded border border-blue-200">1. Hidden Vehicle Route in APK</div>
            <div className="bg-white p-2 rounded border border-blue-200">2. Object ID Parameter in URI</div>
            <div className="bg-white p-2 rounded border border-blue-200">3. BOLA / IDOR Cross-Tenant Access</div>
            <div className="bg-white p-2 rounded border border-blue-200">4. Suspicious Client-Side OTP Gate</div>
          </div>
        </div>
      </WhiteCard>

      {/* 10-Step Investigation Sequence */}
      <WhiteCard
        title="Recommended 10-Step Pentesting Workflow"
        subtitle="Ordered execution sequence maximizing evidentiary integrity while avoiding unnecessary data exposure"
      >
        <div className="space-y-3">
          {steps.map((s) => {
            const isDone = s.status === 'Completed';
            return (
              <div
                key={s.step}
                onClick={() => handleToggleStep(s.step)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isDone
                    ? 'bg-white border-emerald-200 hover:border-emerald-300'
                    : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isDone ? '✓' : s.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      STEP {s.step}: {s.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{s.notes}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </WhiteCard>

      {/* Precautions & Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WhiteCard title="Data Protection Precautions" subtitle="Synthetic Account Boundary">
          <textarea
            value={precautions}
            onChange={(e) => setPrecautions(e.target.value)}
            rows={4}
            className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-900 leading-relaxed focus:outline-none focus:border-blue-600"
          />
        </WhiteCard>

        <WhiteCard title="Risk & Business Impact Modeling" subtitle="CVSS & Financial Exposure">
          <textarea
            value={riskSummary}
            onChange={(e) => setRiskSummary(e.target.value)}
            rows={4}
            className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-900 leading-relaxed focus:outline-none focus:border-blue-600"
          />
        </WhiteCard>

        <WhiteCard title="Remediation Strategy" subtitle="Holistic Engineering Blueprint">
          <textarea
            value={remediationSummary}
            onChange={(e) => setRemediationSummary(e.target.value)}
            rows={4}
            className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-900 leading-relaxed focus:outline-none focus:border-blue-600"
          />
        </WhiteCard>
      </div>
    </div>
  );
};

