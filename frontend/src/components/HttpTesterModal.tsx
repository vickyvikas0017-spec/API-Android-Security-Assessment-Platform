import React, { useState } from 'react';
import { Send, X, Copy, Check, Save } from 'lucide-react';
import { api } from '../services/api';
import { HttpTestResponse } from '../types';

interface HttpTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  initialMethod?: string;
  initialBody?: string;
  initialAuthToken?: string;
  onSaveEvidence?: (requestData: string, responseData: string, endpoint: string) => void;
}

export const HttpTesterModal: React.FC<HttpTesterModalProps> = ({
  isOpen,
  onClose,
  initialUrl = 'http://localhost:8888/identity/api/v2/user/dashboard',
  initialMethod = 'GET',
  initialBody = '',
  initialAuthToken = '',
  onSaveEvidence
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [method, setMethod] = useState(initialMethod);
  const [authToken, setAuthToken] = useState(initialAuthToken);
  const [headersText, setHeadersText] = useState('{\n  "Accept": "application/json"\n}');
  const [bodyText, setBodyText] = useState(initialBody);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<HttpTestResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    setSavedMsg(false);
    try {
      let customHeaders: Record<string, string> = {};
      try {
        if (headersText.trim()) customHeaders = JSON.parse(headersText);
      } catch (err) {
        alert('Invalid JSON in Request Headers. Please correct it.');
        setLoading(false);
        return;
      }

      const res = await api.executeHttpTest({
        url,
        method,
        headers: customHeaders,
        auth_token: authToken || undefined,
        body: bodyText || undefined
      });
      setResponse(res);
    } catch (err: any) {
      alert(`Request execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveAsEvidence = () => {
    if (response && onSaveEvidence) {
      const reqSnippet = `${method} ${url}\nAuthorization: Bearer ${authToken ? '[REDACTED_TOKEN]' : 'None'}\n\n${bodyText}`;
      const respSnippet = `HTTP/1.1 ${response.status_code}\nDuration: ${response.duration_ms}ms\n\n${response.body}`;
      onSaveEvidence(reqSnippet, respSnippet, url);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <h3 className="font-semibold text-gray-900 text-base">API Security Request & Response Console</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Authorized Lab Engine</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 bg-white flex-1">
          {/* URL & Method Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-blue-600"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8888/identity/api/..."
              className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-600 font-mono"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>

          {/* Auth Token Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Bearer Token (Optional - JWT / Session Token):
            </label>
            <input
              type="text"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Headers & Body Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Custom Request Headers (JSON):
              </label>
              <textarea
                value={headersText}
                onChange={(e) => setHeadersText(e.target.value)}
                rows={4}
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-mono text-gray-800 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Request Body (JSON / Raw Payload):
              </label>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={4}
                placeholder='{"vehicleId": "103"}'
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-mono text-gray-800 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Response Section */}
          {response && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-600">Response Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      response.status_code >= 200 && response.status_code < 300
                        ? 'bg-emerald-100 text-emerald-800'
                        : response.status_code >= 400 && response.status_code < 500
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    HTTP {response.status_code}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">Duration: {response.duration_ms} ms</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResponse}
                    className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded flex items-center gap-1 bg-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Body'}
                  </button>

                  {onSaveEvidence && (
                    <button
                      onClick={handleSaveAsEvidence}
                      className="text-xs text-blue-700 hover:text-blue-800 border border-blue-200 bg-blue-50 px-2.5 py-1 rounded flex items-center gap-1 font-medium"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savedMsg ? 'Saved to Evidence Vault!' : 'Save as Evidence'}
                    </button>
                  )}
                </div>
              </div>

              {/* Response Headers */}
              <div>
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 font-medium hover:text-gray-900 mb-1">
                    View Response Headers ({Object.keys(response.headers).length})
                  </summary>
                  <pre className="p-2 bg-gray-50 rounded border border-gray-200 font-mono text-[11px] text-gray-700 overflow-x-auto max-h-32">
                    {JSON.stringify(response.sanitized_headers, null, 2)}
                  </pre>
                </details>
              </div>

              {/* Response Body */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Response Body:</label>
                <pre className="p-3 bg-gray-50 rounded border border-gray-200 font-mono text-xs text-gray-800 overflow-x-auto max-h-64 whitespace-pre-wrap">
                  {response.body}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

