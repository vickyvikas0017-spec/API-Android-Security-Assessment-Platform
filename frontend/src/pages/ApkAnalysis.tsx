import React, { useEffect, useState, useRef } from 'react';
import {
  Smartphone,
  Upload,
  Search,
  Key,
  ShieldAlert,
  FileCode,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { ApkAnalysisRecord, ApkFinding } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';

export const ApkAnalysis: React.FC = () => {
  const [records, setRecords] = useState<ApkAnalysisRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ApkAnalysisRecord | null>(null);
  const [findings, setFindings] = useState<ApkFinding[]>([]);
  const [jadxStatus, setJadxStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recs, jStatus] = await Promise.all([
        api.getApkRecords(),
        api.getJadxStatus()
      ]);
      setRecords(recs);
      setJadxStatus(jStatus);
      if (recs.length > 0) {
        setSelectedRecord(recs[0]);
        const f = await api.getApkFindings(recs[0].id);
        setFindings(f);
      }
    } catch (err) {
      console.error('Failed to load APK analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecord = async (rec: ApkAnalysisRecord) => {
    setSelectedRecord(rec);
    try {
      const f = await api.getApkFindings(rec.id);
      setFindings(f);
    } catch (err) {
      console.error('Error fetching findings for APK:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.apk')) {
      alert('Only .apk package files are supported.');
      return;
    }

    setUploading(true);
    try {
      const rec = await api.uploadApk(file);
      alert(`APK "${file.name}" uploaded and parsed successfully!`);
      loadData();
    } catch (err: any) {
      alert(`Upload or analysis error: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerateSampleApk = async () => {
    setUploading(true);
    try {
      const rec = await api.generateSampleApk();
      alert('Sample assessment APK package generated, disassembled, and indexed!');
      loadData();
    } catch (err: any) {
      alert(`Error generating sample APK: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const filteredFindings = findings.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.finding_type.toLowerCase().includes(q) ||
      f.location_class.toLowerCase().includes(q) ||
      f.full_description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 bg-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Assessment Question Q8 • 10 Marks
            </span>
            <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Android APK Analysis & JADX Decompilation
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Android APK Static Analysis & Secret Extraction
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Dalvik bytecode analysis, AndroidManifest inspection, API endpoint extraction, and hardcoded secrets detection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".apk"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Analyzing...' : 'Upload APK'}
          </button>

          <button
            onClick={handleGenerateSampleApk}
            disabled={uploading}
            className="flex-1 sm:flex-none px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analyze Sample APK
          </button>
        </div>
      </div>

      {/* JADX Status Banner */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-xs text-gray-900">
              Decompiler Engine: JADX & Native Dalvik String Extractor
            </h3>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              jadxStatus?.installed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {jadxStatus?.installed ? `JADX Active (${jadxStatus.version})` : 'Native Bytecode Engine Operational'}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
          {jadxStatus?.installed
            ? `JADX CLI detected at ${jadxStatus.path}. Full Java decompilation enabled.`
            : 'JADX CLI not in system PATH. The platform utilizes built-in DEX bytecode header parsing, string pool scanning, and AndroidManifest regex pattern extraction to parse secrets and API routes natively.'}
        </p>
      </div>

      {/* APK Metadata Card */}
      {selectedRecord && (
        <WhiteCard
          title={
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>{selectedRecord.file_name}</span>
              <span className="text-xs font-mono font-normal text-gray-500">
                ({(selectedRecord.file_size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
          }
          action={
            <span className="font-mono text-xs text-gray-500">
              SHA256: {selectedRecord.file_hash_sha256?.substring(0, 16)}...
            </span>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs bg-gray-50/60 p-3 rounded border border-gray-200">
            <div>
              <span className="text-gray-500 block">Package Name:</span>
              <span className="font-mono font-semibold text-gray-900">{selectedRecord.package_name}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Version:</span>
              <span className="font-mono font-semibold text-gray-900">{selectedRecord.version_name} ({selectedRecord.version_code})</span>
            </div>
            <div>
              <span className="text-gray-500 block">SDK Constraints:</span>
              <span className="font-mono font-semibold text-gray-900">Min {selectedRecord.min_sdk} / Target {selectedRecord.target_sdk}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Activities:</span>
              <span className="font-mono font-semibold text-gray-900">{selectedRecord.activities_count} Registered</span>
            </div>
            <div>
              <span className="text-gray-500 block">Services:</span>
              <span className="font-mono font-semibold text-gray-900">{selectedRecord.services_count} Exported</span>
            </div>
            <div>
              <span className="text-gray-500 block">Findings Discovered:</span>
              <span className="font-mono font-bold text-red-600">{findings.length} Artifacts</span>
            </div>
          </div>
        </WhiteCard>
      )}

      {/* Findings Table (Q8 Requirement) */}
      <WhiteCard
        title="Disassembled Code Findings Table"
        subtitle="Mandatory evidence table containing finding type, location/class, sensitivity, redacted preview, and recommended action"
        action={
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings or classes..."
              className="w-full bg-white border border-gray-300 rounded pl-8 pr-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-800 border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700">
                <th className="py-2.5 px-3 font-semibold">Finding</th>
                <th className="py-2.5 px-3 font-semibold">Location / Class</th>
                <th className="py-2.5 px-3 font-semibold">Sensitivity</th>
                <th className="py-2.5 px-3 font-semibold">Redacted Value Preview</th>
                <th className="py-2.5 px-3 font-semibold">Description</th>
                <th className="py-2.5 px-3 font-semibold">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredFindings.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-gray-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>{f.finding_type}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-gray-700">
                    {f.location_class}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge label={f.sensitivity} type="severity" />
                  </td>
                  <td className="py-2.5 px-3">
                    <code className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                      {f.value_preview}
                    </code>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 max-w-xs">
                    {f.full_description}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-800 font-medium max-w-xs">
                    {f.recommended_action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFindings.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-xs">
              No findings matched your search query.
            </div>
          )}
        </div>
      </WhiteCard>

      {/* Secret Redaction Safety Note */}
      <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold">Credential Redaction Compliance:</span> In accordance with the Minor Project Assessment submission rules, all hardcoded Google API keys, JWT bearer signatures, and access tokens extracted from mobile binaries are masked in reporting views to prevent unauthorized exposure.
        </div>
      </div>
    </div>
  );
};

