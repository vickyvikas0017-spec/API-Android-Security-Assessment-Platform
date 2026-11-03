export interface Project {
  id: number;
  name: string;
  target_url: string;
  description?: string;
  assessment_batch: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApiEndpoint {
  id: number;
  endpoint_code?: string;
  method: string;
  path: string;
  auth_required: boolean;
  parameters?: string;
  security_function?: string;
  testing_status: string;
  deep_testing_worthy: boolean;
  observations?: string;
  created_at: string;
}

export interface Vulnerability {
  id: number;
  vuln_code?: string;
  title: string;
  category: string;
  affected_endpoint: string;
  http_method: string;
  description: string;
  reproduction_steps: string;
  request_evidence?: string;
  response_evidence?: string;
  impact: string;
  severity: string;
  cvss_score?: number;
  remediation: string;
  verification_status: string;
  assessment_question: string;
  created_at: string;
}

export interface CrapiAttackStep {
  id: number;
  step_number: number;
  title: string;
  description: string;
  endpoint: string;
  http_method: string;
  request_data?: string;
  response_data?: string;
  parameter_modified?: string;
  behavioral_change?: string;
  impact?: string;
  created_at: string;
}

export interface BolaTestCase {
  id: number;
  case_code?: string;
  title: string;
  endpoint: string;
  user_a_identifier: string;
  user_b_test_identifier: string;
  original_object_id: string;
  modified_object_id: string;
  original_response?: string;
  modified_response?: string;
  http_status: number;
  auth_result: string;
  evidence?: string;
  impact?: string;
  remediation?: string;
  created_at: string;
}

export interface AuthMatrixTest {
  id: number;
  test_code: string;
  user_label: string;
  user_privilege: string;
  target_object: string;
  operation: string;
  expected_result: string;
  actual_result: string;
  status_match: boolean;
  notes?: string;
  created_at: string;
}

export interface OtpInvestigation {
  id: number;
  test_code?: string;
  scenario_title: string;
  normal_flow_step: string;
  suspected_weakness: string;
  original_request?: string;
  modified_request?: string;
  server_response?: string;
  http_status: number;
  test_result: string;
  security_impact?: string;
  recommended_remediation?: string;
  created_at: string;
}

export interface OtpControlReview {
  id: number;
  control_id: string;
  control_name: string;
  description: string;
  why_important: string;
  risk_if_missing: string;
  recommended_implementation: string;
  status: string;
  audit_notes?: string;
  created_at: string;
}

export interface ApkFinding {
  id: number;
  apk_id?: number;
  finding_code?: string;
  finding_type: string;
  location_class: string;
  sensitivity: string;
  value_preview: string;
  full_description: string;
  recommended_action: string;
  created_at: string;
}

export interface ApkAnalysisRecord {
  id: number;
  file_name: string;
  file_size: number;
  file_hash_sha256?: string;
  package_name?: string;
  version_name?: string;
  version_code?: string;
  min_sdk?: string;
  target_sdk?: string;
  activities_count: number;
  services_count: number;
  receivers_count: number;
  providers_count: number;
  permissions_json?: string;
  decompiled_dir?: string;
  jadx_used: boolean;
  created_at: string;
  findings: ApkFinding[];
}

export interface ApkLeakScenario {
  id: number;
  leak_code?: string;
  leak_title: string;
  finding_ref: string;
  endpoint_identified: string;
  is_sensitive: string;
  is_public_intended: string;
  is_still_valid: string;
  permissions_granted?: string;
  business_impact: string;
  developer_remediation: string;
  status: string;
  created_at: string;
}

export interface IntegratedAssessmentPlan {
  id: number;
  title: string;
  scope_description: string;
  steps_json: string;
  status: string;
  risk_summary?: string;
  data_protection_precautions?: string;
  remediation_summary?: string;
  created_at: string;
}

export interface Evidence {
  id: number;
  evidence_id?: string;
  title: string;
  related_question: string;
  vulnerability_category?: string;
  description: string;
  file_path?: string;
  file_name?: string;
  file_type: string;
  related_endpoint?: string;
  redacted_content?: string;
  date_collected: string;
  created_at: string;
}

export interface DashboardStats {
  total_endpoints: number;
  total_vulnerabilities: number;
  critical_vulns: number;
  high_vulns: number;
  medium_vulns: number;
  low_vulns: number;
  informational_vulns: number;
  apk_files_analysed: number;
  total_evidence: number;
  assessment_progress_percentage: number;
  project_status: string;
  vulnerabilities_by_category: Record<string, number>;
  endpoints_by_method: Record<string, number>;
  endpoints_by_status: Record<string, number>;
  recent_activities: Array<{
    action: string;
    detail: string;
    time: string;
  }>;
}

export interface HttpTestResponse {
  status_code: number;
  duration_ms: number;
  headers: Record<string, string>;
  body: string;
  is_json: boolean;
  sanitized_headers: Record<string, string>;
}
