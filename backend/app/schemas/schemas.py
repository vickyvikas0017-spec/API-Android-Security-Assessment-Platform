from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

# Project
class ProjectBase(BaseModel):
    name: str
    target_url: str = "http://localhost:8888"
    description: Optional[str] = None
    assessment_batch: str = "August Batch"
    status: str = "In Progress"

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ApiEndpoint (Q1)
class ApiEndpointBase(BaseModel):
    endpoint_code: Optional[str] = None
    method: str
    path: str
    auth_required: bool = True
    parameters: Optional[str] = None
    security_function: Optional[str] = None
    testing_status: str = "Pending"
    deep_testing_worthy: bool = False
    observations: Optional[str] = None

class ApiEndpointCreate(ApiEndpointBase):
    pass

class ApiEndpointResponse(ApiEndpointBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Vulnerability (Q2 & Centralized)
class VulnerabilityBase(BaseModel):
    vuln_code: Optional[str] = None
    title: str
    category: str
    affected_endpoint: str
    http_method: str = "GET"
    description: str
    reproduction_steps: str
    request_evidence: Optional[str] = None
    response_evidence: Optional[str] = None
    impact: str
    severity: str
    cvss_score: Optional[float] = None
    remediation: str
    verification_status: str = "Verified"
    assessment_question: str = "Q2"

class VulnerabilityCreate(VulnerabilityBase):
    pass

class VulnerabilityResponse(VulnerabilityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# crAPI Attack Step (Q3)
class CrapiAttackStepBase(BaseModel):
    step_number: int
    title: str
    description: str
    endpoint: str
    http_method: str = "GET"
    request_data: Optional[str] = None
    response_data: Optional[str] = None
    parameter_modified: Optional[str] = None
    behavioral_change: Optional[str] = None
    impact: Optional[str] = None

class CrapiAttackStepCreate(CrapiAttackStepBase):
    pass

class CrapiAttackStepResponse(CrapiAttackStepBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# BOLA (Q4)
class BolaTestCaseBase(BaseModel):
    case_code: Optional[str] = None
    title: str
    endpoint: str
    user_a_identifier: str
    user_b_test_identifier: str
    original_object_id: str
    modified_object_id: str
    original_response: Optional[str] = None
    modified_response: Optional[str] = None
    http_status: int = 200
    auth_result: str = "Pending"
    evidence: Optional[str] = None
    impact: Optional[str] = None
    remediation: Optional[str] = None

class BolaTestCaseCreate(BolaTestCaseBase):
    pass

class BolaTestCaseResponse(BolaTestCaseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Auth Matrix (Q5)
class AuthMatrixTestBase(BaseModel):
    test_code: str
    user_label: str
    user_privilege: str = "Standard User"
    target_object: str
    operation: str
    expected_result: str
    actual_result: str = "Pending"
    status_match: bool = False
    notes: Optional[str] = None

class AuthMatrixTestCreate(AuthMatrixTestBase):
    pass

class AuthMatrixTestResponse(AuthMatrixTestBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# OTP Investigation (Q6)
class OtpInvestigationBase(BaseModel):
    test_code: Optional[str] = None
    scenario_title: str
    normal_flow_step: str
    suspected_weakness: str
    original_request: Optional[str] = None
    modified_request: Optional[str] = None
    server_response: Optional[str] = None
    http_status: int = 200
    test_result: str = "Not Tested"
    security_impact: Optional[str] = None
    recommended_remediation: Optional[str] = None

class OtpInvestigationCreate(OtpInvestigationBase):
    pass

class OtpInvestigationResponse(OtpInvestigationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# OTP Security Review (Q7)
class OtpControlReviewBase(BaseModel):
    control_id: str
    control_name: str
    description: str
    why_important: str
    risk_if_missing: str
    recommended_implementation: str
    status: str = "Not Verified"
    audit_notes: Optional[str] = None

class OtpControlReviewUpdate(BaseModel):
    status: str
    audit_notes: Optional[str] = None

class OtpControlReviewResponse(OtpControlReviewBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# APK Findings (Q8)
class ApkFindingBase(BaseModel):
    finding_code: Optional[str] = None
    finding_type: str
    location_class: str
    sensitivity: str
    value_preview: str
    full_description: str
    recommended_action: str

class ApkFindingResponse(ApkFindingBase):
    id: int
    apk_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ApkAnalysisRecordResponse(BaseModel):
    id: int
    file_name: str
    file_size: int
    file_hash_sha256: Optional[str] = None
    package_name: Optional[str] = None
    version_name: Optional[str] = None
    version_code: Optional[str] = None
    min_sdk: Optional[str] = None
    target_sdk: Optional[str] = None
    activities_count: int = 0
    services_count: int = 0
    receivers_count: int = 0
    providers_count: int = 0
    permissions_json: Optional[str] = None
    decompiled_dir: Optional[str] = None
    jadx_used: bool = False
    created_at: datetime
    findings: List[ApkFindingResponse] = []

    class Config:
        from_attributes = True

# APK Leak Scenario (Q9)
class ApkLeakScenarioBase(BaseModel):
    leak_code: Optional[str] = None
    leak_title: str
    finding_ref: str
    endpoint_identified: str
    is_sensitive: str = "Investigating"
    is_public_intended: str = "Unknown"
    is_still_valid: str = "Not Verified"
    permissions_granted: Optional[str] = None
    business_impact: str
    developer_remediation: str
    status: str = "In Progress"

class ApkLeakScenarioCreate(ApkLeakScenarioBase):
    pass

class ApkLeakScenarioResponse(ApkLeakScenarioBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Integrated Assessment Plan (Q10)
class IntegratedAssessmentPlanBase(BaseModel):
    title: str
    scope_description: str
    steps_json: str
    status: str = "In Progress"
    risk_summary: Optional[str] = None
    data_protection_precautions: Optional[str] = None
    remediation_summary: Optional[str] = None

class IntegratedAssessmentPlanCreate(IntegratedAssessmentPlanBase):
    pass

class IntegratedAssessmentPlanResponse(IntegratedAssessmentPlanBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Evidence
class EvidenceBase(BaseModel):
    evidence_id: Optional[str] = None
    title: str
    related_question: str
    vulnerability_category: Optional[str] = None
    description: str
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    file_type: str = "TXT"
    related_endpoint: Optional[str] = None
    redacted_content: Optional[str] = None

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceResponse(EvidenceBase):
    id: int
    date_collected: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# HTTP Test Request
class HttpTestRequest(BaseModel):
    url: str
    method: str = "GET"
    headers: Optional[Dict[str, str]] = None
    auth_token: Optional[str] = None
    body: Optional[str] = None
    params: Optional[Dict[str, str]] = None

class HttpTestResponse(BaseModel):
    status_code: int
    duration_ms: float
    headers: Dict[str, str]
    body: str
    is_json: bool
    sanitized_headers: Dict[str, str]

# Dashboard Stats
class DashboardStats(BaseModel):
    total_endpoints: int
    total_vulnerabilities: int
    critical_vulns: int
    high_vulns: int
    medium_vulns: int
    low_vulns: int
    informational_vulns: int
    apk_files_analysed: int
    total_evidence: int
    assessment_progress_percentage: int
    project_status: str
    vulnerabilities_by_category: Dict[str, int]
    endpoints_by_method: Dict[str, int]
    endpoints_by_status: Dict[str, int]
    recent_activities: List[Dict[str, Any]]

