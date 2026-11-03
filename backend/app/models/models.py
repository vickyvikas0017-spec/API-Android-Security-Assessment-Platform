from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    target_url = Column(String(512), nullable=False, default="http://localhost:8888")
    description = Column(Text, nullable=True)
    assessment_batch = Column(String(100), default="August Batch")
    status = Column(String(50), default="In Progress")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ApiEndpoint(Base):
    __tablename__ = "api_endpoints"

    id = Column(Integer, primary_key=True, index=True)
    endpoint_code = Column(String(50), unique=True, index=True) # EP-01, EP-02...
    method = Column(String(10), nullable=False) # GET, POST, PUT, PATCH, DELETE
    path = Column(String(512), nullable=False)
    auth_required = Column(Boolean, default=True)
    parameters = Column(Text, nullable=True)
    security_function = Column(Text, nullable=True)
    testing_status = Column(String(50), default="Pending") # Pending, In Progress, Tested, Vulnerable
    deep_testing_worthy = Column(Boolean, default=False)
    observations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    vuln_code = Column(String(50), unique=True, index=True) # VULN-01...
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # BOLA, BFLA, Excessive Data Exposure, Weak Input Validation, etc.
    affected_endpoint = Column(String(512), nullable=False)
    http_method = Column(String(10), default="GET")
    description = Column(Text, nullable=False)
    reproduction_steps = Column(Text, nullable=False)
    request_evidence = Column(Text, nullable=True)
    response_evidence = Column(Text, nullable=True)
    impact = Column(Text, nullable=False)
    severity = Column(String(50), nullable=False) # Critical, High, Medium, Low, Informational
    cvss_score = Column(Float, nullable=True)
    remediation = Column(Text, nullable=False)
    verification_status = Column(String(50), default="Verified") # Verified, Not Vulnerable, Inconclusive, Not Started, In Progress
    assessment_question = Column(String(50), default="Q2") # Q2, Q3, Q4, Q6, Q8, Q9, Q10
    created_at = Column(DateTime, default=datetime.utcnow)

class CrapiAttackStep(Base):
    __tablename__ = "crapi_attack_steps"

    id = Column(Integer, primary_key=True, index=True)
    step_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    endpoint = Column(String(512), nullable=False)
    http_method = Column(String(10), default="GET")
    request_data = Column(Text, nullable=True)
    response_data = Column(Text, nullable=True)
    parameter_modified = Column(String(255), nullable=True)
    behavioral_change = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class BolaTestCase(Base):
    __tablename__ = "bola_test_cases"

    id = Column(Integer, primary_key=True, index=True)
    case_code = Column(String(50), unique=True)
    title = Column(String(255), nullable=False)
    endpoint = Column(String(512), nullable=False)
    user_a_identifier = Column(String(100), nullable=False)
    user_b_test_identifier = Column(String(100), nullable=False)
    original_object_id = Column(String(100), nullable=False)
    modified_object_id = Column(String(100), nullable=False)
    original_response = Column(Text, nullable=True)
    modified_response = Column(Text, nullable=True)
    http_status = Column(Integer, default=200)
    auth_result = Column(String(50), default="Pending") # Vulnerable, Not Vulnerable, Inconclusive, Not Tested
    evidence = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuthMatrixTest(Base):
    __tablename__ = "auth_matrix_tests"

    id = Column(Integer, primary_key=True, index=True)
    test_code = Column(String(20), unique=True) # T1, T2, T3, T4...
    user_label = Column(String(100), nullable=False) # User A, User B
    user_privilege = Column(String(100), default="Standard User")
    target_object = Column(String(255), nullable=False)
    operation = Column(String(50), nullable=False) # READ, MODIFY, DELETE
    expected_result = Column(String(50), nullable=False) # Allowed, Denied
    actual_result = Column(String(50), default="Pending") # Allowed, Denied, Pending
    status_match = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class OtpInvestigation(Base):
    __tablename__ = "otp_investigations"

    id = Column(Integer, primary_key=True, index=True)
    test_code = Column(String(50), unique=True)
    scenario_title = Column(String(255), nullable=False)
    normal_flow_step = Column(Text, nullable=False)
    suspected_weakness = Column(String(255), nullable=False) # Client-side validation, Step skipping, etc.
    original_request = Column(Text, nullable=True)
    modified_request = Column(Text, nullable=True)
    server_response = Column(Text, nullable=True)
    http_status = Column(Integer, default=200)
    test_result = Column(String(50), default="Not Tested") # Vulnerable, Not Vulnerable, Inconclusive, Not Tested
    security_impact = Column(Text, nullable=True)
    recommended_remediation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class OtpControlReview(Base):
    __tablename__ = "otp_control_reviews"

    id = Column(Integer, primary_key=True, index=True)
    control_id = Column(String(20), unique=True) # CTRL-01 to CTRL-05
    control_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    why_important = Column(Text, nullable=False)
    risk_if_missing = Column(Text, nullable=False)
    recommended_implementation = Column(Text, nullable=False)
    status = Column(String(50), default="Not Verified") # Implemented, Not Implemented, Not Verified
    audit_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ApkAnalysisRecord(Base):
    __tablename__ = "apk_analysis_records"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, default=0) # bytes
    file_hash_sha256 = Column(String(64), nullable=True)
    package_name = Column(String(255), nullable=True)
    version_name = Column(String(50), nullable=True)
    version_code = Column(String(50), nullable=True)
    min_sdk = Column(String(20), nullable=True)
    target_sdk = Column(String(20), nullable=True)
    activities_count = Column(Integer, default=0)
    services_count = Column(Integer, default=0)
    receivers_count = Column(Integer, default=0)
    providers_count = Column(Integer, default=0)
    permissions_json = Column(Text, nullable=True)
    decompiled_dir = Column(String(512), nullable=True)
    jadx_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    findings = relationship("ApkFinding", back_populates="apk", cascade="all, delete-orphan")

class ApkFinding(Base):
    __tablename__ = "apk_findings"

    id = Column(Integer, primary_key=True, index=True)
    apk_id = Column(Integer, ForeignKey("apk_analysis_records.id"), nullable=True)
    finding_code = Column(String(50), index=True)
    finding_type = Column(String(100), nullable=False) # API Endpoint, API Key, Token-like String, Configuration Value, Component
    location_class = Column(String(255), nullable=False)
    sensitivity = Column(String(50), nullable=False) # High, Medium, Low
    value_preview = Column(String(255), nullable=False) # Redacted preview
    full_description = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    apk = relationship("ApkAnalysisRecord", back_populates="findings")

class ApkLeakScenario(Base):
    __tablename__ = "apk_leak_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    leak_code = Column(String(50), unique=True)
    leak_title = Column(String(255), nullable=False)
    finding_ref = Column(String(255), nullable=False)
    endpoint_identified = Column(String(512), nullable=False)
    is_sensitive = Column(String(50), default="Investigating") # Confirmed Sensitive, False Positive, Non-Sensitive
    is_public_intended = Column(String(50), default="Unknown") # Intended Public, Secret/Confidential, Unknown
    is_still_valid = Column(String(50), default="Not Verified") # Active/Valid, Revoked/Expired, Not Verified Offline
    permissions_granted = Column(Text, nullable=True)
    business_impact = Column(Text, nullable=False)
    developer_remediation = Column(Text, nullable=False)
    status = Column(String(50), default="In Progress")
    created_at = Column(DateTime, default=datetime.utcnow)

class IntegratedAssessmentPlan(Base):
    __tablename__ = "integrated_assessment_plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    scope_description = Column(Text, nullable=False)
    steps_json = Column(Text, nullable=False) # Array of 10 steps with progress and evidence
    status = Column(String(50), default="In Progress")
    risk_summary = Column(Text, nullable=True)
    data_protection_precautions = Column(Text, nullable=True)
    remediation_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    evidence_id = Column(String(50), unique=True, index=True) # EVD-001, EVD-002...
    title = Column(String(255), nullable=False)
    related_question = Column(String(50), nullable=False) # Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10
    vulnerability_category = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    date_collected = Column(DateTime, default=datetime.utcnow)
    file_path = Column(String(512), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_type = Column(String(50), default="TXT") # PNG, JPG, JPEG, TXT, JSON
    related_endpoint = Column(String(512), nullable=True)
    redacted_content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ApiRequestHistory(Base):
    __tablename__ = "api_request_history"

    id = Column(Integer, primary_key=True, index=True)
    target_url = Column(String(512), nullable=False)
    method = Column(String(10), nullable=False)
    request_headers = Column(Text, nullable=True)
    request_body = Column(Text, nullable=True)
    response_status = Column(Integer, nullable=True)
    response_headers = Column(Text, nullable=True)
    response_body = Column(Text, nullable=True)
    response_time_ms = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

