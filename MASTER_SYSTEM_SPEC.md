# MASTER SYSTEM SPECIFICATION: Maintenance & Quality Control SaaS

## Section 1: System Goals
ระบบมีเป้าหมายหลัก 13 ประการดังนี้:
1. รับแจ้งงานซ่อมจากสาขา (Branch Incident Reporting)
2. จัดการใบงานหนึ่งใบที่มีหลายจุดซ่อม (One-to-Many Ticket Items)
3. ให้เจ้าหน้าที่ส่วนกลางคัดกรองและจัดสรรทีมช่าง (Centralized Dispatching & Screening)
4. ติดตามการลงพื้นที่ด้วย Check-in/GPS (Location Tracking)
5. ตรวจรับคุณภาพงานโดยผู้จัดการสาขา (On-site Manager Quality Assurance)
6. รองรับ Reject/Rework แบบไม่จำกัดรอบ (Unlimited Rework Cycles with History)
7. รองรับ Re-assign เมื่อจำเป็น (Dynamic Team Re-assignment)
8. คำนวณระยะทางและค่าเดินทาง (Distance & Fuel Cost Calculation)
9. เก็บประวัติย้อนหลังแบบตรวจสอบได้ (Comprehensive Audit Trail)
10. รองรับสิทธิ์ตามประวัติสังกัดของผู้ใช้ (Historical RBAC)
11. Dashboard/Notification (Real-time Monitoring & Alerting)
12. Offline/Sync (Offline Mode Support)
13. Backup และ Archive (Data Retention & Safeguarding)

## Section 2: Technology Architecture
* Frontend: Cloudflare Pages (Hosting) + SPA (Vanilla JS/React) + HTML/CSS/JS + IndexedDB (Offline Storage)
* Backend: Google Apps Script (GAS) acting as REST API + Google Sheets (Database) + Google Drive (File Storage) + PropertiesService (Secrets) + CacheService (Rate limit) + LockService (Concurrency)
* Source Control: GitHub -> Cloudflare Pages (frontend deployment), GitHub -> clasp -> GAS (backend deployment)
* Environments: Separate DEV (Development) and PROD (Production) with distinct GCP projects/Sheets.

## Section 3: Security Architecture
Flow: Internet -> Cloudflare (DDoS protection, WAF, Rate Limiting) -> Cloudflare Pages (HTTPS, CSP, Security Headers) -> GAS API (Auth, AuthZ, Historical RBAC, Input Validation, Workflow Validation, Rate Limit, Idempotency, LockService, Audit Log) -> Google Sheets/Drive.
Zero Trust model: Every request is verified. Frontend is not a security boundary.

## Section 4: Script Properties
What to store in GAS Script Properties: 
APP_ENV, APP_VERSION, DB_SPREADSHEET_ID, DRIVE_ATTACHMENT_FOLDER_ID, DRIVE_BACKUP_FOLDER_ID, LIFE360_USERNAME, LIFE360_PASSWORD, LIFE360_CLIENT_TOKEN, SESSION_SECRET, API_SECRET, BACKUP_ENABLED, NOTIFICATION_ENABLED.
Strict Rules:
- DO NOT store passwords, API secrets, Life360 credentials, or session secrets in frontend or GitHub.
- DO NOT store application data (Users, Tickets, Teams, Fuel Records) in Script Properties.

## Section 5: Authentication
Flow: 
1. User provides credentials -> Login API.
2. GAS checks user credentials (hashed).
3. If valid, create Session record in DB, sign token (JWT/HMAC).
4. Send Token to Frontend.
Every API request from Frontend must include Token in Authorization header. GAS validates Token and Session validity before processing.

## Section 6: Roles
### Central Admin
* Scope: All branches, all teams, all tickets.
* Duties: Manage system master data, control work types, assign teams, re-assign tickets, manage urgent cases, adjust calculated distance/fuel, view reports, view archives, rollback/correction if strictly required.

### Branch Manager
* Scope: Own branch (based on historical assignment), historical data from assigned period.
* Duties: Create tickets, review work, reject (Rework), approve, close ticket, input satisfaction score, view timeline.

### Technician / Team
* Scope: Assigned tickets, historical data from team assignment period.
* Duties: View own tickets, Check-in (GPS), work in progress, submit for review, fix rejected work (rework), attach evidence photos.

## Section 7: Historical RBAC
Rule: NEVER use only current_team_id/current_branch_id for access checks.
Mechanism: User_Assignment_History table must be queried.
Columns: assignment_id, user_id, role, branch_id, team_id, effective_from, effective_to, assigned_by, reason.
Example: EMP001 was TEAM-A from 01/01/2026-20/07/2026, then TEAM-B from 21/07/2026. A ticket from 15/07/2026 checked today must validate against Team-A context.

## Section 8: Main Ticket Workflow (State Machine)
States: SUBMITTED -> WAITING_ASSIGNMENT -> ASSIGNED -> CHECKED_IN -> IN_PROGRESS -> WAITING_REVIEW -> COMPLETED -> CLOSED.
Branch paths: WAITING_REVIEW -> REWORK -> IN_PROGRESS. (Cancel possible before completion).
Validation: Backend must strictly validate state transitions.
Valid transitions:
- SUBMITTED -> WAITING_ASSIGNMENT
- WAITING_ASSIGNMENT -> ASSIGNED
- ASSIGNED -> CHECKED_IN
- CHECKED_IN -> IN_PROGRESS
- IN_PROGRESS -> WAITING_REVIEW
- WAITING_REVIEW -> REWORK (Reject)
- REWORK -> IN_PROGRESS (or directly to WAITING_REVIEW upon resubmit)
- WAITING_REVIEW -> COMPLETED (Approve)
- COMPLETED -> CLOSED
Invalid transitions: WAITING_REVIEW -> CLOSED, ASSIGNED -> COMPLETED.

## Section 9: One Ticket Multiple Items
Structure: 1 Ticket maps to N Ticket_Items.
Ticket MT-00001 (e.g., Branch A Incident) can have items:
1. AC broken
2. Lights not working
3. Door broken
Workflow operates at the Ticket level, but items track specific fixes.

## Section 10: Ticket Status
Complete state machine defined in Section 8. Status changes must log to Activity_Log and update Ticket.status.

## Section 11: Assignment
Table: Work_Assignments
Columns: assignment_id, ticket_id, team_id, technician_id, assigned_by, assigned_at, accepted_at, released_at, assignment_status, transfer_reason, transfer_to_assignment_id.
Rule: Must preserve full assignment history when re-assigning. Old assignment is marked and linked to new.

## Section 12: Re-assign Flow
1. Central Admin opens re-assign UI.
2. System shows available teams.
3. Admin selects new team and inputs transfer_reason (mandatory).
4. System confirms.
5. Backend sets old assignment status = TRANSFERRED, linked to new assignment.
6. Backend creates new assignment. Ticket status = ASSIGNED.
7. Admin shares ticket details to new team manually (e.g., via LINE).

## Section 13: Work Session
Table: Work_Sessions
Columns: session_id, ticket_id, assignment_id, session_no, started_at, ended_at, work_status, technician_note, submitted_at.
Purpose: Tracks actual work periods, supporting multiple rework rounds.

## Section 14: Reject/Rework
Unlimited reject rounds. 
Flow:
1. Ticket is WAITING_REVIEW.
2. Branch Manager rejects -> inputs mandatory reason.
3. Ticket state -> REWORK. Review Round increments.
4. Notify Admin & Team.
5. Team performs fix -> submits -> state back to WAITING_REVIEW.
Original team can fix without re-accepting. Admin can intervene and re-assign if needed.

## Section 15: Reviews
Table: Reviews
Columns: review_id, ticket_id, assignment_id, reviewer_id, review_round, result (APPROVED/REJECTED), reason, reviewed_at.
Rule: NEVER overwrite old reviews. Each review creates a new persistent record.

## Section 16: Reject Timeline
Dashboard UI must show reject count. Click to expand full timeline of each round showing: timestamp, reviewer, result, reason, and attached photos.

## Section 17: Manager Review
Business Rule: Branch Manager MUST physically inspect work on-site before clicking Approve. System relies on manager integrity but records timestamp and location if available.

## Section 18: Close Job
Flow: Manager Approve (COMPLETED) -> Manager Inputs Satisfaction Score -> Admin/Manager Confirm Close -> Ticket State = CLOSED -> System archives transaction.

## Section 19: Satisfaction
Table: Satisfaction_Scores
Columns: satisfaction_id, ticket_id, reviewer_id, score, comment, created_at.
Score format is configurable (e.g., 1-5).

## Section 20: GPS/Check-in
Table: GPS_Checkins
Columns: gps_id, ticket_id, assignment_id, technician_id, checkin_type (ARRIVAL/START/SUBMIT), latitude, longitude, accuracy, device_time, server_time, source, created_at.
Rule: Raw GPS data must NEVER be overwritten.

## Section 21: Life360
Integration: Life360 API -> Circle -> Members -> Location.
Purpose: Independent location tracking for technicians.
Constraints: Credentials strictly in Script Properties. Avoid rate-limiting by caching or polling at safe intervals.

## Section 22: Distance Calculation
Table: Distance_Calculations
Columns: distance_id, ticket_id, from_gps_id, to_gps_id, straight_distance_km, road_distance_km, calculation_method, calculated_at, calculated_version.
Rule: Separation of concerns. Raw GPS -> Calculated Distance -> Admin Review -> Approved Distance.

## Section 23: Travel Origin
Concept: Daily Trip Session. Origin starts from the first system open/check-in of the day. Admin manually reviews overnight stays or multi-day trips.

## Section 24: Fuel Rate
Table: Fuel_Rates
Columns: rate_id, effective_date, rate_per_km, created_by, created_at, status.
Formula: Final Distance x rate_per_km.

## Section 25: Fuel Adjustment
Admin feature to adjust calculated distance/amount.
Must store: system_distance, adjusted_distance, system_amount, adjusted_amount, reason, adjusted_by, adjusted_at.
Rule: NEVER overwrite original system values.

## Section 26: Security - XSS Protection
Frontend MUST use textContent instead of innerHTML for DOM manipulation. Implement Strict CSP, X-Content-Type-Options, Referrer-Policy, HSTS.

## Section 27: Security - Spreadsheet Injection
Backend MUST sanitize all inputs before writing to Google Sheets. Check and escape data starting with '=', '+', '-', '@' to prevent formula injection.

## Section 28: Security - DNS
Custom Domain managed via Cloudflare. DNSSEC enabled. HTTPS strictly enforced with HSTS.

## Section 29: Security - DDoS
Cloudflare protections enabled. Backend implements Rate Limiting (CacheService), Request Validation, Quota Protection, and LockService to prevent abuse.

## Section 30: Security - Session
Sessions are short-lived. Expiry enforced. Support logout and force logout. Implement token rotation if long sessions are needed.

## Section 31: Security - Password
Passwords MUST be hashed (e.g., PBKDF2/bcrypt if supported, or SHA-256 with salt). NEVER store plain text. NEVER send passwords back to frontend.

## Section 32: Security - Google Sheets
Sheets MUST be private. Access is exclusively through GAS executing as the developer/system account, restricted by application RBAC.

## Section 33: Security - Google Drive
Folders MUST have limited permissions. No public view links by default. Access controlled via API serving proxies or temporary permissions.

## Section 34: Security - Audit Log
Table: Activity_Log (Append-only)
Columns: log_id, timestamp, user_id, role, action, entity_type, entity_id, old_value, new_value, reason, metadata_json.

## Section 35: Security - Concurrency & Idempotency
Use GAS LockService for critical operations: Assign, Reassign, Approve, Reject, Close, Fuel Adjustment.
Implement Idempotency using request_id + ticket.version to prevent double-submit.

## Section 36: Offline Mode
Frontend implements Service Worker and IndexedDB for offline queueing. Data syncs when online. Backend implements version conflict detection (ticket.version) during sync.

## Section 37: Notification
Frontend: Dashboard popup. 
Backend: Email alerts. 
Events triggering notification: New Ticket, Assigned, Rejected, Reassigned, Submitted, Approved, Closed. 
Preview payload: branch, team, work type, reject round, reason.

## Section 38: LINE Integration
Manual share by Admin only. System generates text block.
Message content: branch, work type, brief description, team, system link. Not a core API dependency.

## Section 39: Remember Me
Browser session persistence implemented securely per security policy (HttpOnly cookies if possible, or secure local storage with short-lived tokens and refresh mechanism).

## Section 40: File Upload Security
Validation: Backend MUST validate file type, MIME type, file size, extension, and filename. Executable files strictly prohibited. Rename files using UUIDs before storing in Drive.

## Section 41: Database Structure
Tables grouped by category (Google Sheets Tabs):
* MASTER: Users, Branches, Teams, Fuel_Rates, User_Assignment_History
* TICKET: Tickets, Ticket_Items, Work_Assignments, Work_Sessions
* GPS/FUEL: GPS_Checkins, Distance_Calculations
* QUALITY: Reviews, Satisfaction_Scores
* SYSTEM: Activity_Log, Sessions
* ARCHIVE: Archived_Tickets (JSON blob of closed tickets)

Field definitions (examples):
Tickets: ticket_id, branch_id, created_by, created_at, status, version
Ticket_Items: item_id, ticket_id, description, status
Users: user_id, username, password_hash, salt, role, active

## Section 42: Data Relationships
* Users (1) -> (N) User_Assignment_History
* Tickets (1) -> (N) Ticket_Items
* Tickets (1) -> (N) Work_Assignments
* Work_Assignments (1) -> (N) Work_Sessions
* Tickets (1) -> (N) Reviews
* Tickets (1) -> (N) GPS_Checkins

## Section 43: Backend Structure
GAS file structure:
- Code.gs (Entry point, doGet/doPost)
- Router.gs (Action routing)
- Auth.gs (Authentication/Session)
- RBAC.gs (Historical access checks)
- Validation.gs (Input & State validation)
- TicketService.gs (Business logic)
- DB.gs (Google Sheets operations)
Flow: Router -> Auth -> RBAC -> Validation -> Service -> DB.

## Section 44: API Design
Action Router pattern via HTTP POST.
Payload format: `{ "action": "ticket.create", "payload": { ... }, "token": "..." }`
Endpoints list:
- auth.login
- auth.logout
- ticket.create
- ticket.list
- ticket.get
- ticket.assign
- ticket.reassign
- ticket.checkin
- ticket.submit
- ticket.review
- ticket.close
- user.history

## Section 45: Archive
When ticket state becomes CLOSED, a background trigger creates an archive package (JSON aggregation of all ticket data, items, reviews, logs) and writes to Archive sheet or Google Drive, reducing load on active sheets.

## Section 46: Backup
Daily snapshot of Google Sheets. Weekly full backup to Drive. Long-term archive backup. Tracked in Backup_Log table.

## Section 47: Dashboard
Admin UI includes: Data Table, Kanban board, Notification panel, Timeline view, Filters, Search, Summary stats.
Views: New tickets, waiting assignment, in progress, waiting review, rejected, multi-reject, reassigned, closed, travel costs pending review.

## Section 48: Business Rules
1-20 (Summary of above): Strict state machine, mandatory reasons for reject/reassign, historical RBAC enforcement, no overwriting of raw GPS/reviews, physical inspection mandated, idempotency required.

## Section 49: Security Requirements (SR-01 to SR-25)
Encompasses XSS, Injection, RBAC, LockService, Idempotency, Session management, File validation, and Audit logging as detailed in Sections 26-35.

## Section 50: Prohibited Actions
1. No innerHTML.
2. No direct API secrets in frontend.
3. No overwriting historical data.
4. No bypassing state machine.
5. No deleting log entries.
6. No raw GPS alteration.
7. No plain text passwords.
8. No executable uploads.
9. No current-context RBAC for historical data.
10. No concurrent mutations without LockService.
11. No missing idempotency keys.
12. No spreadsheet injection.
13. No unauthenticated API access.

## Section 51: Final Architecture
A resilient, secure, serverless architecture leveraging Cloudflare edge capabilities, stateless frontend SPA, and robust Google Apps Script REST backend backed by Google Sheets as a relational database, fortified with comprehensive security layers and concurrency controls.

## Section 52: Production Checklist
- [ ] PropertiesService populated.
- [ ] Frontend deployed to Cloudflare Pages with CSP.
- [ ] GAS deployed as Web App (Execute as Developer, Access to Anyone).
- [ ] LockService implemented on mutative endpoints.
- [ ] Password hashes verified.
- [ ] Backup scripts scheduled.
- [ ] Test cases for Historical RBAC passed.
- [ ] DDoS and Rate Limits configured on Cloudflare.
