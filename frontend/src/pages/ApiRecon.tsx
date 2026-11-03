import React, { useEffect, useState } from 'react';
import {
  Network,
  Plus,
  FileUp,
  Download,
  Filter,
  Trash2,
  Play,
  CheckCircle2,
  AlertTriangle,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { ApiEndpoint } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';

interface ApiReconProps {
  onTestEndpoint: (endpoint: ApiEndpoint) => void;
}

export const ApiRecon: React.FC<ApiReconProps> = ({ onTestEndpoint }) => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('');
  const [authFilter, setAuthFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [openApiJson, setOpenApiJson] = useState('');

  // New Endpoint Form State
  const [newMethod, setNewMethod] = useState('GET');
  const [newPath, setNewPath] = useState('');
  const [newAuthRequired, setNewAuthRequired] = useState(true);
  const [newParams, setNewParams] = useState('');
  const [newSecurityFunction, setNewSecurityFunction] = useState('');
  const [newStatus, setNewStatus] = useState('Pending');
  const [newDeepTest, setNewDeepTest] = useState(false);
  const [newObservations, setNewObservations] = useState('');

  useEffect(() => {
    loadEndpoints();
  }, [methodFilter, authFilter, statusFilter]);

  const loadEndpoints = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (methodFilter) params.method = methodFilter;
      if (authFilter !== '') params.auth_required = authFilter === 'true';
      if (statusFilter) params.testing_status = statusFilter;
      const data = await api.getEndpoints(params);
      setEndpoints(data);
    } catch (err) {
      console.error('Failed to load endpoints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath) return;
    try {
      await api.createEndpoint({
        method: newMethod,
        path: newPath,
        auth_required: newAuthRequired,
        parameters: newParams,
        security_function: newSecurityFunction,
        testing_status: newStatus,
        deep_testing_worthy: newDeepTest,
        observations: newObservations
      });
      setShowAddModal(false);
      resetForm();
      loadEndpoints();
    } catch (err: any) {
      alert(`Error creating endpoint: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this recorded endpoint?')) {
      try {
        await api.deleteEndpoint(id);
        loadEndpoints();
      } catch (err: any) {
        alert(`Error deleting endpoint: ${err.message}`);
      }
    }
  };

  const handleImportOpenApi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(openApiJson);
      const res = await api.importOpenApi(parsed);
      alert(res.message);
      setShowImportModal(false);
      setOpenApiJson('');
      loadEndpoints();
    } catch (err: any) {
      alert(`Invalid OpenAPI JSON specification: ${err.message}`);
    }
  };

  const resetForm = () => {
    setNewMethod('GET');
    setNewPath('');
    setNewAuthRequired(true);
    setNewParams('');
    setNewSecurityFunction('');
    setNewStatus('Pending');
    setNewDeepTest(false);
    setNewObservations('');
  };

  const filteredEndpoints = endpoints.filter((ep) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ep.path.toLowerCase().includes(q) ||
      (ep.security_function || '').toLowerCase().includes(q) ||
      (ep.endpoint_code || '').toLowerCase().includes(q)
    );
  });

  const deepTestCount = endpoints.filter((ep) => ep.deep_testing_worthy).length;

  return (
    <div className="space-y-6 bg-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Assessment Question Q1 • 15 Marks
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {endpoints.length} of 8+ Required Endpoints Mapped
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            API Reconnaissance & Attack Surface Mapping
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Systematic cataloging of target endpoints, authentication requirements, parameters, and authorization risk flags.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileUp className="w-3.5 h-3.5" />
            Import OpenAPI
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Endpoint
          </button>
        </div>
      </div>

      {/* Target Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-3.5 bg-white shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Mapped Attack Surface</span>
          <div className="text-xl font-bold text-gray-900 mt-1 font-mono">{endpoints.length} Endpoints</div>
          <p className="text-[11px] text-gray-500 mt-0.5">Meets the Q1 minimum 8-endpoint requirement</p>
        </div>

        <div className="border border-amber-200 bg-amber-50/30 rounded-lg p-3.5 shadow-2xs">
          <span className="text-xs text-amber-800 font-semibold">Priority Authorization Targets</span>
          <div className="text-xl font-bold text-amber-900 mt-1 font-mono">{deepTestCount} Identified</div>
          <p className="text-[11px] text-amber-800 mt-0.5">Flagged for deep BOLA & privilege testing (≥3 required)</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-3.5 bg-white shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Authentication Requirements</span>
          <div className="text-xl font-bold text-gray-900 mt-1 font-mono">
            {endpoints.filter((e) => e.auth_required).length} Protected / {endpoints.filter((e) => !e.auth_required).length} Public
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">Bearer Token (JWT) vs Unauthenticated</p>
        </div>
      </div>

      {/* Filters & Search */}
      <WhiteCard>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by API path, code, or security function..."
              className="w-full bg-white border border-gray-300 rounded pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-600"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <select
              value={authFilter}
              onChange={(e) => setAuthFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-600"
            >
              <option value="">All Auth Requirements</option>
              <option value="true">Bearer Token Required</option>
              <option value="false">Public / None</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-600"
            >
              <option value="">All Statuses</option>
              <option value="Tested">Tested</option>
              <option value="Vulnerable">Vulnerable</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </WhiteCard>

      {/* Structured Endpoint Table */}
      <WhiteCard
        title="Discovered API Endpoints Inventory"
        subtitle="Documented attack surface routes conforming to Assessment Question Q1"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-800 border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700">
                <th className="py-2.5 px-3 font-semibold">ID</th>
                <th className="py-2.5 px-3 font-semibold">Method</th>
                <th className="py-2.5 px-3 font-semibold">API Path</th>
                <th className="py-2.5 px-3 font-semibold">Authentication</th>
                <th className="py-2.5 px-3 font-semibold">Parameters</th>
                <th className="py-2.5 px-3 font-semibold">Security Function</th>
                <th className="py-2.5 px-3 font-semibold">Testing Status</th>
                <th className="py-2.5 px-3 font-semibold">Deep Test</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredEndpoints.map((ep) => (
                <tr key={ep.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-gray-600">
                    {ep.endpoint_code || `EP-${ep.id}`}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge label={ep.method} type="method" />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-gray-900 font-medium">
                    {ep.path}
                  </td>
                  <td className="py-2.5 px-3">
                    {ep.auth_required ? (
                      <span className="text-gray-700 font-medium">Bearer JWT</span>
                    ) : (
                      <span className="text-gray-400">Public</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate" title={ep.parameters}>
                    {ep.parameters || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-gray-700 max-w-sm truncate" title={ep.security_function}>
                    {ep.security_function}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge label={ep.testing_status} />
                  </td>
                  <td className="py-2.5 px-3">
                    {ep.deep_testing_worthy ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> YES (High Risk)
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">No</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onTestEndpoint(ep)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                        title="Send Request in Live HTTP Sandbox"
                      >
                        <Play className="w-3 h-3" /> Test
                      </button>
                      <button
                        onClick={() => handleDelete(ep.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Delete Endpoint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEndpoints.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-xs">
              No API endpoints matched the active search or filters.
            </div>
          )}
        </div>
      </WhiteCard>

      {/* Add Endpoint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-xl w-full p-5 space-y-4">
            <h3 className="font-bold text-base text-gray-900">Register API Endpoint (Q1)</h3>
            <form onSubmit={handleCreateEndpoint} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">HTTP Method</label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">API Path</label>
                  <input
                    type="text"
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    placeholder="/identity/api/v2/..."
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Important Parameters</label>
                <input
                  type="text"
                  value={newParams}
                  onChange={(e) => setNewParams(e.target.value)}
                  placeholder="vehicleId (Path), auth_token (Header)"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Security Function</label>
                <input
                  type="text"
                  value={newSecurityFunction}
                  onChange={(e) => setNewSecurityFunction(e.target.value)}
                  placeholder="Fetches vehicle GPS telemetry and diagnostic history"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Authentication Required</label>
                  <select
                    value={String(newAuthRequired)}
                    onChange={(e) => setNewAuthRequired(e.target.value === 'true')}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
                  >
                    <option value="true">Yes (Bearer JWT)</option>
                    <option value="false">No (Public Endpoint)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Testing Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Tested">Tested</option>
                    <option value="Vulnerable">Vulnerable</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="deepTestCheckbox"
                  checked={newDeepTest}
                  onChange={(e) => setNewDeepTest(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="deepTestCheckbox" className="text-xs font-medium text-gray-800">
                  Mark as High Risk / Deserves Deeper Authorization Testing (Q1 requirement)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Observations</label>
                <textarea
                  value={newObservations}
                  onChange={(e) => setNewObservations(e.target.value)}
                  rows={2}
                  placeholder="Notes on potential parameter tampering or authorization boundaries..."
                  className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                >
                  Save Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import OpenAPI Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-xl w-full p-5 space-y-4">
            <h3 className="font-bold text-base text-gray-900">Import OpenAPI / Swagger Specification</h3>
            <p className="text-xs text-gray-500">
              Paste standard OpenAPI 3.0 or Swagger 2.0 JSON to automatically populate the attack surface table.
            </p>
            <form onSubmit={handleImportOpenApi} className="space-y-3">
              <textarea
                value={openApiJson}
                onChange={(e) => setOpenApiJson(e.target.value)}
                rows={10}
                placeholder='{ "openapi": "3.0.0", "paths": { "/identity/api/v2/vehicle": { "get": { "summary": "Get vehicle" } } } }'
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-blue-600"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                >
                  Parse & Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

