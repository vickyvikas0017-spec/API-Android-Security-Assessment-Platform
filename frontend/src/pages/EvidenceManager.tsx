import React, { useEffect, useState, useRef } from 'react';
import {
  FolderLock,
  Upload,
  Plus,
  Trash2,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Eye,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { Evidence } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';

export const EvidenceManager: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionFilter, setQuestionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<Evidence | null>(null);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [relatedQuestion, setRelatedQuestion] = useState('Q2');
  const [category, setCategory] = useState('Broken Object Level Authorization');
  const [description, setDescription] = useState('');
  const [relatedEndpoint, setRelatedEndpoint] = useState('');
  const [redactedContent, setRedactedContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEvidence();
  }, [questionFilter]);

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const data = await api.getEvidenceList(questionFilter || undefined);
      setEvidenceList(data);
    } catch (err) {
      console.error('Failed to load evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('related_question', relatedQuestion);
      formData.append('vulnerability_category', category);
      formData.append('description', description);
      if (relatedEndpoint) formData.append('related_endpoint', relatedEndpoint);
      if (redactedContent) formData.append('redacted_content', redactedContent);
      if (selectedFile) formData.append('file', selectedFile);

      await api.uploadEvidence(formData);
      setShowUploadModal(false);
      resetForm();
      loadEvidence();
    } catch (err: any) {
      alert(`Error uploading evidence: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this evidence record?')) {
      try {
        await api.deleteEvidence(id);
        loadEvidence();
      } catch (err: any) {
        alert(`Error deleting evidence: ${err.message}`);
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setRelatedQuestion('Q2');
    setCategory('Broken Object Level Authorization');
    setDescription('');
    setRelatedEndpoint('');
    setRedactedContent('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredEvidence = evidenceList.filter((ev) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ev.title.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q) ||
      (ev.evidence_id || '').toLowerCase().includes(q) ||
      (ev.related_endpoint || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 bg-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Evidence Management Vault
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {evidenceList.length} Verified Artifacts Stored
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Centralized Assessment Evidence Manager
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Cryptographically organized repository of sanitized request/response transcripts, screenshots, and decompiled code snippets.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" /> Upload Evidence Artifact
        </button>
      </div>

      {/* Filter and Search Bar */}
      <WhiteCard>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search evidence by title, endpoint, or ID..."
              className="w-full bg-white border border-gray-300 rounded pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={questionFilter}
            onChange={(e) => setQuestionFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="">All Assessment Questions (Q1-Q10)</option>
            <option value="Q1">Q1: API Reconnaissance</option>
            <option value="Q2">Q2: API Vulnerability Assessment</option>
            <option value="Q3">Q3: crAPI Attack Path</option>
            <option value="Q4">Q4: BOLA Testing</option>
            <option value="Q5">Q5: Authorization Matrix</option>
            <option value="Q6">Q6: OTP Bypass</option>
            <option value="Q7">Q7: OTP Review</option>
            <option value="Q8">Q8: Android APK Analysis</option>
            <option value="Q9">Q9: APK Secret Leaks</option>
            <option value="Q10">Q10: Integrated Assessment</option>
          </select>
        </div>
      </WhiteCard>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvidence.map((ev) => (
          <div
            key={ev.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs hover:border-blue-300 transition-colors flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {ev.evidence_id}
                </span>
                <span className="text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  {ev.related_question}
                </span>
              </div>

              <h4 className="font-bold text-sm text-gray-900 mt-2">{ev.title}</h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ev.description}</p>

              {ev.related_endpoint && (
                <div className="mt-2 font-mono text-[11px] text-gray-700 bg-gray-50 p-1 rounded border border-gray-100 truncate">
                  {ev.related_endpoint}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-mono">
                {new Date(ev.date_collected).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewItem(ev)}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                  title="Delete Artifact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvidence.length === 0 && (
        <div className="py-16 text-center text-gray-400 text-xs bg-white border border-gray-200 rounded-lg">
          No evidence records found for the selected criteria.
        </div>
      )}

      {/* Evidence Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-2xl w-full p-5 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {previewItem.evidence_id}
                </span>
                <h3 className="font-bold text-base text-gray-900 mt-1">{previewItem.title}</h3>
              </div>
              <button onClick={() => setPreviewItem(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <div>Question: <b className="text-gray-900">{previewItem.related_question}</b></div>
                <div>Category: <b className="text-gray-900">{previewItem.vulnerability_category || '—'}</b></div>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Description:</span>
                <p className="text-gray-700 mt-0.5">{previewItem.description}</p>
              </div>

              {previewItem.redacted_content && (
                <div>
                  <span className="font-semibold text-gray-700">Sanitized Evidence Content:</span>
                  <pre className="p-3 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-800 max-h-64 overflow-y-auto whitespace-pre-wrap mt-1">
                    {previewItem.redacted_content}
                  </pre>
                </div>
              )}

              {previewItem.file_path && (
                <div className="pt-2">
                  <span className="font-semibold text-gray-700 block mb-1">Attached File:</span>
                  {['PNG', 'JPG', 'JPEG'].includes(previewItem.file_type) ? (
                    <img
                      src={previewItem.file_path}
                      alt={previewItem.title}
                      className="max-h-64 rounded border border-gray-200 object-contain"
                    />
                  ) : (
                    <a
                      href={previewItem.file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline font-mono flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View {previewItem.file_name}
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-xl w-full p-5 space-y-4 my-8">
            <h3 className="font-bold text-base text-gray-900">Upload Evidence Record</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Evidence Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. BOLA Location Request Transcript"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Related Question</label>
                  <select
                    value={relatedQuestion}
                    onChange={(e) => setRelatedQuestion(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                  >
                    <option value="Q1">Q1: API Reconnaissance</option>
                    <option value="Q2">Q2: API Vulnerability Assessment</option>
                    <option value="Q3">Q3: crAPI Investigation</option>
                    <option value="Q4">Q4: BOLA Scenario</option>
                    <option value="Q5">Q5: Authorization Matrix</option>
                    <option value="Q6">Q6: OTP Bypass</option>
                    <option value="Q7">Q7: OTP Review</option>
                    <option value="Q8">Q8: Android APK Analysis</option>
                    <option value="Q9">Q9: APK Secret Leaks</option>
                    <option value="Q10">Q10: Integrated Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Related API Path / Class</label>
                <input
                  type="text"
                  value={relatedEndpoint}
                  onChange={(e) => setRelatedEndpoint(e.target.value)}
                  placeholder="/identity/api/v2/vehicle/location"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Sanitized Transcript / Notes</label>
                <textarea
                  value={redactedContent}
                  onChange={(e) => setRedactedContent(e.target.value)}
                  rows={3}
                  placeholder="Paste HTTP headers, response snippet, or decompiled code..."
                  className="w-full bg-white border border-gray-300 rounded p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Attach File (Optional: PNG, JPG, TXT, JSON)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".png,.jpg,.jpeg,.txt,.json"
                  className="w-full text-xs text-gray-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Save Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

