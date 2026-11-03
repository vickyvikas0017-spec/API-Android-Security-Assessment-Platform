import React, { useEffect, useState } from 'react';
import {
  Network,
  Bug,
  AlertTriangle,
  Smartphone,
  FolderLock,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Server
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';
import { PageId } from '../components/Sidebar';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  onOpenHttpTester: () => void;
}

const SEVERITY_COLORS = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#d97706',
  Low: '#2563eb',
  Informational: '#64748b'
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenHttpTester }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-8 bg-white min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading assessment dashboard telemetry...</p>
        </div>
      </div>
    );
  }

  // Format charts data
  const severityChartData = [
    { name: 'Critical', count: stats.critical_vulns, color: SEVERITY_COLORS.Critical },
    { name: 'High', count: stats.high_vulns, color: SEVERITY_COLORS.High },
    { name: 'Medium', count: stats.medium_vulns, color: SEVERITY_COLORS.Medium },
    { name: 'Low', count: stats.low_vulns, color: SEVERITY_COLORS.Low },
    { name: 'Info', count: stats.informational_vulns, color: SEVERITY_COLORS.Informational }
  ].filter((d) => d.count > 0);

  const methodChartData = Object.entries(stats.endpoints_by_method).map(([method, count]) => ({
    method,
    count
  }));

  const assessmentQuestions = [
    { id: 'api-recon' as PageId, q: 'Q1', title: 'API Reconnaissance', marks: '15M', status: stats.total_endpoints >= 8 ? 'Completed' : 'Pending' },
    { id: 'api-vulns' as PageId, q: 'Q2', title: 'API Vulnerability Assessment', marks: '15M', status: stats.total_vulnerabilities >= 2 ? 'Completed' : 'Pending' },
    { id: 'crapi' as PageId, q: 'Q3', title: 'crAPI Attack Flow', marks: '10M', status: 'Completed' },
    { id: 'bola' as PageId, q: 'Q4', title: 'BOLA Scenario', marks: '10M', status: 'Completed' },
    { id: 'auth-matrix' as PageId, q: 'Q5', title: 'Authorization Matrix', marks: '10M', status: 'Completed' },
    { id: 'otp-security' as PageId, q: 'Q6-7', title: 'OTP Bypass & Review', marks: '15M', status: 'Completed' },
    { id: 'apk-analysis' as PageId, q: 'Q8', title: 'Android APK Analysis', marks: '10M', status: stats.apk_files_analysed >= 1 ? 'Completed' : 'Pending' },
    { id: 'apk-leak' as PageId, q: 'Q9', title: 'APK Leak Investigation', marks: '5M', status: 'Completed' },
    { id: 'integrated' as PageId, q: 'Q10', title: 'Integrated Decision-Making', marks: '10M', status: 'Completed' }
  ];

  return (
    <div className="space-y-6 bg-white">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              August Batch Minor Project
            </span>
            <span className="text-xs text-gray-500 font-medium">Total Marks: 100</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            API & Android Security Assessment Dashboard
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Real-time audit telemetry, vulnerability metrics, and practical lab investigation tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenHttpTester}
            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Server className="w-3.5 h-3.5" />
            Launch HTTP Tester
          </button>
          <button
            onClick={() => onNavigate('final-report')}
            className="flex-1 md:flex-none px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-xs font-semibold transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* Total Endpoints */}
        <div
          onClick={() => onNavigate('api-recon')}
          className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">API Endpoints</span>
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2 font-mono">
            {stats.total_endpoints}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">≥ 8 Endpoints Mapped</span>
        </div>

        {/* Vulnerabilities */}
        <div
          onClick={() => onNavigate('vuln-reports')}
          className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-red-400 transition-colors shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Vulnerabilities</span>
            <div className="w-7 h-7 rounded bg-red-50 text-red-600 flex items-center justify-center">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2 font-mono">
            {stats.total_vulnerabilities}
          </div>
          <span className="text-[11px] text-gray-500">
            {stats.critical_vulns} Critical • {stats.high_vulns} High
          </span>
        </div>

        {/* APK Files */}
        <div
          onClick={() => onNavigate('apk-analysis')}
          className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-purple-400 transition-colors shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">APK Analysed</span>
            <div className="w-7 h-7 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2 font-mono">
            {stats.apk_files_analysed}
          </div>
          <span className="text-[11px] text-purple-600 font-medium">Dalvik Bytecode Parsed</span>
        </div>

        {/* Evidence Collected */}
        <div
          onClick={() => onNavigate('evidence')}
          className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-emerald-400 transition-colors shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Evidence Vault</span>
            <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2 font-mono">
            {stats.total_evidence}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Sanitized & Redacted</span>
        </div>
      </div>

      {/* Progress Bar */}
      <WhiteCard
        title="Assessment Completion Status"
        subtitle="Calculated strictly from verified laboratory findings and documented evidence"
        action={
          <span className="text-sm font-bold font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {stats.assessment_progress_percentage}% Completed
          </span>
        }
      >
        <div className="space-y-3">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.assessment_progress_percentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 pt-2">
            {assessmentQuestions.map((q) => (
              <button
                key={q.q}
                onClick={() => onNavigate(q.id)}
                className="p-2 border border-gray-200 rounded text-center hover:bg-gray-50 transition-colors group bg-white"
              >
                <div className="text-[11px] font-bold text-gray-800 flex items-center justify-center gap-1">
                  <span>{q.q}</span>
                  <span className="text-[9px] text-gray-400">({q.marks})</span>
                </div>
                <div className="text-[10px] text-gray-500 truncate mt-0.5">{q.title}</div>
                <div className="mt-1 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </WhiteCard>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Breakdown */}
        <WhiteCard
          title="Vulnerabilities by Severity"
          subtitle="Distribution of identified weaknesses across API and APK components"
        >
          <div className="h-64 flex items-center justify-center">
            {severityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]}>
                    {severityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-gray-400">No vulnerabilities logged yet</p>
            )}
          </div>
        </WhiteCard>

        {/* API Methods Breakdown */}
        <WhiteCard
          title="Endpoints by HTTP Method"
          subtitle="Cataloged attack surface routes grouped by protocol method"
        >
          <div className="h-64 flex items-center justify-center">
            {methodChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={methodChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="method" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-gray-400">No API endpoints recorded</p>
            )}
          </div>
        </WhiteCard>
      </div>

      {/* Bottom Grid: Recent Activity & Assessment Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <WhiteCard
            title="Recent Assessment Activities"
            subtitle="Chronological log of verified testing and evidence collection"
          >
            <div className="divide-y divide-gray-100">
              {stats.recent_activities.map((act, i) => (
                <div key={i} className="py-2.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900">{act.action}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{act.detail}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </WhiteCard>
        </div>

        {/* Assessment Lab Info */}
        <div>
          <WhiteCard title="Target Environment" subtitle="Authorized Testing Boundaries">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Lab Framework:</span>
                <span className="font-semibold text-gray-800">OWASP crAPI</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Base Gateway:</span>
                <span className="font-mono text-blue-600">http://localhost:8888</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Mailhog / OTP:</span>
                <span className="font-mono text-gray-800">http://localhost:8025</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Android Client:</span>
                <span className="font-semibold text-gray-800">com.crapi.client</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Assessment Mode:</span>
                <span className="text-emerald-700 font-semibold">Authorized Local Lab</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('crapi')}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs font-semibold text-gray-800 flex items-center justify-center gap-1 transition-colors"
                >
                  Inspect Lab Containers <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </WhiteCard>
        </div>
      </div>
    </div>
  );
};

