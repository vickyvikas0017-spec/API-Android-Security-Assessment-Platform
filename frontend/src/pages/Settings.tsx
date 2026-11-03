import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Terminal,
  Database,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { WhiteCard } from '../components/WhiteCard';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyJadxInstructions = () => {
    if (settings?.jadx_status?.instructions) {
      navigator.clipboard.writeText(settings.jadx_status.instructions);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-8 bg-white min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Title */}
      <div className="border-b border-gray-200 pb-4 bg-white">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            System Configuration
          </span>
          <span className="text-xs text-gray-500 font-medium">Platform Health & Lab Telemetry</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Settings & Tool Diagnostics
        </h2>
        <p className="text-xs text-gray-600 mt-0.5">
          Configuration of local analysis utilities, Docker daemon bindings, JADX toolchain, and secret redaction policies.
        </p>
      </div>

      {/* Grid: Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Docker & Container Status */}
        <WhiteCard
          title={
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Docker & Containerization Engine</span>
            </div>
          }
          action={
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                settings.docker_status?.running
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {settings.docker_status?.running ? 'Daemon Online' : 'Daemon Standby / Local'}
            </span>
          }
        >
          <div className="space-y-3 text-xs text-gray-700">
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Installation Status:</span>
              <span className="font-semibold text-gray-800">
                {settings.docker_status?.installed ? 'Docker CLI Detected' : 'Docker CLI Offline'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">CLI Version:</span>
              <span className="font-mono text-gray-800">
                {settings.docker_status?.version || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">crAPI Gateway:</span>
              <span className="font-mono text-blue-700 font-semibold">{settings.target_url}</span>
            </div>
            <p className="text-gray-500 mt-2 text-[11px] leading-relaxed">
              {settings.docker_status?.message}
            </p>
          </div>
        </WhiteCard>

        {/* JADX Engine Status */}
        <WhiteCard
          title={
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>JADX Android Decompiler</span>
            </div>
          }
          action={
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                settings.jadx_status?.installed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {settings.jadx_status?.installed ? 'JADX Active' : 'Native Disassembler Active'}
            </span>
          }
        >
          <div className="space-y-3 text-xs text-gray-700">
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">JADX Executable:</span>
              <span className="font-semibold text-gray-800">
                {settings.jadx_status?.installed ? 'Installed in PATH' : 'Built-in Python DEX Engine'}
              </span>
            </div>
            {settings.jadx_status?.path && (
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Binary Path:</span>
                <span className="font-mono text-gray-800">{settings.jadx_status.path}</span>
              </div>
            )}
            <p className="text-gray-500 mt-2 text-[11px] leading-relaxed">
              {settings.jadx_status?.instructions || 'JADX is detected and available for automated command-line APK decompilation.'}
            </p>
            {settings.jadx_status?.instructions && (
              <button
                onClick={copyJadxInstructions}
                className="mt-2 text-[11px] text-blue-700 border border-blue-200 bg-blue-50 px-2.5 py-1 rounded flex items-center gap-1 font-medium hover:bg-blue-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Instructions!' : 'Copy JADX Installation Guide'}
              </button>
            )}
          </div>
        </WhiteCard>

        {/* Database & Persistence */}
        <WhiteCard
          title={
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Database & Local Persistence</span>
            </div>
          }
        >
          <div className="space-y-3 text-xs text-gray-700">
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Storage Engine:</span>
              <span className="font-semibold text-gray-800">SQLite 3 (SQLAlchemy ORM)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Persistence File:</span>
              <span className="font-mono text-gray-800">database/security_platform.db</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Auto-Initialization:</span>
              <span className="text-emerald-700 font-semibold">Enabled (Verified Seed Data)</span>
            </div>
            <p className="text-gray-500 mt-2 text-[11px] leading-relaxed">
              All assessment records, BOLA test cases, authorization matrix rows, and sanitized evidence persist automatically across server restarts.
            </p>
          </div>
        </WhiteCard>

        {/* Secret Sanitization & Privacy */}
        <WhiteCard
          title={
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Security & Redaction Controls</span>
            </div>
          }
        >
          <div className="space-y-3 text-xs text-gray-700">
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Bearer Token Redaction:</span>
              <span className="text-emerald-700 font-semibold">Always Active (Auto-Masked)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">API Key Masking:</span>
              <span className="text-emerald-700 font-semibold">Enabled (AIzaSy...****)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Reporting Safeguard:</span>
              <span className="text-emerald-700 font-semibold">Synthetic Test Accounts Only</span>
            </div>
            <p className="text-gray-500 mt-2 text-[11px] leading-relaxed">
              Strict compliance with the Minor Project Assessment: prevents leaking live credentials or passwords into report deliverables.
            </p>
          </div>
        </WhiteCard>
      </div>
    </div>
  );
};

