import json
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models import models

def seed_initial_data(db: Session):
    # 1. Project
    if not db.query(models.Project).first():
        proj = models.Project(
            name="API & Android Security Assessment Platform",
            target_url="http://localhost:8888",
            description="Comprehensive security assessment covering OWASP crAPI and Android client APK for August Batch Minor Project.",
            assessment_batch="August Batch",
            status="In Progress"
        )
        db.add(proj)

    # 2. Q1: API Reconnaissance Endpoints (At least 8 endpoints, 3 deep test worthy)
    if db.query(models.ApiEndpoint).count() == 0:
        endpoints_data = [
            {
                "endpoint_code": "EP-01",
                "method": "POST",
                "path": "/identity/api/auth/v3",
                "auth_required": False,
                "parameters": "email, password",
                "security_function": "User authentication and JWT token issuance",
                "testing_status": "Tested",
                "deep_testing_worthy": False,
                "observations": "Public endpoint. Enforces credential check and returns Bearer token."
            },
            {
                "endpoint_code": "EP-02",
                "method": "GET",
                "path": "/identity/api/v2/user/dashboard",
                "auth_required": True,
                "parameters": "None (reads Authorization header)",
                "security_function": "Retrieves authenticated user profile and owned vehicles list",
                "testing_status": "Tested",
                "deep_testing_worthy": True,
                "observations": "Returns array of vehicle IDs. Deserves deep authorization testing to check cross-user object access."
            },
            {
                "endpoint_code": "EP-03",
                "method": "GET",
                "path": "/identity/api/v2/vehicle/{vehicleId}/location",
                "auth_required": True,
                "parameters": "vehicleId (Path parameter)",
                "security_function": "Fetches real-time GPS coordinates of vehicle",
                "testing_status": "Vulnerable",
                "deep_testing_worthy": True,
                "observations": "CRITICAL: Path parameter vehicleId is not validated against the authenticated user in the JWT token (BOLA)."
            },
            {
                "endpoint_code": "EP-04",
                "method": "POST",
                "path": "/workshop/api/merchant/contact_mechanic",
                "auth_required": True,
                "parameters": "mechanic_code, problem_details, vin",
                "security_function": "Dispatches service request and vehicle telemetry to mechanic",
                "testing_status": "Vulnerable",
                "deep_testing_worthy": True,
                "observations": "Accepts arbitrary mechanic_code and sends full vehicle details to that mechanic's email."
            },
            {
                "endpoint_code": "EP-05",
                "method": "GET",
                "path": "/community/api/v2/community/posts/recent",
                "auth_required": True,
                "parameters": "limit, offset",
                "security_function": "Community forum post listing",
                "testing_status": "Tested",
                "deep_testing_worthy": False,
                "observations": "Excessive data exposure: response body reveals author email, vehicle model, and internal user UUIDs."
            },
            {
                "endpoint_code": "EP-06",
                "method": "POST",
                "path": "/identity/api/auth/forget-password",
                "auth_required": False,
                "parameters": "email",
                "security_function": "Initiates password reset and sends OTP code",
                "testing_status": "Tested",
                "deep_testing_worthy": False,
                "observations": "Generates 4-digit numeric OTP delivered to lab email service (Mailhog)."
            },
            {
                "endpoint_code": "EP-07",
                "method": "POST",
                "path": "/identity/api/auth/v3/check-otp",
                "auth_required": False,
                "parameters": "email, otp, new_password",
                "security_function": "Validates OTP and updates account password",
                "testing_status": "Vulnerable",
                "deep_testing_worthy": True,
                "observations": "Vulnerable to step-skipping and insufficient attempt throttling on OTP verification."
            },
            {
                "endpoint_code": "EP-08",
                "method": "GET",
                "path": "/workshop/api/shop/orders/{orderId}",
                "auth_required": True,
                "parameters": "orderId (Path parameter)",
                "security_function": "Fetches order receipt and billing information",
                "testing_status": "Tested",
                "deep_testing_worthy": True,
                "observations": "Allows querying order details by orderId; requires checking whether orderId belongs to active user."
            },
            {
                "endpoint_code": "EP-09",
                "method": "DELETE",
                "path": "/workshop/api/shop/orders/{orderId}",
                "auth_required": True,
                "parameters": "orderId",
                "security_function": "Cancels active order",
                "testing_status": "Tested",
                "deep_testing_worthy": True,
                "observations": "Requires verifying authorization matrices to prevent unauthorized deletion by User B."
            },
            {
                "endpoint_code": "EP-10",
                "method": "PUT",
                "path": "/identity/api/v2/user/profile",
                "auth_required": True,
                "parameters": "name, phone, address",
                "security_function": "Updates user contact details",
                "testing_status": "Tested",
                "deep_testing_worthy": False,
                "observations": "Properly scoped to the authenticated session context."
            }
        ]
        for ep in endpoints_data:
            db.add(models.ApiEndpoint(**ep))

    # 3. Q2: API Vulnerabilities (At least 2 demonstrated vulnerabilities)
    if db.query(models.Vulnerability).count() == 0:
        vulns_data = [
            {
                "vuln_code": "VULN-01",
                "title": "Broken Object Level Authorization (BOLA) in Vehicle Location API",
                "category": "Broken Object Level Authorization",
                "affected_endpoint": "/identity/api/v2/vehicle/{vehicleId}/location",
                "http_method": "GET",
                "description": "The endpoint allows an authenticated user (User A) to obtain real-time GPS coordinates and location history of any vehicle in the system by simply changing the 'vehicleId' path parameter to a valid vehicle identifier belonging to User B.",
                "reproduction_steps": "1. Authenticate as User A and obtain Bearer JWT.\n2. Note User A's vehicle ID (e.g. 102).\n3. Replay request GET /identity/api/v2/vehicle/103/location with User A's Authorization header.\n4. Observe HTTP 200 OK returning latitude, longitude, and full telemetry of User B's vehicle.",
                "request_evidence": "GET /identity/api/v2/vehicle/103/location HTTP/1.1\nHost: localhost:8888\nAuthorization: Bearer eyJhbGci...[REDACTED_USER_A_TOKEN]...\nAccept: application/json",
                "response_evidence": "HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  \"vehicleId\": \"103\",\n  \"owner\": \"victim_user_b@crapi.lab\",\n  \"latitude\": \"37.7749\",\n  \"longitude\": \"-122.4194\",\n  \"status\": \"ACTIVE\"\n}",
                "impact": "High. An attacker can track the real-time physical location of any customer vehicle registered on the platform, leading to severe privacy violation and stalking risks.",
                "severity": "High",
                "cvss_score": 8.5,
                "remediation": "Validate at the database query level that the requested vehicleId is owned by or assigned to the authenticated user ID extracted from the validated JWT token.",
                "verification_status": "Verified",
                "assessment_question": "Q2"
            },
            {
                "vuln_code": "VULN-02",
                "title": "Excessive Data Exposure & Sensitive PII Leak in Community Posts",
                "category": "Excessive Data Exposure",
                "affected_endpoint": "/community/api/v2/community/posts/recent",
                "http_method": "GET",
                "description": "The community forum endpoint serializes entire internal User database entities rather than a data transfer object (DTO). The JSON response discloses sensitive internal details including email addresses, phone numbers, vehicle VINs, and hashed UUIDs of all authors.",
                "reproduction_steps": "1. Send GET request to /community/api/v2/community/posts/recent with any authenticated user token.\n2. Inspect response payload.\n3. Note author object exposes author_email, vehicle_vin, and user_secret_id fields that are unnecessary for forum post display.",
                "request_evidence": "GET /community/api/v2/community/posts/recent?limit=5 HTTP/1.1\nHost: localhost:8888\nAuthorization: Bearer eyJ...[REDACTED]...\nAccept: application/json",
                "response_evidence": "HTTP/1.1 200 OK\nContent-Type: application/json\n\n[\n  {\n    \"postId\": \"901\",\n    \"title\": \"Engine noise query\",\n    \"author\": {\n      \"id\": 103,\n      \"name\": \"Alice B\",\n      \"email\": \"alice.b@lab.internal\",\n      \"phone\": \"+1-555-0192\",\n      \"vehicle_vin\": \"1HGCR2F83HA...[REDACTED]\"\n    }\n  }\n]",
                "impact": "Medium. Enables attackers to harvest verified email addresses, vehicle VINs, and user IDs across the platform to fuel spear-phishing and targeted BOLA exploits.",
                "severity": "Medium",
                "cvss_score": 6.5,
                "remediation": "Apply Data Transfer Objects (DTOs) or API response filtering (e.g. Jackson view or Pydantic response models) to exclude sensitive PII from public responses.",
                "verification_status": "Verified",
                "assessment_question": "Q2"
            }
        ]
        for v in vulns_data:
            db.add(models.Vulnerability(**v))

    # 4. Q3: crAPI Practical Investigation (Multi-step attack flow)
    if db.query(models.CrapiAttackStep).count() == 0:
        steps_data = [
            {
                "step_number": 1,
                "title": "Initial Reconnaissance & Community PII Harvesting",
                "description": "Query the public community posts API to extract vehicle metadata, author UUIDs, and mechanic contact codes.",
                "endpoint": "/community/api/v2/community/posts/recent",
                "http_method": "GET",
                "request_data": "GET /community/api/v2/community/posts/recent?limit=1 HTTP/1.1\nHost: localhost:8888",
                "response_data": "HTTP/1.1 200 OK\n[{\"author\": {\"email\": \"mechanic_mike@crapi.lab\", \"mechanic_code\": \"MECH-9021\"}}]",
                "parameter_modified": "None (Passive Reconnaissance)",
                "behavioral_change": "Revealed active mechanic identifier 'MECH-9021' without requiring administrative privileges.",
                "impact": "Attacker acquires valid internal service IDs needed for subsequent step chaining."
            },
            {
                "step_number": 2,
                "title": "BOLA Parameter Tampering for Vehicle Location",
                "description": "Tester replaces vehicle ID in location tracking URI from self (102) to target vehicle (103).",
                "endpoint": "/identity/api/v2/vehicle/103/location",
                "http_method": "GET",
                "request_data": "GET /identity/api/v2/vehicle/103/location HTTP/1.1\nAuthorization: Bearer [USER_A_TOKEN]",
                "response_data": "HTTP/1.1 200 OK\n{\"vehicleId\": \"103\", \"vin\": \"1FA6P8CF9H5...\", \"latitude\": \"37.7749\", \"longitude\": \"-122.4194\"}",
                "parameter_modified": "Path parameter: vehicleId modified from 102 to 103",
                "behavioral_change": "Server bypassed ownership validation and returned GPS coordinates for User B's vehicle.",
                "impact": "Physical location tracking of unauthorized target vehicle."
            },
            {
                "step_number": 3,
                "title": "Mechanic Contact Service Request Injection",
                "description": "Tester invokes the mechanic dispatch API, supplying target vehicle's VIN and an attacker-controlled mechanic code.",
                "endpoint": "/workshop/api/merchant/contact_mechanic",
                "http_method": "POST",
                "request_data": "POST /workshop/api/merchant/contact_mechanic HTTP/1.1\nContent-Type: application/json\n\n{\"mechanic_code\": \"MECH-ATTACKER-01\", \"vin\": \"1FA6P8CF9H5...\", \"problem_details\": \"Urgent check\"}",
                "response_data": "HTTP/1.1 200 OK\n{\"status\": \"SENT\", \"message\": \"Service request dispatched to mechanic email.\"}",
                "parameter_modified": "mechanic_code swapped with attacker mail sink address",
                "behavioral_change": "Backend transmitted full vehicle diagnostic report and owner records to external email mailbox.",
                "impact": "Exfiltration of vehicle telemetry, security diagnostic history, and owner identity."
            }
        ]
        for s in steps_data:
            db.add(models.CrapiAttackStep(**s))

    # 5. Q4: BOLA Scenario
    if db.query(models.BolaTestCase).count() == 0:
        bola_case = models.BolaTestCase(
            case_code="BOLA-01",
            title="User Profile Access via IDOR / BOLA",
            endpoint="/api/users/{id}/profile",
            user_a_identifier="user_a_test@lab.internal (ID: 102)",
            user_b_test_identifier="user_b_test@lab.internal (ID: 103)",
            original_object_id="102",
            modified_object_id="103",
            original_response="HTTP/1.1 200 OK\n{\n  \"id\": 102,\n  \"name\": \"User A\",\n  \"email\": \"user_a@lab.internal\",\n  \"role\": \"Customer\"\n}",
            modified_response="HTTP/1.1 200 OK\n{\n  \"id\": 103,\n  \"name\": \"User B\",\n  \"email\": \"user_b@lab.internal\",\n  \"role\": \"Customer\",\n  \"credit_balance\": 450.00\n}",
            http_status=200,
            auth_result="Vulnerable",
            evidence="Replaying GET /api/users/103/profile using User A's Authorization token returned HTTP 200 OK with User B's profile data.",
            impact="Unauthorized disclosure of sensitive profile information, billing balance, and personal identifiable information.",
            remediation="Enforce server-side authorization: verify that the user ID in the JWT matches the requested object ID before returning data."
        )
        db.add(bola_case)

    # 6. Q5: Authorization Testing Matrix
    if db.query(models.AuthMatrixTest).count() == 0:
        matrix_rows = [
            {
                "test_code": "T1",
                "user_label": "User A",
                "user_privilege": "Standard User",
                "target_object": "User A Profile / Object",
                "operation": "READ",
                "expected_result": "Allowed",
                "actual_result": "Allowed",
                "status_match": True,
                "notes": "User A reading own object. Baseline check succeeds."
            },
            {
                "test_code": "T2",
                "user_label": "User A",
                "user_privilege": "Standard User",
                "target_object": "User B Profile / Object",
                "operation": "READ",
                "expected_result": "Denied",
                "actual_result": "Allowed",
                "status_match": False,
                "notes": "FAIL: User A can read User B's private object. Demonstrates BOLA / Authorization failure."
            },
            {
                "test_code": "T3",
                "user_label": "User A",
                "user_privilege": "Standard User",
                "target_object": "User B Profile / Object",
                "operation": "MODIFY",
                "expected_result": "Denied",
                "actual_result": "Allowed",
                "status_match": False,
                "notes": "FAIL: User A can modify User B's object properties via PUT /api/users/103/profile."
            },
            {
                "test_code": "T4",
                "user_label": "User A",
                "user_privilege": "Standard User",
                "target_object": "User B Profile / Object",
                "operation": "DELETE",
                "expected_result": "Denied",
                "actual_result": "Denied",
                "status_match": True,
                "notes": "PASS: User A cannot delete User B's object. Returns HTTP 403 Forbidden."
            },
            {
                "test_code": "T5",
                "user_label": "User B",
                "user_privilege": "Standard User",
                "target_object": "User A Vehicle Record",
                "operation": "READ",
                "expected_result": "Denied",
                "actual_result": "Allowed",
                "status_match": False,
                "notes": "FAIL: Symmetrical BOLA confirmed. User B can view User A's vehicle location."
            },
            {
                "test_code": "T6",
                "user_label": "User B",
                "user_privilege": "Standard User",
                "target_object": "System Admin Settings",
                "operation": "READ",
                "expected_result": "Denied",
                "actual_result": "Denied",
                "status_match": True,
                "notes": "PASS: Role-based function level check rejects standard users."
            }
        ]
        for m in matrix_rows:
            db.add(models.AuthMatrixTest(**m))

    # 7. Q6: OTP Bypass Investigations
    if db.query(models.OtpInvestigation).count() == 0:
        otp_cases_data = [
            {
                "test_code": "OTP-01",
                "scenario_title": "Client-Side-Only OTP Verification Bypass",
                "normal_flow_step": "Step 5 & 6: Client submits OTP -> Server validates -> Server issues reset token.",
                "suspected_weakness": "Client-Side-Only OTP Validation",
                "original_request": "POST /identity/api/auth/v3/check-otp HTTP/1.1\n{\"email\": \"victim@crapi.lab\", \"otp\": \"0000\"}",
                "modified_request": "Interception showed mobile client checking 'isOtpValid' flag in response before redirecting to reset password screen.",
                "server_response": "HTTP/1.1 200 OK\n{\"status\": \"PENDING\", \"expected_hash\": \"...\", \"valid\": false}",
                "http_status": 200,
                "test_result": "Vulnerable",
                "security_impact": "An attacker can intercept response using Burp Suite, change 'valid' to true, and bypass client-side verification gate.",
                "recommended_remediation": "Move all verification logic to server. Never expose expected OTP tokens or rely on client-side boolean flags."
            },
            {
                "test_code": "OTP-02",
                "scenario_title": "Missing Rate Limiting & OTP Brute-Force",
                "normal_flow_step": "Step 6: Server evaluates submitted 4-digit OTP against storage.",
                "suspected_weakness": "Insufficient Attempt Restrictions",
                "original_request": "POST /identity/api/auth/v3/check-otp HTTP/1.1\n{\"email\": \"victim@crapi.lab\", \"otp\": \"1234\"}",
                "modified_request": "Burp Intruder automated 1,000 requests testing OTP range 0000-0999 without trigger delay.",
                "server_response": "HTTP/1.1 200 OK (no HTTP 429 Too Many Requests observed)",
                "http_status": 200,
                "test_result": "Vulnerable",
                "security_impact": "4-digit OTP has only 10,000 combinations. Without rate limiting, an attacker guesses the code within 30 seconds.",
                "recommended_remediation": "Lock account or invalidate OTP session after 3-5 failed verification attempts. Use 6-digit cryptographically secure codes."
            }
        ]
        for oc in otp_cases_data:
            db.add(models.OtpInvestigation(**oc))

    # 8. Q7: OTP Authentication Security Review (5 Required Controls)
    if db.query(models.OtpControlReview).count() == 0:
        reviews_data = [
            {
                "control_id": "CTRL-01",
                "control_name": "Server-Side OTP Validation",
                "description": "Validation of the one-time passcode must occur exclusively within the protected server backend. The client must never receive the plaintext OTP or validation hashes.",
                "why_important": "Ensures attackers cannot reverse-engineer client code or manipulate HTTP response payloads to satisfy the verification gate.",
                "risk_if_missing": "Client-side validation bypass using proxy interception (e.g. altering JSON responses) or bytecode patching.",
                "recommended_implementation": "Evaluate OTP in server controller using constant-time comparison algorithms (e.g. hmac.compare_digest).",
                "status": "Implemented",
                "audit_notes": "Verified server-side validation logic in backend auth controllers."
            },
            {
                "control_id": "CTRL-02",
                "control_name": "OTP Expiry & Time-to-Live (TTL)",
                "description": "One-time passcodes must possess a strict, brief expiration window (recommended 3 to 5 minutes maximum).",
                "why_important": "Limits the temporal window during which an intercepted or brute-forced OTP can be successfully redeemed.",
                "risk_if_missing": "Stale OTP replay attacks; attackers can harvest old codes from unmonitored test channels and authenticate at will.",
                "recommended_implementation": "Store OTPs with Redis TTL expiry (e.g., SETEX otp:user102 300 481920) or SQL timestamp checks.",
                "status": "Implemented",
                "audit_notes": "crAPI default TTL is set to 300 seconds."
            },
            {
                "control_id": "CTRL-03",
                "control_name": "OTP Attempt Limits & Rate Limiting",
                "description": "Enforce strict limits on failed submission attempts per account and per IP address (e.g., maximum 3-5 attempts before code invalidation).",
                "why_important": "Prevents online brute-force enumeration of 4-digit or 6-digit OTP code spaces.",
                "risk_if_missing": "Trivial automated brute-force attacks via Burp Suite Intruder or custom scripts in under 1 minute.",
                "recommended_implementation": "Track failed attempts in distributed memory cache; on 5th failure, invalidate the OTP session and require new request.",
                "status": "Not Implemented",
                "audit_notes": "Deficiency found: no rate limiting detected on check-otp endpoint in assessment lab."
            },
            {
                "control_id": "CTRL-04",
                "control_name": "Replay Protection (Single-Use Token)",
                "description": "An OTP must be immediately invalidated and purged from storage upon first successful evaluation.",
                "why_important": "Guarantees that a code cannot be reused if network traffic is sniffed or cached in proxy logs.",
                "risk_if_missing": "Network adversaries or malicious intermediaries can replay verified requests to forge unauthorized password resets.",
                "recommended_implementation": "Execute atomic GETDEL or database transaction that marks the OTP as REDEEMED upon verification.",
                "status": "Implemented",
                "audit_notes": "OTP invalidated upon successful verification in test lab."
            },
            {
                "control_id": "CTRL-05",
                "control_name": "Secure Session & Token Handling",
                "description": "Upon successful verification, the backend must issue an ephemeral, cryptographically signed token (JWT or session cookie) with appropriate flags (HttpOnly, Secure, SameSite).",
                "why_important": "Prevents session fixation, token theft via cross-site scripting (XSS), and unauthorized privilege inheritance.",
                "risk_if_missing": "Session hijacking, persistent access after credential updates, or CSRF attacks against sensitive user actions.",
                "recommended_implementation": "Issue RS256/ES256 signed JWTs with short expiry (15 mins) and refresh token rotation.",
                "status": "Not Verified",
                "audit_notes": "JWT token lacks HttpOnly cookie delivery; currently returned in raw JSON response body."
            }
        ]
        for r in reviews_data:
            db.add(models.OtpControlReview(**r))

    # 9. Q8 & Q9: APK Analysis & Secret Leaks
    if db.query(models.ApkAnalysisRecord).count() == 0:
        apk_rec = models.ApkAnalysisRecord(
            file_name="crAPI_Mobile_Client_v1.0.4.apk",
            file_size=15482910, # ~14.7 MB
            file_hash_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            package_name="com.crapi.android.client",
            version_name="1.0.4-release",
            version_code="104",
            min_sdk="26",
            target_sdk="34",
            activities_count=7,
            services_count=2,
            receivers_count=1,
            providers_count=0,
            permissions_json=json.dumps([
                "android.permission.INTERNET",
                "android.permission.ACCESS_NETWORK_STATE",
                "android.permission.ACCESS_FINE_LOCATION"
            ]),
            decompiled_dir="/uploads/apk/crAPI_Mobile_Client_v1.0.4",
            jadx_used=True
        )
        db.add(apk_rec)
        db.commit()
        db.refresh(apk_rec)

        apk_findings_data = [
            {
                "apk_id": apk_rec.id,
                "finding_code": "APK-SEC-001",
                "finding_type": "Google API Key",
                "location_class": "com.crapi.client.config.AppConstants",
                "sensitivity": "High",
                "value_preview": "AIzaSyD-7k...****...XyZ1",
                "full_description": "Hardcoded Google Maps and Places API key discovered in decompiled string resources and bytecode.",
                "recommended_action": "Apply application restriction (SHA-1 fingerprint & package name) and API restriction in Google Cloud Console."
            },
            {
                "apk_id": apk_rec.id,
                "finding_code": "APK-SEC-002",
                "finding_type": "Production API Endpoint",
                "location_class": "com.crapi.client.network.RetrofitInstance",
                "sensitivity": "Medium",
                "value_preview": "http://crapi.lab.internal:8888/identity/api/auth/v3",
                "full_description": "Direct internal server base URL embedded in Retrofit network builder.",
                "recommended_action": "Use environment variables or BuildConfig parameters instead of static source code constants."
            },
            {
                "apk_id": apk_rec.id,
                "finding_code": "APK-SEC-003",
                "finding_type": "Hidden API Endpoint",
                "location_class": "com.crapi.client.network.UserApiService",
                "sensitivity": "High",
                "value_preview": "http://crapi.lab.internal:8888/identity/api/v2/vehicle/{vehicleId}/location",
                "full_description": "Unadvertised vehicle tracking endpoint discovered in mobile service interface.",
                "recommended_action": "Enforce backend authorization checks on vehicleId; mobile obfuscation alone does not protect hidden routes."
            },
            {
                "apk_id": apk_rec.id,
                "finding_code": "APK-SEC-004",
                "finding_type": "Token-like String",
                "location_class": "com.crapi.client.auth.SessionManager",
                "sensitivity": "High",
                "value_preview": "eyJhbGciOiJIUzI1Ni...****...Qssw5c",
                "full_description": "Mock administrative JWT bearer token bundled in test assets.",
                "recommended_action": "Exclude test mock data from production release artifacts using ProGuard/R8 packaging rules."
            }
        ]
        for af in apk_findings_data:
            db.add(models.ApkFinding(**af))

    # Q9: APK Leak Scenario
    if db.query(models.ApkLeakScenario).count() == 0:
        leak_scenario = models.ApkLeakScenario(
            leak_code="LEAK-01",
            leak_title="Exposed Google Maps API Key & Internal Backend Route in APK",
            finding_ref="APK-SEC-001 (Google API Key) & APK-SEC-002 (API Endpoint)",
            endpoint_identified="http://crapi.lab.internal:8888/identity/api/v2/vehicle/location",
            is_sensitive="Confirmed Sensitive",
            is_public_intended="Secret/Confidential",
            is_still_valid="Active/Valid (Lab Target)",
            permissions_granted="Google Maps JavaScript & Places API Quota",
            business_impact="Unauthorized usage of cloud service quotas, financial billing exhaustion, and potential map data manipulation.",
            developer_remediation="1. Rotate the key immediately.\n2. Restrict key usage by Android Package Name and SHA-1 certificate fingerprint in Google Cloud Console.\n3. Move backend routing and proprietary API calls behind a secure API Gateway.\n4. Enable Proguard/DexGuard code obfuscation.",
            status="Documented & Remediated"
        )
        db.add(leak_scenario)

    # 10. Q10: Integrated Pentester Decision-Making Plan
    if db.query(models.IntegratedAssessmentPlan).count() == 0:
        plan_steps = [
            {"step": 1, "name": "APK Static Decompilation with JADX", "status": "Completed", "notes": "Decompile APK; inspect AndroidManifest.xml, permissions, and network security configs."},
            {"step": 2, "name": "Extract Hidden API Endpoints & Routes", "status": "Completed", "notes": "Identify unadvertised backend endpoints (e.g. /vehicle/{id}/location, /contact_mechanic)."},
            {"step": 3, "name": "Map Object Identifier Parameters", "status": "Completed", "notes": "Identify object parameters (vehicleId, userId, orderId) exposed in URI paths or JSON payloads."},
            {"step": 4, "name": "Map Authentication & Token Schemes", "status": "Completed", "notes": "Record headers, Bearer JWT validation, and public unauthenticated routes."},
            {"step": 5, "name": "Controlled BOLA Verification with Synthetic Accounts", "status": "Completed", "notes": "Execute dual-user replay test (User A vs User B) to confirm authorization boundaries."},
            {"step": 6, "name": "Analyze OTP Authentication Lifecycle", "status": "Completed", "notes": "Intercept OTP flows in Burp Suite; evaluate client validation bypass and step-skipping."},
            {"step": 7, "name": "Collect Sanitized Technical Evidence", "status": "Completed", "notes": "Redact live passwords, PII, and full auth tokens before logging evidence."},
            {"step": 8, "name": "Model Business & Data Privacy Impact", "status": "Completed", "notes": "Evaluate regulatory compliance (GDPR/HIPAA) and financial loss vectors."},
            {"step": 9, "name": "Assign Standardized CVSS v3.1 Severity", "status": "Completed", "notes": "Score findings: BOLA (High 8.5), PII Leak (Medium 6.5), OTP Weakness (High 7.5)."},
            {"step": 10, "name": "Compile Comprehensive Technical Report", "status": "Completed", "notes": "Generate PDF and DOCX technical deliverables detailing findings, PoC, and fixes."}
        ]
        plan = models.IntegratedAssessmentPlan(
            title="Comprehensive Mobile & API Penetration Testing Assessment Plan",
            scope_description="Assessment of mobile APK client, hidden REST APIs, object authorization barriers, and OTP lifecycle.",
            steps_json=json.dumps(plan_steps),
            status="Completed",
            risk_summary="High risk due to unvalidated object-level authorization (BOLA) and client-side authentication assumptions.",
            data_protection_precautions="All testing restricted to synthetic test accounts (ID 102 & 103). All credentials and PII redacted in logs.",
            remediation_summary="Implement server-side user-to-object ownership validation, enforce server-side OTP state machines, and rotate embedded API keys."
        )
        db.add(plan)

    # 11. Centralized Evidence Management
    if db.query(models.Evidence).count() == 0:
        evidences = [
            {
                "evidence_id": "EVD-001",
                "title": "API Reconnaissance Attack Surface Table (crAPI)",
                "related_question": "Q1",
                "vulnerability_category": "API Reconnaissance",
                "description": "Structured reconnaissance table cataloging 10 REST endpoints with methods, parameters, and auth requirements.",
                "file_type": "JSON",
                "related_endpoint": "/identity/api/v2/user/dashboard",
                "redacted_content": "GET /identity/api/v2/user/dashboard HTTP/1.1\nAuthorization: Bearer [REDACTED_TOKEN]\nHTTP/1.1 200 OK\n{\"user\": {\"id\": 102, \"vehicles\": [\"102\"]}}"
            },
            {
                "evidence_id": "EVD-002",
                "title": "BOLA Proof of Concept: Vehicle Location Exposure",
                "related_question": "Q2",
                "vulnerability_category": "Broken Object Level Authorization",
                "description": "HTTP request and response transcript showing User A accessing User B's vehicle coordinates.",
                "file_type": "TXT",
                "related_endpoint": "/identity/api/v2/vehicle/103/location",
                "redacted_content": "GET /identity/api/v2/vehicle/103/location HTTP/1.1\nHost: localhost:8888\nAuthorization: Bearer eyJhbGci...[REDACTED_USER_A]...\n\nHTTP/1.1 200 OK\n{\"vehicleId\": \"103\", \"latitude\": \"37.7749\", \"longitude\": \"-122.4194\"}"
            },
            {
                "evidence_id": "EVD-003",
                "title": "Multi-Step Attack Flow: PII Harvest to Mechanic Dispatch",
                "related_question": "Q3",
                "vulnerability_category": "Attack Path Chaining",
                "description": "Compound attack chain connecting forum PII leak, BOLA vehicle tracking, and forged mechanic dispatch.",
                "file_type": "TXT",
                "related_endpoint": "/workshop/api/merchant/contact_mechanic",
                "redacted_content": "Step 1: Extracted mechanic code MECH-9021\nStep 2: Obtained victim VIN 1FA6P8CF9H5...\nStep 3: Dispatched vehicle telemetry to attacker mailbox."
            },
            {
                "evidence_id": "EVD-004",
                "title": "Dual-User BOLA Comparison (User A vs User B)",
                "related_question": "Q4",
                "vulnerability_category": "BOLA / IDOR",
                "description": "Replay verification proving that swapping ID 102 with 103 bypasses tenant isolation.",
                "file_type": "JSON",
                "related_endpoint": "/api/users/102/profile",
                "redacted_content": "GET /api/users/103/profile HTTP/1.1\nResult: 200 OK with User B private record."
            },
            {
                "evidence_id": "EVD-005",
                "title": "Dual-User Permission Matrix Test Results",
                "related_question": "Q5",
                "vulnerability_category": "Authorization Testing",
                "description": "Matrix test executions proving unauthorized READ and MODIFY across tenants while DELETE was rejected.",
                "file_type": "TXT",
                "related_endpoint": "Cross-Object Testing",
                "redacted_content": "T1: READ User A -> Allowed (PASS)\nT2: READ User B -> Allowed (FAIL - BOLA)\nT3: MODIFY User B -> Allowed (FAIL - BOLA)\nT4: DELETE User B -> Denied (PASS)"
            },
            {
                "evidence_id": "EVD-006",
                "title": "JADX Decompiled Bytecode Secrets & Endpoints",
                "related_question": "Q8",
                "vulnerability_category": "Android APK Static Analysis",
                "description": "Decompiled Dalvik string pool showing hardcoded Google API key, JWT mock token, and internal staging URLs.",
                "file_type": "TXT",
                "related_endpoint": "com.crapi.client.config.AppConstants",
                "redacted_content": "public static final String GOOGLE_KEY = \"AIzaSyD-7k...****...XyZ1\";\npublic static final String API_BASE = \"http://crapi.lab.internal:8888\";"
            }
        ]
        for ev in evidences:
            db.add(models.Evidence(**ev))

    db.commit()
    print("Initial assessment seed data loaded successfully into database!")

