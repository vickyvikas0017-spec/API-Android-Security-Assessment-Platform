import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Edit2,
  Save,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { AuthMatrixTest } from '../types';
import { WhiteCard } from '../components/WhiteCard';
import { StatusBadge } from '../components/StatusBadge';

export const AuthTesting: React.FC = () => {
  const [matrix, setMatrix] = useState<AuthMatrixTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editActual, setEditActual] = useState('Allowed');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    loadMatrix();
  }, []);

  const loadMatrix = async () => {
    try {
      setLoading(true);
      const data = await api.getAuthMatrix();
      setMatrix(data);
    } catch (err) {
      console.error('Failed to load auth matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (test: AuthMatrixTest) => {
    setEditingId(test.id);
    setEditActual(test.actual_result);
    setEditNotes(test.notes || '');
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await api.updateAuthMatrixTest(id, {
        actual_result: editActual,
        notes: editNotes
      });
      setEditingId(null);
      loadMatrix();
    } catch (err: any) {
      alert(`Error updating test: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Title */}
      <div className="border-b border-gray-200 pb-4 bg-white">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Assessment Question Q5 • 10 Marks
          </span>
          <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Dual-User Authorization Matrix
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Authorization Testing & Privilege Boundaries
        </h2>
        <p className="text-xs text-gray-600 mt-0.5">
          Systematic cross-account permission matrix evaluating READ, MODIFY, and DELETE operations between User A and User B.
        </p>
      </div>

      {/* Authentication vs Authorization Conceptual Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WhiteCard title="Authentication (AuthN) — Who You Are">
          <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
            <p>
              <b>Authentication</b> is the process of verifying a user's identity through credentials, tokens, or cryptographic keys.
            </p>
            <div className="bg-gray-50 p-2.5 rounded border border-gray-200 space-y-1 font-mono text-[11px]">
              <div><b>Protocol Response:</b> HTTP 401 Unauthorized</div>
              <div><b>Meaning:</b> "You have not provided valid credentials, or your session has expired."</div>
            </div>
            <p className="text-gray-500">
              In crAPI, submitting an invalid password to <code>/identity/api/auth/v3</code> returns HTTP 401.
            </p>
          </div>
        </WhiteCard>

        <WhiteCard title="Authorization (AuthZ) — What You Can Do">
          <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
            <p>
              <b>Authorization</b> determines whether an authenticated identity possesses permission to perform a specific action on a requested resource.
            </p>
            <div className="bg-gray-50 p-2.5 rounded border border-gray-200 space-y-1 font-mono text-[11px]">
              <div><b>Protocol Response:</b> HTTP 403 Forbidden</div>
              <div><b>Meaning:</b> "I know who you are, but you lack permission to access or modify this object."</div>
            </div>
            <p className="text-gray-500">
              When User A accesses User B's vehicle coordinates and the server returns HTTP 200 instead of HTTP 403, an authorization failure has occurred.
            </p>
          </div>
        </WhiteCard>
      </div>

      {/* Authorization Matrix Table */}
      <WhiteCard
        title="Cross-User Permission Matrix"
        subtitle="Evaluation of User A vs User B operations across READ, MODIFY, DELETE permissions"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-800 border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700">
                <th className="py-2.5 px-3 font-semibold">Test Code</th>
                <th className="py-2.5 px-3 font-semibold">User Role</th>
                <th className="py-2.5 px-3 font-semibold">Target Object</th>
                <th className="py-2.5 px-3 font-semibold">Operation</th>
                <th className="py-2.5 px-3 font-semibold">Expected Result</th>
                <th className="py-2.5 px-3 font-semibold">Actual Result</th>
                <th className="py-2.5 px-3 font-semibold">Security Verdict</th>
                <th className="py-2.5 px-3 font-semibold">Audit Notes</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {matrix.map((row) => {
                const isEditing = editingId === row.id;
                const isVuln = row.actual_result === 'Allowed' && row.expected_result === 'Denied';

                return (
                  <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{row.test_code}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-900">{row.user_label}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-800">{row.target_object}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        {row.operation}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-gray-600">{row.expected_result}</td>

                    <td className="py-2.5 px-3">
                      {isEditing ? (
                        <select
                          value={editActual}
                          onChange={(e) => setEditActual(e.target.value)}
                          className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900"
                        >
                          <option value="Allowed">Allowed</option>
                          <option value="Denied">Denied</option>
                          <option value="Pending">Pending</option>
                        </select>
                      ) : (
                        <span
                          className={`font-semibold ${
                            row.actual_result === 'Allowed' ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {row.actual_result}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      {isVuln ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> VULNERABLE (BOLA)
                        </span>
                      ) : row.actual_result === row.expected_result ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> SECURE (PASS)
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">PENDING</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-gray-600 max-w-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                        />
                      ) : (
                        row.notes || '—'
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(row.id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(row)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit Test Result"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </WhiteCard>

      {/* Distinction Guide Box */}
      <WhiteCard title="How to Distinguish AuthN from AuthZ in Audit Practice">
        <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
          <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
            <h4 className="font-bold text-gray-900">Diagnostic Rule of Thumb:</h4>
            <p>
              1. <b>Test with No Token:</b> If <code>GET /api/users/102/profile</code> returns HTTP 401 Unauthorized, Authentication enforcement is working correctly.<br/>
              2. <b>Test with User A's Valid Token:</b> If <code>GET /api/users/102/profile</code> returns HTTP 200 OK, User A is authenticated.<br/>
              3. <b>Test with User A's Token requesting User B's ID (103):</b>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                <li>If server returns <b>HTTP 403 Forbidden</b>: Authorization is robustly enforced.</li>
                <li>If server returns <b>HTTP 200 OK</b>: Broken Object Level Authorization (BOLA) is present.</li>
              </ul>
            </p>
          </div>
        </div>
      </WhiteCard>
    </div>
  );
};

