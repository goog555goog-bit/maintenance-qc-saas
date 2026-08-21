# Maintenance & Quality Control SaaS (ระบบจัดการงานซ่อมบำรุงและควบคุมคุณภาพ)

## 1. Project Overview
ระบบจัดการงานซ่อมบำรุงและควบคุมคุณภาพเป็น Software as a Service (SaaS) model delivered via web application. Core workflow เริ่มจาก Branch Manager สร้าง ticket แจ้งซ่อม จากนั้น Central Admin จะทำการตรวจสอบและ assign team ที่เหมาะสม เมื่อ Technician ได้รับงานจะลงพื้นที่ปฏิบัติงาน (works + checks in) และส่งมอบงานกลับมาให้ Branch Manager ตรวจสอบ (reviews) ซึ่งสามารถ Reject/Rework ได้จนกว่าจะผ่าน เมื่อผ่านแล้วระบบจะ Close ticket และ Archive ข้อมูลทั้งหมด

## 2. Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| Frontend | Cloudflare Pages, GitHub, SPA, HTML/CSS/JS, IndexedDB | Single Page Application |
| Backend | Google Apps Script (GAS) | RESTful API endpoint |
| Database | Google Sheets, Google Drive | RDBMS-like structure and File storage |
| Source Control | GitHub, clasp | GitHub -> Cloudflare Pages (frontend), GitHub -> clasp -> GAS (backend) |
| Security | Cloudflare, GAS Auth | Cloudflare DDoS/WAF, GAS Auth/RBAC/Audit log |

## 3. Document Map
*AI Agent: Read these files to understand the project context and requirements.*

| File | Purpose | Read When |
|------|---------|----------|
| `MASTER_SYSTEM_SPEC.md` | Full system requirements, business rules, security, database schema, API design | Always read first |
| `DESIGN_SYSTEM.md` | UI/UX design system, theme, typography, components, tokens | When building any UI |
| `SCREEN_SPEC.md` | Per-screen specification, layouts, components, data flow | When implementing specific screens |

## 4. Agent Instructions
**CRITICAL RULES FOR AI AGENTS (MUST FOLLOW):**
- **MUST** read `MASTER_SYSTEM_SPEC.md` before writing any code.
- **MUST** read `DESIGN_SYSTEM.md` before building any UI component.
- **MUST** follow the workflow state machine exactly as defined.
- **MUST** implement Historical RBAC — never use current_team_id/current_branch_id for historical access.
- **MUST** use server-side validation — frontend is NOT a security boundary.
- **MUST** use LockService in GAS for concurrent operations.
- **MUST** use Append-only pattern for Audit Log.
- **MUST NOT** use Emoji or Unicode Emoji anywhere in code or UI text.
- **MUST NOT** store secrets in frontend code or GitHub repository.
- **MUST NOT** let frontend connect to Google Sheets directly.
- **MUST NOT** overwrite raw GPS data, fuel data, or audit logs.
- **MUST NOT** use `innerHTML` with user input.

## 5. Development Workflow
- **Environments:** DEV and PROD environments must be strictly separate.
- **Backend Deployment:** Deployed to Google Apps Script via `clasp`.
- **Frontend Deployment:** Deployed via GitHub to Cloudflare Pages.
- **Secret Management:** All secrets (API keys, tokens) must be stored in GAS Script Properties.

## 6. Architecture Diagram

[User Client / Browser]
       |
       v (HTTPS)
[Cloudflare Pages] (Frontend SPA, WAF, DDoS Protection)
       |
       v (HTTPS API Calls)
[Google Apps Script] (Backend REST API, Auth, Business Logic)
       |
       +---> [Google Sheets] (Database: Tables, Audit Logs)
       |
       +---> [Google Drive] (File Storage: Images, PDFs)
       |
       +---> [Life360 API] (External GPS Tracking integration)

## 7. Critical Business Rules
1. Branch Manager creates tickets only for their own branch.
2. Draft tickets can be deleted; submitted tickets cannot.
3. SLA calculation starts immediately upon ticket submission.
4. Central Admin must assign a Team before work can begin.
5. Assigned Team must Check-in at the branch location (GPS validation).
6. Check-in must happen within SLA timeframe.
7. Fuel costs are calculated based on origin, destination, and vehicle type.
8. Technician must submit Before and After photos for all tasks.
9. Parts and inventory usage must be recorded before task completion.
10. Branch Manager must review the completed task within 24 hours.
11. Rework requires a new sub-ticket linked to the original.
12. Rejected tasks decrease Technician performance score.
13. Overdue SLA triggers escalation to Area Manager.
14. System must lock ticket modifications during active review.
15. Closed tickets become immutable read-only records.
16. Historical RBAC applies to all read operations.
17. Concurrent modifications must use pessimistic locking.
18. Notifications are dispatched on every state change.
19. Archiving process runs automatically after 90 days of closure.
20. All state changes require an explicit Audit Log entry.

## 8. Security Requirements
1. SR-01: No Direct Database Access from Frontend
2. SR-02: All API endpoints require Authorization Bearer token
3. SR-03: Token expiration must not exceed 8 hours
4. SR-04: Server-side validation for all input payloads
5. SR-05: RBAC validation on every backend request
6. SR-06: Historical Data Access Restriction
7. SR-07: Append-only Audit Log
8. SR-08: No secrets in source code
9. SR-09: No Emoji/Unicode support to prevent injection
10. SR-10: Strict CORS policy implementation
11. SR-11: Rate limiting on authentication endpoints
12. SR-12: XSS prevention via textContent only
13. SR-13: CSRF protection via SameSite cookies/headers
14. SR-14: File upload type validation
15. SR-15: Maximum file size enforcement (10MB limit)
16. SR-16: Antivirus scan for uploaded files
17. SR-17: LockService for concurrent write operations
18. SR-18: Immutable records for Closed/Archived states
19. SR-19: Parameterized queries (GAS equivalent)
20. SR-20: Data masking for sensitive PII in logs
21. SR-21: Audit logs must capture User ID, Timestamp, Action, IP
22. SR-22: GPS coordinates must not be manually editable
23. SR-23: HTTPS mandatory for all communications
24. SR-24: Separation of Duty between Admin and Technician
25. SR-25: Regular security posture review

## 9. Production Checklist (รายการตรวจสอบก่อนขึ้น Production)

### 9.1 Google Apps Script (Backend)

- [ ] สร้างโปรเจกต์ Google Apps Script ใหม่สำหรับ PROD (แยกจาก DEV)
- [ ] คัดลอกไฟล์ `.gs` ทั้ง 23 ไฟล์จากโฟลเดอร์ `backend/` ไปวางใน Apps Script Editor
- [ ] ตั้งค่า Script Properties ให้ครบ:
  - [ ] `DB_SPREADSHEET_ID` — ID ของ Google Sheets ฐานข้อมูล PROD
- [ ] Deploy เป็น Web App:
  - [ ] Execute as: **Me** (บัญชีเจ้าของระบบ)
  - [ ] Who has access: **Anyone**
  - [ ] คัดลอก Web App URL (ลงท้ายด้วย `/exec`) เก็บไว้
- [ ] ทดสอบ `system.ping` ด้วย Postman หรือ `curl` ยืนยันว่าตอบกลับ `{ status: "OK" }`
- [ ] ตรวจสอบว่า `MailApp.sendEmail` ส่ง OTP ได้จริง (ทดสอบด้วย `auth.forgotPassword`)

### 9.2 Google Sheets (Database)

- [ ] สร้าง Google Sheets ใหม่สำหรับ PROD (ไม่ใช้ชีตเดียวกับ DEV)
- [ ] รันฟังก์ชัน `initializeDatabase()` จาก Apps Script เพื่อสร้างตารางทั้ง 25 ชีต
- [ ] ตรวจสอบว่าแถวหัวตาราง (Header Row) ของชีต `Users` ตรงตาม Schema:
  - `user_id | username | email | password_hash | salt | role | active`
  - (ระวังสะกดผิด เช่น `password_hasl` ต้องแก้เป็น `password_hash`)
- [ ] ล็อกชีต `Activity_Log` ไม่ให้แก้ไขด้วยมือ (Protect sheet)
- [ ] ล็อกชีต `GPS_Logs` ไม่ให้แก้ไขด้วยมือ (Protect sheet)
- [ ] ตรวจสอบว่าผู้ใช้เริ่มต้น 3 คนถูกสร้างโดย `initializeDatabase()`:
  - `EMP-0001` (CENTRAL_ADMIN), `EMP-0002` (BRANCH_MANAGER), `EMP-0003` (TECHNICIAN)
  - รหัสผ่านเริ่มต้นคือรหัสพนักงาน (เช่น `EMP-0001`)
- [ ] Share ชีตให้บัญชี Apps Script มีสิทธิ์ Editor

### 9.3 Frontend (Cloudflare Pages)

- [ ] อัปเดตไฟล์ `frontend/src/config.js`:
  - [ ] เปลี่ยน `GAS_API_URL` เป็น Web App URL ของ PROD
- [ ] รัน `npm run build` ใน `frontend/` และยืนยันว่าบิลด์สำเร็จ (exit code 0, ไม่มี error)
- [ ] ตรวจสอบว่าโฟลเดอร์ `frontend/dist/` มีไฟล์ครบ:
  - `index.html`, `favicon.svg`, `assets/index-*.js`, `assets/index-*.css`
- [ ] Push ขึ้น GitHub `main` branch
- [ ] ตรวจสอบว่า Cloudflare Pages ทำ Auto Deploy สำเร็จ (Build log สีเขียว)
- [ ] เปิด Production URL และตรวจสอบว่าหน้า Login โหลดได้ปกติ
- [ ] ทดสอบ Direct URL Access (เช่น `/dashboard/admin`) ไม่เจอ 404

### 9.4 การเชื่อมต่อ Frontend-Backend

- [ ] เข้าสู่ระบบด้วย `EMP-0001` / `EMP-0001` สำเร็จ (เข้าแดชบอร์ด Admin)
- [ ] เข้าสู่ระบบด้วย `EMP-0002` / `EMP-0002` สำเร็จ (เข้าแดชบอร์ด Manager)
- [ ] เข้าสู่ระบบด้วย `EMP-0003` / `EMP-0003` สำเร็จ (เข้าแดชบอร์ด Technician)
- [ ] ทดสอบ Login ผิดรหัส: ระบบแสดงข้อความ "รหัสผ่านไม่ถูกต้อง"
- [ ] ทดสอบออกจากระบบ (Logout) แล้วกลับไปหน้า Login
- [ ] ทดสอบ Token หมดอายุ (8 ชม.) แล้ว Redirect กลับหน้า Login

### 9.5 ความปลอดภัย (Security)

- [ ] เปิด Browser DevTools > Console: ไม่มี Error 404 หรือ Mixed Content
- [ ] ตรวจสอบว่า `GAS_API_URL` ใน `config.js` ใช้ `https://` เท่านั้น
- [ ] ทดสอบเรียก API โดยไม่มี Token: ระบบตอบ "Unauthorized"
- [ ] ตรวจสอบว่า Google Sheets ไม่ได้ Share เป็น Public (ต้อง Share เฉพาะบัญชี Apps Script)
- [ ] ตรวจสอบว่าไม่มี Secret/Password/API Key ใน Source Code บน GitHub
- [ ] ตรวจสอบว่า Script Properties ตั้งค่าถูกต้อง (ไม่ใช้ค่า DEV)

### 9.6 ข้อมูลและฐานข้อมูล

- [ ] ชีต PROD ไม่มีข้อมูลทดสอบ (Mock Data) หลงเหลือ
- [ ] ไฟล์ `database/seed_data.json` ว่างเปล่า (ไม่มี Dummy Users)
- [ ] ตรวจสอบว่าชีตทั้ง 25 ตารางมี Header Row ครบถ้วนและสะกดถูกต้อง
- [ ] ตั้ง Frozen Row (แถวแรก) ให้ทุกชีต เพื่อไม่ให้เลื่อนหัวตารางหาย

### 9.7 การสำรองข้อมูลและการกู้คืน

- [ ] ตั้ง Time-driven Trigger ใน Apps Script สำหรับ Backup อัตโนมัติ (รายวัน)
- [ ] ทดสอบรันฟังก์ชัน Backup ด้วยมือ 1 ครั้ง ตรวจสอบว่าไฟล์ Backup ถูกสร้างใน Drive
- [ ] กำหนดโฟลเดอร์ Google Drive สำหรับเก็บ Backup แยกต่างหาก

### 9.8 การแจ้งเตือนและอีเมล

- [ ] ทดสอบระบบ "ลืมรหัสผ่าน" จากหน้า Login: ได้รับอีเมล OTP 6 หลัก
- [ ] ตรวจสอบว่าอีเมลส่งจากบัญชี Google ของเจ้าของ Apps Script
- [ ] ตรวจสอบ Quota ของ `MailApp`: Free account = 100 อีเมล/วัน, Workspace = 1,500/วัน

### 9.9 สิ่งที่ต้องแจ้งผู้ใช้งาน

- [ ] แจ้งรหัสพนักงานและรหัสผ่านเริ่มต้นให้ Admin คนแรก (`EMP-0001`)
- [ ] แนะนำให้ Admin เปลี่ยนรหัสผ่านทันทีหลังเข้าสู่ระบบครั้งแรก
- [ ] แนะนำให้ผู้ใช้ทุกคนผูกอีเมลในหน้า "โปรไฟล์" เพื่อใช้กู้คืนรหัสผ่านด้วย OTP
- [ ] จัดทำเอกสารแนะนำการใช้งานเบื้องต้นให้ผู้ใช้แต่ละบทบาท (Admin / Manager / Tech)

