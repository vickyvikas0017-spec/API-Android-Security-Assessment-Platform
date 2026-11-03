import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Layers,
  Terminal,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';

export const ProjectOverview: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetUrl, setTargetUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      if (data && data.length > 0) {
        setProject(data[0]);
        setTargetUrl(data[0].target_url);
        setDescription(data[0].description || '');
        setStatus(data[0].status);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      const updated = await api.updateProject(project.id, {
        target_url: targetUrl,
        description,
        status
      });
      setProject(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save project settings: ${err.message}`);
    }
  };

  if (loading || !project) {
    return (
      <div className="p-8 bg-white min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Title & Metadata */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Project Overview & Scope
          </span>
          <StatusBadge label={project.status} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mt-1">{project.name}</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          UNLOX Minor Project Assessment (August Batch) • Total Marks: 100 • Practical + Scenario-Based
        </p>
      </div>

      {/* Grid: Overview Information & Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scope & Curriculum Alignment */}
        <div className="lg:col-span-2 space-y-6">
          <WhiteCard title="Assessment Objectives & Scope" subtitle="Curriculum Question Mapping">
            <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
              <p>
                This platform provides an end-to-end cybersecurity audit workstation engineered specifically for the
                August Batch Minor Project Assessment. It unifies active REST API reconnaissance, multi-step attack path
                exploration, broken access control (BOLA) exploitation verification, OTP lifecycle analysis, and Dalvik
                bytecode reverse engineering using JADX into a single, cohesive interface.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="border border-gray-200 rounded p-3 bg-white space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700">
                    <Shield className="w-4 h-4" />
                    <span>Section A: API Security & crAPI (40 Marks)</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    <li>Q1: API Reconnaissance & Attack Surface (15M)</li>
                    <li>Q2: API Vulnerability Assessment & PoC (15M)</li>
                    <li>Q3: crAPI Practical Multi-Step Flow (10M)</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-white space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700">
                    <Layers className="w-4 h-4" />
                    <span>Section B: BOLA & Authorization (20 Marks)</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    <li>Q4: BOLA Scenario Safe Verification (10M)</li>
                    <li>Q5: Dual-User Authorization Matrix (10M)</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-white space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700">
                    <Terminal className="w-4 h-4" />
                    <span>Section C: OTP / Auth Bypass (15 Marks)</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    <li>Q6: OTP Bypass Investigation (10M)</li>
                    <li>Q7: OTP Authentication Security Review (5M)</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-white space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700">
                    <FileCheck className="w-4 h-4" />
                    <span>Section D & E: APK & Decision (25 Marks)</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    <li>Q8: APK Reconnaissance with JADX (10M)</li>
                    <li>Q9: APK Secret Leak Scenario (5M)</li>
                    <li>Q10: Integrated Pentester Decision (10M)</li>
                  </ul>
                </div>
              </div>
            </div>
          </WhiteCard>

          {/* Compliance & Safety Precautions */}
          <WhiteCard title="Rules of Engagement & Ethical Guardrails">
            <div className="space-y-3 text-xs text-gray-700">
              <div className="flex items-start gap-2.5 p-3 bg-blue-50/60 border border-blue-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900">Strict Authorized Lab Testing Boundary</h4>
                  <p className="mt-0.5 text-blue-800">
                    All security assessments must be performed exclusively against local Dockerized crAPI instances or
                    explicitly authorized sandbox targets. The platform strictly prohibits scanning or fuzzing external
                    production assets.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Automated Secret & PII Sanitization</h4>
                  <p className="mt-0.5 text-gray-600">
                    All Bearer tokens, private passwords, and user PII logged in request history or exported in final
                    technical reports are automatically redacted with masking (e.g. <code>eyJ...****...SflK</code>).
                  </p>
                </div>
              </div>
            </div>
          </WhiteCard>
        </div>

        {/* Right Col: Target Lab Configuration */}
        <div>
          <WhiteCard title="Target Lab Configuration" subtitle="Active Assessment Parameters">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  API Lab Base URL:
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="http://localhost:8888"
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-blue-600"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1">Default crAPI gateway port is 8888.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assessment Status:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Testing Complete">Testing Complete</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Project Description:
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Project Configuration
                </button>
                {saveSuccess && (
                  <p className="text-center text-xs text-emerald-600 font-medium mt-2">
                    Configuration saved successfully!
                  </p>
                )}
              </div>
            </form>
          </WhiteCard>
        </div>
      </div>
    </div>
  );
};

