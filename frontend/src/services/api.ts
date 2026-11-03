import {
  Project,
  ApiEndpoint,
  Vulnerability,
  CrapiAttackStep,
  BolaTestCase,
  AuthMatrixTest,
  OtpInvestigation,
  OtpControlReview,
  ApkAnalysisRecord,
  ApkFinding,
  ApkLeakScenario,
  IntegratedAssessmentPlan,
  Evidence,
  DashboardStats,
  HttpTestResponse
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard statistics');
    return res.json();
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const res = await fetch(`${BASE_URL}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  updateProject: async (id: number, data: Partial<Project>): Promise<Project> => {
    const res = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  // Q1: Recon
  getEndpoints: async (params?: { method?: string; auth_required?: boolean; testing_status?: string }): Promise<ApiEndpoint[]> => {
    const query = new URLSearchParams();
    if (params?.method) query.append('method', params.method);
    if (params?.auth_required !== undefined) query.append('auth_required', String(params.auth_required));
    if (params?.testing_status) query.append('testing_status', params.testing_status);
    const res = await fetch(`${BASE_URL}/recon/endpoints?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch API endpoints');
    return res.json();
  },

  createEndpoint: async (data: Partial<ApiEndpoint>): Promise<ApiEndpoint> => {
    const res = await fetch(`${BASE_URL}/recon/endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create endpoint');
    return res.json();
  },

  deleteEndpoint: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/recon/endpoints/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete endpoint');
  },

  importOpenApi: async (spec: any): Promise<{ imported: number; message: string }> => {
    const res = await fetch(`${BASE_URL}/recon/import-openapi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spec)
    });
    if (!res.ok) throw new Error('Failed to import OpenAPI spec');
    return res.json();
  },

  // Q2 & Centralized Vulns
  getVulnerabilities: async (params?: { severity?: string; category?: string; verification_status?: string }): Promise<Vulnerability[]> => {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.category) query.append('category', params.category);
    if (params?.verification_status) query.append('verification_status', params.verification_status);
    const res = await fetch(`${BASE_URL}/vulns?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch vulnerabilities');
    return res.json();
  },

  createVulnerability: async (data: Partial<Vulnerability>): Promise<Vulnerability> => {
    const res = await fetch(`${BASE_URL}/vulns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create vulnerability');
    return res.json();
  },

  updateVulnerability: async (id: number, data: Partial<Vulnerability>): Promise<Vulnerability> => {
    const res = await fetch(`${BASE_URL}/vulns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update vulnerability');
    return res.json();
  },

  deleteVulnerability: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/vulns/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete vulnerability');
  },

  // HTTP Live Sandbox
  executeHttpTest: async (req: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    auth_token?: string;
    body?: string;
    params?: Record<string, string>;
  }): Promise<HttpTestResponse> => {
    const res = await fetch(`${BASE_URL}/http-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error('HTTP test execution failed');
    return res.json();
  },

  // Q3: crAPI
  getCrapiStatus: async (): Promise<{ docker: any; service: any }> => {
    const res = await fetch(`${BASE_URL}/crapi/status`);
    if (!res.ok) throw new Error('Failed to fetch crAPI status');
    return res.json();
  },

  getCrapiSteps: async (): Promise<CrapiAttackStep[]> => {
    const res = await fetch(`${BASE_URL}/crapi/steps`);
    if (!res.ok) throw new Error('Failed to fetch crAPI attack steps');
    return res.json();
  },

  createCrapiStep: async (data: Partial<CrapiAttackStep>): Promise<CrapiAttackStep> => {
    const res = await fetch(`${BASE_URL}/crapi/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create attack step');
    return res.json();
  },

  // Q4: BOLA
  getBolaCases: async (): Promise<BolaTestCase[]> => {
    const res = await fetch(`${BASE_URL}/bola/cases`);
    if (!res.ok) throw new Error('Failed to fetch BOLA cases');
    return res.json();
  },

  createBolaCase: async (data: Partial<BolaTestCase>): Promise<BolaTestCase> => {
    const res = await fetch(`${BASE_URL}/bola/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create BOLA case');
    return res.json();
  },

  updateBolaCase: async (id: number, data: Partial<BolaTestCase>): Promise<BolaTestCase> => {
    const res = await fetch(`${BASE_URL}/bola/cases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update BOLA case');
    return res.json();
  },

  // Q5: Auth Matrix
  getAuthMatrix: async (): Promise<AuthMatrixTest[]> => {
    const res = await fetch(`${BASE_URL}/auth-matrix`);
    if (!res.ok) throw new Error('Failed to fetch authorization matrix');
    return res.json();
  },

  updateAuthMatrixTest: async (id: number, data: { actual_result?: string; notes?: string }): Promise<AuthMatrixTest> => {
    const res = await fetch(`${BASE_URL}/auth-matrix/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update test matrix row');
    return res.json();
  },

  // Q6 & Q7: OTP
  getOtpInvestigations: async (): Promise<OtpInvestigation[]> => {
    const res = await fetch(`${BASE_URL}/otp/investigations`);
    if (!res.ok) throw new Error('Failed to fetch OTP investigations');
    return res.json();
  },

  createOtpInvestigation: async (data: Partial<OtpInvestigation>): Promise<OtpInvestigation> => {
    const res = await fetch(`${BASE_URL}/otp/investigations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create OTP investigation');
    return res.json();
  },

  updateOtpInvestigation: async (id: number, data: Partial<OtpInvestigation>): Promise<OtpInvestigation> => {
    const res = await fetch(`${BASE_URL}/otp/investigations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update OTP investigation');
    return res.json();
  },

  getOtpReviews: async (): Promise<OtpControlReview[]> => {
    const res = await fetch(`${BASE_URL}/otp/reviews`);
    if (!res.ok) throw new Error('Failed to fetch OTP security reviews');
    return res.json();
  },

  updateOtpReview: async (controlId: string, data: { status: string; audit_notes?: string }): Promise<OtpControlReview> => {
    const res = await fetch(`${BASE_URL}/otp/reviews/${controlId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update OTP control review');
    return res.json();
  },

  // Q8: APK
  getJadxStatus: async (): Promise<{ installed: boolean; path?: string; version?: string; instructions?: string }> => {
    const res = await fetch(`${BASE_URL}/apk/jadx-status`);
    if (!res.ok) throw new Error('Failed to fetch JADX status');
    return res.json();
  },

  getApkRecords: async (): Promise<ApkAnalysisRecord[]> => {
    const res = await fetch(`${BASE_URL}/apk/records`);
    if (!res.ok) throw new Error('Failed to fetch APK records');
    return res.json();
  },

  getApkFindings: async (apkId?: number): Promise<ApkFinding[]> => {
    const url = apkId ? `${BASE_URL}/apk/findings?apk_id=${apkId}` : `${BASE_URL}/apk/findings`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch APK findings');
    return res.json();
  },

  uploadApk: async (file: File): Promise<ApkAnalysisRecord> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/apk/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload and analyze APK');
    return res.json();
  },

  generateSampleApk: async (): Promise<ApkAnalysisRecord> => {
    const res = await fetch(`${BASE_URL}/apk/generate-sample`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to generate sample APK');
    return res.json();
  },

  // Q9: APK Leak
  getApkLeakScenarios: async (): Promise<ApkLeakScenario[]> => {
    const res = await fetch(`${BASE_URL}/apk-leak/scenarios`);
    if (!res.ok) throw new Error('Failed to fetch APK leak scenarios');
    return res.json();
  },

  createApkLeakScenario: async (data: Partial<ApkLeakScenario>): Promise<ApkLeakScenario> => {
    const res = await fetch(`${BASE_URL}/apk-leak/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create APK leak scenario');
    return res.json();
  },

  updateApkLeakScenario: async (id: number, data: Partial<ApkLeakScenario>): Promise<ApkLeakScenario> => {
    const res = await fetch(`${BASE_URL}/apk-leak/scenarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update scenario');
    return res.json();
  },

  // Q10: Integrated
  getIntegratedPlan: async (): Promise<IntegratedAssessmentPlan> => {
    const res = await fetch(`${BASE_URL}/integrated/plan`);
    if (!res.ok) throw new Error('Failed to fetch integrated plan');
    return res.json();
  },

  updateIntegratedPlan: async (data: Partial<IntegratedAssessmentPlan>): Promise<IntegratedAssessmentPlan> => {
    const res = await fetch(`${BASE_URL}/integrated/plan`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update integrated plan');
    return res.json();
  },

  // Evidence
  getEvidenceList: async (relatedQuestion?: string): Promise<Evidence[]> => {
    const url = relatedQuestion ? `${BASE_URL}/evidence?related_question=${relatedQuestion}` : `${BASE_URL}/evidence`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch evidence list');
    return res.json();
  },

  uploadEvidence: async (formData: FormData): Promise<Evidence> => {
    const res = await fetch(`${BASE_URL}/evidence/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload evidence');
    return res.json();
  },

  deleteEvidence: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/evidence/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete evidence');
  },

  // Settings
  getSettings: async (): Promise<any> => {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  }
};

