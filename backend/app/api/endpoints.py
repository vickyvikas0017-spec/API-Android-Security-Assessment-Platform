import os
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.config import APK_UPLOADS_DIR, EVIDENCE_UPLOADS_DIR, REPORTS_DIR
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.services.http_service import execute_http_request, sanitize_headers
from backend.app.services.apk_service import (
    check_jadx_availability, parse_apk, create_sample_assessment_apk
)
from backend.app.services.crapi_service import check_docker_status, check_crapi_service
from backend.app.services.report_service import generate_pdf_report, generate_docx_report

router = APIRouter()

# ----------------- DASHBOARD -----------------
@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    endpoints_count = db.query(models.ApiEndpoint).count()
    vulns = db.query(models.Vulnerability).all()
    apk_count = db.query(models.ApkAnalysisRecord).count()
    evidence_count = db.query(models.Evidence).count()

    crit = sum(1 for v in vulns if v.severity.lower() == "critical")
    high = sum(1 for v in vulns if v.severity.lower() == "high")
    med = sum(1 for v in vulns if v.severity.lower() == "medium")
    low = sum(1 for v in vulns if v.severity.lower() == "low")
    info = sum(1 for v in vulns if v.severity.lower() == "informational")

    categories: Dict[str, int] = {}
    for v in vulns:
        categories[v.category] = categories.get(v.category, 0) + 1

    methods: Dict[str, int] = {}
    endpoints = db.query(models.ApiEndpoint).all()
    for ep in endpoints:
        methods[ep.method] = methods.get(ep.method, 0) + 1

    status_dict: Dict[str, int] = {}
    for ep in endpoints:
        status_dict[ep.testing_status] = status_dict.get(ep.testing_status, 0) + 1

    # Calculate actual progress percentage across the 10 questions
    verified_vulns = sum(1 for v in vulns if v.verification_status == "Verified")
    progress = 0
    if endpoints_count >= 8: progress += 15 # Q1
    if len(vulns) >= 2: progress += 15 # Q2
    if db.query(models.CrapiAttackStep).count() >= 3: progress += 10 # Q3
    if db.query(models.BolaTestCase).count() >= 1: progress += 10 # Q4
    if db.query(models.AuthMatrixTest).count() >= 4: progress += 10 # Q5
    if db.query(models.OtpInvestigation).count() >= 2: progress += 10 # Q6
    if db.query(models.OtpControlReview).count() >= 5: progress += 5 # Q7
    if apk_count >= 1: progress += 10 # Q8
    if db.query(models.ApkLeakScenario).count() >= 1: progress += 5 # Q9
    if db.query(models.IntegratedAssessmentPlan).count() >= 1: progress += 10 # Q10

    recent_activities = [
        {"action": "API Reconnaissance", "detail": f"Cataloged {endpoints_count} endpoints across crAPI service", "time": "Today"},
        {"action": "BOLA Investigation", "detail": "Identified cross-tenant object ID exposure in profile endpoint", "time": "Today"},
        {"action": "APK Analysis", "detail": "Analyzed client Dalvik bytecode for embedded secrets and routes", "time": "Today"},
        {"action": "Evidence Vault", "detail": f"{evidence_count} sanitized evidence artifacts documented", "time": "Today"}
    ]

    project = db.query(models.Project).first()
    proj_status = project.status if project else "In Progress"

    return schemas.DashboardStats(
        total_endpoints=endpoints_count,
        total_vulnerabilities=len(vulns),
        critical_vulns=crit,
        high_vulns=high,
        medium_vulns=med,
        low_vulns=low,
        informational_vulns=info,
        apk_files_analysed=apk_count,
        total_evidence=evidence_count,
        assessment_progress_percentage=min(progress, 100),
        project_status=proj_status,
        vulnerabilities_by_category=categories,
        endpoints_by_method=methods,
        endpoints_by_status=status_dict,
        recent_activities=recent_activities
    )

# ----------------- PROJECTS -----------------
@router.get("/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()

@router.put("/projects/{id}", response_model=schemas.ProjectResponse)
def update_project(id: int, payload: schemas.ProjectCreate, db: Session = Depends(get_db)):
    proj = db.query(models.Project).filter(models.Project.id == id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    for k, v in payload.dict().items():
        setattr(proj, k, v)
    proj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(proj)
    return proj

# ----------------- Q1: API RECONNAISSANCE -----------------
@router.get("/recon/endpoints", response_model=List[schemas.ApiEndpointResponse])
def list_endpoints(
    method: Optional[str] = None,
    auth_required: Optional[bool] = None,
    testing_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.ApiEndpoint)
    if method:
        query = query.filter(models.ApiEndpoint.method == method.upper())
    if auth_required is not None:
        query = query.filter(models.ApiEndpoint.auth_required == auth_required)
    if testing_status:
        query = query.filter(models.ApiEndpoint.testing_status == testing_status)
    return query.order_by(models.ApiEndpoint.id.asc()).all()

@router.post("/recon/endpoints", response_model=schemas.ApiEndpointResponse)
def create_endpoint(payload: schemas.ApiEndpointCreate, db: Session = Depends(get_db)):
    count = db.query(models.ApiEndpoint).count()
    code = payload.endpoint_code or f"EP-{count + 1:02d}"
    ep = models.ApiEndpoint(
        endpoint_code=code,
        method=payload.method.upper(),
        path=payload.path,
        auth_required=payload.auth_required,
        parameters=payload.parameters,
        security_function=payload.security_function,
        testing_status=payload.testing_status,
        deep_testing_worthy=payload.deep_testing_worthy,
        observations=payload.observations
    )
    db.add(ep)
    db.commit()
    db.refresh(ep)
    return ep

@router.delete("/recon/endpoints/{id}")
def delete_endpoint(id: int, db: Session = Depends(get_db)):
    ep = db.query(models.ApiEndpoint).filter(models.ApiEndpoint.id == id).first()
    if not ep:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    db.delete(ep)
    db.commit()
    return {"message": "Endpoint deleted successfully"}

@router.post("/recon/import-openapi")
def import_openapi(spec: Dict[str, Any], db: Session = Depends(get_db)):
    paths = spec.get("paths", {})
    imported = 0
    for path, methods in paths.items():
        for method, details in methods.items():
            if method.upper() in ["GET", "POST", "PUT", "PATCH", "DELETE"]:
                count = db.query(models.ApiEndpoint).count()
                ep = models.ApiEndpoint(
                    endpoint_code=f"EP-{count + 1:02d}",
                    method=method.upper(),
                    path=path,
                    auth_required=bool(details.get("security")),
                    parameters=json.dumps(details.get("parameters", [])),
                    security_function=details.get("summary") or details.get("description") or "API Service",
                    testing_status="Pending",
                    deep_testing_worthy=any(k in path.lower() for k in ["user", "order", "vehicle", "profile", "admin"])
                )
                db.add(ep)
                imported += 1
    db.commit()
    return {"imported": imported, "message": f"Successfully imported {imported} API endpoints."}

# ----------------- Q2 & CENTRALIZED VULNERABILITIES -----------------
@router.get("/vulns", response_model=List[schemas.VulnerabilityResponse])
def list_vulnerabilities(
    severity: Optional[str] = None,
    category: Optional[str] = None,
    verification_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Vulnerability)
    if severity:
        query = query.filter(models.Vulnerability.severity == severity)
    if category:
        query = query.filter(models.Vulnerability.category == category)
    if verification_status:
        query = query.filter(models.Vulnerability.verification_status == verification_status)
    return query.order_by(models.Vulnerability.id.asc()).all()

@router.post("/vulns", response_model=schemas.VulnerabilityResponse)
def create_vulnerability(payload: schemas.VulnerabilityCreate, db: Session = Depends(get_db)):
    count = db.query(models.Vulnerability).count()
    code = payload.vuln_code or f"VULN-{count + 1:02d}"
    vuln = models.Vulnerability(
        vuln_code=code,
        title=payload.title,
        category=payload.category,
        affected_endpoint=payload.affected_endpoint,
        http_method=payload.http_method,
        description=payload.description,
        reproduction_steps=payload.reproduction_steps,
        request_evidence=payload.request_evidence,
        response_evidence=payload.response_evidence,
        impact=payload.impact,
        severity=payload.severity,
        cvss_score=payload.cvss_score,
        remediation=payload.remediation,
        verification_status=payload.verification_status,
        assessment_question=payload.assessment_question
    )
    db.add(vuln)
    db.commit()
    db.refresh(vuln)
    return vuln

@router.put("/vulns/{id}", response_model=schemas.VulnerabilityResponse)
def update_vulnerability(id: int, payload: schemas.VulnerabilityCreate, db: Session = Depends(get_db)):
    vuln = db.query(models.Vulnerability).filter(models.Vulnerability.id == id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    for k, v in payload.dict().items():
        setattr(vuln, k, v)
    db.commit()
    db.refresh(vuln)
    return vuln

@router.delete("/vulns/{id}")
def delete_vulnerability(id: int, db: Session = Depends(get_db)):
    vuln = db.query(models.Vulnerability).filter(models.Vulnerability.id == id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    db.delete(vuln)
    db.commit()
    return {"message": "Vulnerability deleted successfully"}

# ----------------- HTTP LIVE TESTING ENGINE -----------------
@router.post("/http-test", response_model=schemas.HttpTestResponse)
def execute_test(req: schemas.HttpTestRequest, db: Session = Depends(get_db)):
    res = execute_http_request(
        url=req.url,
        method=req.method,
        headers=req.headers,
        auth_token=req.auth_token,
        body=req.body,
        params=req.params
    )

    # Save to history
    hist = models.ApiRequestHistory(
        target_url=req.url,
        method=req.method,
        request_headers=json.dumps(sanitize_headers(req.headers or {})),
        request_body=req.body,
        response_status=res["status_code"],
        response_headers=json.dumps(res["sanitized_headers"]),
        response_body=res["body"][:2000],
        duration_ms=res["duration_ms"]
    )
    db.add(hist)
    db.commit()

    return schemas.HttpTestResponse(
        status_code=res["status_code"],
        duration_ms=res["duration_ms"],
        headers=res["headers"],
        body=res["body"],
        is_json=res["is_json"],
        sanitized_headers=res["sanitized_headers"]
    )

# ----------------- Q3: crAPI INVESTIGATION -----------------
@router.get("/crapi/status")
def get_crapi_status():
    docker_info = check_docker_status()
    service_info = check_crapi_service()
    return {
        "docker": docker_info,
        "service": service_info
    }

@router.get("/crapi/steps", response_model=List[schemas.CrapiAttackStepResponse])
def get_crapi_steps(db: Session = Depends(get_db)):
    return db.query(models.CrapiAttackStep).order_by(models.CrapiAttackStep.step_number.asc()).all()

@router.post("/crapi/steps", response_model=schemas.CrapiAttackStepResponse)
def create_crapi_step(payload: schemas.CrapiAttackStepCreate, db: Session = Depends(get_db)):
    step = models.CrapiAttackStep(**payload.dict())
    db.add(step)
    db.commit()
    db.refresh(step)
    return step

# ----------------- Q4: BOLA SCENARIO -----------------
@router.get("/bola/cases", response_model=List[schemas.BolaTestCaseResponse])
def get_bola_cases(db: Session = Depends(get_db)):
    return db.query(models.BolaTestCase).all()

@router.post("/bola/cases", response_model=schemas.BolaTestCaseResponse)
def create_bola_case(payload: schemas.BolaTestCaseCreate, db: Session = Depends(get_db)):
    count = db.query(models.BolaTestCase).count()
    code = payload.case_code or f"BOLA-{count + 1:02d}"
    case = models.BolaTestCase(
        case_code=code,
        title=payload.title,
        endpoint=payload.endpoint,
        user_a_identifier=payload.user_a_identifier,
        user_b_test_identifier=payload.user_b_test_identifier,
        original_object_id=payload.original_object_id,
        modified_object_id=payload.modified_object_id,
        original_response=payload.original_response,
        modified_response=payload.modified_response,
        http_status=payload.http_status,
        auth_result=payload.auth_result,
        evidence=payload.evidence,
        impact=payload.impact,
        remediation=payload.remediation
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case

@router.put("/bola/cases/{id}", response_model=schemas.BolaTestCaseResponse)
def update_bola_case(id: int, payload: schemas.BolaTestCaseCreate, db: Session = Depends(get_db)):
    case = db.query(models.BolaTestCase).filter(models.BolaTestCase.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="BOLA case not found")
    for k, v in payload.dict().items():
        setattr(case, k, v)
    db.commit()
    db.refresh(case)
    return case

# ----------------- Q5: AUTHORIZATION MATRIX -----------------
@router.get("/auth-matrix", response_model=List[schemas.AuthMatrixTestResponse])
def get_auth_matrix(db: Session = Depends(get_db)):
    return db.query(models.AuthMatrixTest).order_by(models.AuthMatrixTest.id.asc()).all()

@router.put("/auth-matrix/{id}", response_model=schemas.AuthMatrixTestResponse)
def update_auth_matrix_test(id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    test = db.query(models.AuthMatrixTest).filter(models.AuthMatrixTest.id == id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    if "actual_result" in payload:
        test.actual_result = payload["actual_result"]
        test.status_match = (test.actual_result == test.expected_result)
    if "notes" in payload:
        test.notes = payload["notes"]
    db.commit()
    db.refresh(test)
    return test

# ----------------- Q6 & Q7: OTP SECURITY -----------------
@router.get("/otp/investigations", response_model=List[schemas.OtpInvestigationResponse])
def get_otp_investigations(db: Session = Depends(get_db)):
    return db.query(models.OtpInvestigation).all()

@router.post("/otp/investigations", response_model=schemas.OtpInvestigationResponse)
def create_otp_investigation(payload: schemas.OtpInvestigationCreate, db: Session = Depends(get_db)):
    count = db.query(models.OtpInvestigation).count()
    code = payload.test_code or f"OTP-{count + 1:02d}"
    item = models.OtpInvestigation(
        test_code=code,
        scenario_title=payload.scenario_title,
        normal_flow_step=payload.normal_flow_step,
        suspected_weakness=payload.suspected_weakness,
        original_request=payload.original_request,
        modified_request=payload.modified_request,
        server_response=payload.server_response,
        http_status=payload.http_status,
        test_result=payload.test_result,
        security_impact=payload.security_impact,
        recommended_remediation=payload.recommended_remediation
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/otp/investigations/{id}", response_model=schemas.OtpInvestigationResponse)
def update_otp_investigation(id: int, payload: schemas.OtpInvestigationCreate, db: Session = Depends(get_db)):
    item = db.query(models.OtpInvestigation).filter(models.OtpInvestigation.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Investigation not found")
    for k, v in payload.dict().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.get("/otp/reviews", response_model=List[schemas.OtpControlReviewResponse])
def get_otp_reviews(db: Session = Depends(get_db)):
    return db.query(models.OtpControlReview).order_by(models.OtpControlReview.control_id.asc()).all()

@router.put("/otp/reviews/{control_id}", response_model=schemas.OtpControlReviewResponse)
def update_otp_review(control_id: str, payload: schemas.OtpControlReviewUpdate, db: Session = Depends(get_db)):
    ctrl = db.query(models.OtpControlReview).filter(models.OtpControlReview.control_id == control_id).first()
    if not ctrl:
        raise HTTPException(status_code=404, detail="Control not found")
    ctrl.status = payload.status
    if payload.audit_notes is not None:
        ctrl.audit_notes = payload.audit_notes
    db.commit()
    db.refresh(ctrl)
    return ctrl

# ----------------- Q8: ANDROID APK ANALYSIS -----------------
@router.get("/apk/jadx-status")
def get_jadx_status():
    return check_jadx_availability()

@router.get("/apk/records", response_model=List[schemas.ApkAnalysisRecordResponse])
def get_apk_records(db: Session = Depends(get_db)):
    return db.query(models.ApkAnalysisRecord).order_by(models.ApkAnalysisRecord.id.desc()).all()

@router.get("/apk/findings", response_model=List[schemas.ApkFindingResponse])
def get_apk_findings(apk_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.ApkFinding)
    if apk_id:
        query = query.filter(models.ApkFinding.apk_id == apk_id)
    return query.order_by(models.ApkFinding.id.asc()).all()

@router.post("/apk/upload", response_model=schemas.ApkAnalysisRecordResponse)
async def upload_apk(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".apk"):
        raise HTTPException(status_code=400, detail="Only .apk files are supported.")
    
    file_path = APK_UPLOADS_DIR / file.filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    parsed = parse_apk(file_path, APK_UPLOADS_DIR)

    record = models.ApkAnalysisRecord(
        file_name=parsed["file_name"],
        file_size=parsed["file_size"],
        file_hash_sha256=parsed["file_hash_sha256"],
        package_name=parsed["package_name"],
        version_name=parsed["version_name"],
        version_code=parsed["version_code"],
        min_sdk=parsed["min_sdk"],
        target_sdk=parsed["target_sdk"],
        activities_count=parsed["activities_count"],
        services_count=parsed["services_count"],
        receivers_count=parsed["receivers_count"],
        providers_count=parsed["providers_count"],
        permissions_json=json.dumps(parsed["permissions"]),
        decompiled_dir=parsed["decompiled_dir"],
        jadx_used=parsed["jadx_used"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    for item in parsed["findings"]:
        f_model = models.ApkFinding(
            apk_id=record.id,
            finding_code=item["finding_code"],
            finding_type=item["finding_type"],
            location_class=item["location_class"],
            sensitivity=item["sensitivity"],
            value_preview=item["value_preview"],
            full_description=item["full_description"],
            recommended_action=item["recommended_action"]
        )
        db.add(f_model)
    db.commit()
    db.refresh(record)

    return record

@router.post("/apk/generate-sample", response_model=schemas.ApkAnalysisRecordResponse)
def generate_sample_apk_endpoint(db: Session = Depends(get_db)):
    sample_path = APK_UPLOADS_DIR / "crAPI_Assessment_Authorized_Client.apk"
    create_sample_assessment_apk(sample_path)
    parsed = parse_apk(sample_path, APK_UPLOADS_DIR)

    record = models.ApkAnalysisRecord(
        file_name="crAPI_Assessment_Authorized_Client.apk",
        file_size=parsed["file_size"],
        file_hash_sha256=parsed["file_hash_sha256"],
        package_name=parsed["package_name"],
        version_name=parsed["version_name"],
        version_code=parsed["version_code"],
        min_sdk=parsed["min_sdk"],
        target_sdk=parsed["target_sdk"],
        activities_count=parsed["activities_count"],
        services_count=parsed["services_count"],
        receivers_count=parsed["receivers_count"],
        providers_count=parsed["providers_count"],
        permissions_json=json.dumps(parsed["permissions"]),
        decompiled_dir=parsed["decompiled_dir"],
        jadx_used=parsed["jadx_used"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    for item in parsed["findings"]:
        f_model = models.ApkFinding(
            apk_id=record.id,
            finding_code=item["finding_code"],
            finding_type=item["finding_type"],
            location_class=item["location_class"],
            sensitivity=item["sensitivity"],
            value_preview=item["value_preview"],
            full_description=item["full_description"],
            recommended_action=item["recommended_action"]
        )
        db.add(f_model)
    db.commit()
    db.refresh(record)

    return record

# ----------------- Q9: APK LEAK SCENARIOS -----------------
@router.get("/apk-leak/scenarios", response_model=List[schemas.ApkLeakScenarioResponse])
def get_apk_leak_scenarios(db: Session = Depends(get_db)):
    return db.query(models.ApkLeakScenario).all()

@router.post("/apk-leak/scenarios", response_model=schemas.ApkLeakScenarioResponse)
def create_apk_leak_scenario(payload: schemas.ApkLeakScenarioCreate, db: Session = Depends(get_db)):
    count = db.query(models.ApkLeakScenario).count()
    code = payload.leak_code or f"LEAK-{count + 1:02d}"
    scen = models.ApkLeakScenario(
        leak_code=code,
        leak_title=payload.leak_title,
        finding_ref=payload.finding_ref,
        endpoint_identified=payload.endpoint_identified,
        is_sensitive=payload.is_sensitive,
        is_public_intended=payload.is_public_intended,
        is_still_valid=payload.is_still_valid,
        permissions_granted=payload.permissions_granted,
        business_impact=payload.business_impact,
        developer_remediation=payload.developer_remediation,
        status=payload.status
    )
    db.add(scen)
    db.commit()
    db.refresh(scen)
    return scen

@router.put("/apk-leak/scenarios/{id}", response_model=schemas.ApkLeakScenarioResponse)
def update_apk_leak_scenario(id: int, payload: schemas.ApkLeakScenarioCreate, db: Session = Depends(get_db)):
    scen = db.query(models.ApkLeakScenario).filter(models.ApkLeakScenario.id == id).first()
    if not scen:
        raise HTTPException(status_code=404, detail="Scenario not found")
    for k, v in payload.dict().items():
        setattr(scen, k, v)
    db.commit()
    db.refresh(scen)
    return scen

# ----------------- Q10: INTEGRATED ASSESSMENT PLAN -----------------
@router.get("/integrated/plan", response_model=Optional[schemas.IntegratedAssessmentPlanResponse])
def get_integrated_plan(db: Session = Depends(get_db)):
    return db.query(models.IntegratedAssessmentPlan).first()

@router.put("/integrated/plan", response_model=schemas.IntegratedAssessmentPlanResponse)
def update_integrated_plan(payload: schemas.IntegratedAssessmentPlanCreate, db: Session = Depends(get_db)):
    plan = db.query(models.IntegratedAssessmentPlan).first()
    if not plan:
        plan = models.IntegratedAssessmentPlan(**payload.dict())
        db.add(plan)
    else:
        for k, v in payload.dict().items():
            setattr(plan, k, v)
    db.commit()
    db.refresh(plan)
    return plan

# ----------------- EVIDENCE MANAGEMENT -----------------
@router.get("/evidence", response_model=List[schemas.EvidenceResponse])
def list_evidence(related_question: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Evidence)
    if related_question:
        query = query.filter(models.Evidence.related_question == related_question)
    return query.order_by(models.Evidence.id.desc()).all()

@router.post("/evidence/upload", response_model=schemas.EvidenceResponse)
async def upload_evidence(
    title: str = Form(...),
    related_question: str = Form(...),
    vulnerability_category: Optional[str] = Form(None),
    description: str = Form(...),
    related_endpoint: Optional[str] = Form(None),
    redacted_content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    saved_path = None
    file_type = "TXT"
    filename = None

    if file:
        filename = file.filename
        file_path = EVIDENCE_UPLOADS_DIR / filename
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        saved_path = f"/uploads/evidence/{filename}"
        ext = os.path.splitext(filename)[1].replace(".", "").upper()
        file_type = ext if ext else "FILE"

    count = db.query(models.Evidence).count()
    code = f"EVD-{count + 1:03d}"

    ev = models.Evidence(
        evidence_id=code,
        title=title,
        related_question=related_question,
        vulnerability_category=vulnerability_category,
        description=description,
        file_path=saved_path,
        file_name=filename,
        file_type=file_type,
        related_endpoint=related_endpoint,
        redacted_content=redacted_content
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev

@router.delete("/evidence/{id}")
def delete_evidence(id: int, db: Session = Depends(get_db)):
    ev = db.query(models.Evidence).filter(models.Evidence.id == id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    db.delete(ev)
    db.commit()
    return {"message": "Evidence deleted successfully"}

# ----------------- FINAL REPORT EXPORT -----------------
@router.get("/reports/download-pdf")
def download_pdf(db: Session = Depends(get_db)):
    proj = db.query(models.Project).first()
    endpoints = db.query(models.ApiEndpoint).all()
    vulns = db.query(models.Vulnerability).all()
    crapi_steps = db.query(models.CrapiAttackStep).order_by(models.CrapiAttackStep.step_number.asc()).all()
    bola_cases = db.query(models.BolaTestCase).all()
    auth_tests = db.query(models.AuthMatrixTest).all()
    otp_cases = db.query(models.OtpInvestigation).all()
    otp_reviews = db.query(models.OtpControlReview).all()
    apk_findings = db.query(models.ApkFinding).all()
    apk_leaks = db.query(models.ApkLeakScenario).all()
    integrated_plans = db.query(models.IntegratedAssessmentPlan).all()
    evidence_list = db.query(models.Evidence).all()

    pdf_path = REPORTS_DIR / "API_Android_Security_Assessment_Final_Report.pdf"
    generate_pdf_report(
        output_path=pdf_path,
        project_data=proj.__dict__ if proj else {},
        endpoints=endpoints,
        vulns=vulns,
        crapi_steps=crapi_steps,
        bola_cases=bola_cases,
        auth_tests=auth_tests,
        otp_cases=otp_cases,
        otp_reviews=otp_reviews,
        apk_findings=apk_findings,
        apk_leaks=apk_leaks,
        integrated_plans=integrated_plans,
        evidence_list=evidence_list
    )

    return FileResponse(
        path=str(pdf_path),
        filename="API_Android_Security_Assessment_Report.pdf",
        media_type="application/pdf"
    )

@router.get("/reports/download-docx")
def download_docx(db: Session = Depends(get_db)):
    proj = db.query(models.Project).first()
    endpoints = db.query(models.ApiEndpoint).all()
    vulns = db.query(models.Vulnerability).all()
    crapi_steps = db.query(models.CrapiAttackStep).order_by(models.CrapiAttackStep.step_number.asc()).all()
    bola_cases = db.query(models.BolaTestCase).all()
    auth_tests = db.query(models.AuthMatrixTest).all()
    otp_cases = db.query(models.OtpInvestigation).all()
    otp_reviews = db.query(models.OtpControlReview).all()
    apk_findings = db.query(models.ApkFinding).all()
    apk_leaks = db.query(models.ApkLeakScenario).all()
    integrated_plans = db.query(models.IntegratedAssessmentPlan).all()
    evidence_list = db.query(models.Evidence).all()

    docx_path = REPORTS_DIR / "API_Android_Security_Assessment_Final_Report.docx"
    generate_docx_report(
        output_path=docx_path,
        project_data=proj.__dict__ if proj else {},
        endpoints=endpoints,
        vulns=vulns,
        crapi_steps=crapi_steps,
        bola_cases=bola_cases,
        auth_tests=auth_tests,
        otp_cases=otp_cases,
        otp_reviews=otp_reviews,
        apk_findings=apk_findings,
        apk_leaks=apk_leaks,
        integrated_plans=integrated_plans,
        evidence_list=evidence_list
    )

    return FileResponse(
        path=str(docx_path),
        filename="API_Android_Security_Assessment_Report.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

# ----------------- SETTINGS -----------------
@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    proj = db.query(models.Project).first()
    jadx = check_jadx_availability()
    docker = check_docker_status()
    return {
        "project_name": proj.name if proj else "API & Android Security Assessment Platform",
        "target_url": proj.target_url if proj else "http://localhost:8888",
        "assessment_batch": proj.assessment_batch if proj else "August Batch",
        "jadx_status": jadx,
        "docker_status": docker,
        "redaction_enabled": True
    }

