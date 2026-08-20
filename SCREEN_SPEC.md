# Master System Specification: Screen Specifications

เอกสารฉบับนี้กำหนดรายละเอียดหน้าจอทั้งหมดของระบบ Maintenance & Quality Control SaaS โดยให้ข้อมูลครอบคลุมเกี่ยวกับการทำงาน ข้อมูลที่แสดงผล และ API ที่เกี่ยวข้อง เพื่อให้ AI agent หรือ Developer สามารถนำไปพัฒนาระบบได้อย่างถูกต้องโดยไม่ต้องคาดเดาเพิ่มเติม

## 1. System Overview & Constraints

### 1.1 Roles
- **Central Admin**: มองเห็นทุกส่วนของระบบ บริหารจัดการทุก Branch, Team และ Ticket
- **Branch Manager**: มองเห็นเฉพาะ Branch ของตนเอง สามารถสร้าง Ticket และรีวิวงาน
- **Technician**: มองเห็นเฉพาะงานที่ได้รับมอบหมาย สามารถ Check-in และส่งงาน

### 1.2 Tech Stack & Design
- **Frontend**: Cloudflare Pages, Single Page Application (SPA), React
- **Backend**: Google Apps Script API
- **UI Library**: ReactBits.dev (สำหรับ Animated components ที่จำเป็น)
- **Design Theme**: Blue/Silver/White, Modern Enterprise SaaS style

### 1.3 Ticket Statuses
- SUBMITTED, WAITING_ASSIGNMENT, ASSIGNED, CHECKED_IN, IN_PROGRESS, WAITING_REVIEW, REWORK, COMPLETED, CLOSED, CANCELLED

---

## 2. SHARED LAYOUT

### 2.1 App Shell
- **Sidebar (Left)**: แถบเมนูด้านซ้าย สามารถย่อ/ขยายได้ (Collapsible)
- **Top Bar (Right of sidebar, Full width)**: ประกอบด้วย Breadcrumbs, Search bar, Notifications bell, Theme toggle, User profile menu
- **Content Area**: พื้นที่แสดงเนื้อหาหลัก Scrollable และมีการกำหนด Padding เหมาะสม

### 2.2 Sidebar Navigation (Dynamic per Role)

**Central Admin:**
- Dashboard
- Tickets (all)
- Assignments
- Teams
- Branches
- Fuel Management
- Reports
- Archive
- Settings

**Branch Manager:**
- Dashboard
- My Tickets
- Create Ticket
- Archive

**Technician:**
- Dashboard
- My Tasks
- History

---

## 3. SCREENS

### 3.1 Login Screen
- **Path**: `/login`
- **Access**: Public (Unauthenticated)
- **Layout Description**: Full-screen, Centered card. Background สามารถใช้ ReactBits Hyperspeed หรือ Threads (Optional) ไม่มี Sidebar หรือ Topbar
- **Components**:
  - Login form: รหัสพนักงาน (Employee ID) และ รหัสผ่าน (Password)
  - Checkbox: "Remember Me"
  - Button: Submit
  - Error message area (แสดงเมื่อ Login ล้มเหลว)
- **Actions**:
  - Submit Login Form
- **API Calls**: `auth.login`
- **States**:
  - Loading: ปุ่ม Submit แสดง Spinner
  - Error: แสดงข้อความแจ้งเตือนสีแดงด้านบนฟอร์ม
  - Data/Empty: ฟอร์มพร้อมกรอก
- **Mobile Responsive Notes**: Card ขยายเต็มหน้าจอบนมือถือพร้อม Padding 16px

### 3.2 Admin Dashboard
- **Path**: `/dashboard`
- **Access**: Central Admin
- **Layout Description**: 2-3 Column grid สำหรับ Stat cards ตามด้วย 2-Column layout สำหรับ Activity และ Notifications
- **Components**:
  - Stat cards row: จำนวน New tickets, Waiting assignment, In progress, Waiting review, Rejected, Closed today (ใช้ NumberTicker/CountUp จาก ReactBits)
  - Quick actions: ปุ่มลิงก์ไป "View all tickets", "Fuel review"
  - Recent activity feed: รายการล่าสุด 10 รายการจาก Activity_Log
  - Notification panel: แสดง Notifications ที่ยังไม่ได้อ่านล่าสุด
  - Tickets by status chart: Simple bar หรือ Donut chart
  - Tickets by branch table: ตารางสรุปจำนวน Ticket แยกตามสาขา
  - Reject hotspot: รายการ Tickets ที่มี reject_count >= 3
- **Actions**:
  - คลิกลิงก์เพื่อไปยังหน้ารายละเอียด
- **API Calls**: `dashboard.summary`, `notification.list`, `ticket.list (filtered)`
- **States**:
  - Loading: แสดง Skeleton loaders สำหรับการ์ดและกราฟ
  - Empty: กราฟและตารางแสดงสถานะไม่มีข้อมูล (No data available)
  - Error: แสดงปุ่ม Retry โหลดข้อมูล Dashboard
- **Mobile Responsive Notes**: Stack ทุกคอลัมน์เป็น 1 คอลัมน์ แนวนอนเลื่อนได้เฉพาะส่วนตาราง

### 3.3 Branch Manager Dashboard
- **Path**: `/dashboard`
- **Access**: Branch Manager
- **Layout Description**: คล้าย Admin Dashboard แต่น้อยกว่า มุ่งเน้นเฉพาะ Branch ตนเอง
- **Components**:
  - Stat cards: My open tickets, Waiting my review, Rejected, Closed this month
  - My tickets awaiting review (List)
  - Recent activity on my branch
  - Notifications
- **Actions**:
  - คลิกเพื่อ Review งานที่รออยู่
- **API Calls**: `dashboard.summary (branch-scoped)`, `ticket.list (branch-scoped)`
- **States**: เหมือน Admin Dashboard
- **Mobile Responsive Notes**: ปรับเป็น 1 คอลัมน์บนมือถือ

### 3.4 Technician Dashboard
- **Path**: `/dashboard`
- **Access**: Technician
- **Layout Description**: เน้นรายการงานที่ต้องทำ
- **Components**:
  - Stat cards: My active tasks, Rework needed, Completed this month
  - Current assigned tickets: แสดงแบบ Card list
  - Rework tickets: แสดงการ์ดเน้นสีหรือขอบ (Highlighted) เพื่อเตือนให้รีบแก้ไข
- **Actions**:
  - คลิกการ์ดเพื่อดูรายละเอียดและทำงาน
- **API Calls**: `ticket.list (team-scoped)`
- **States**:
  - Empty: แสดงข้อความ "No active tasks, enjoy your day"
- **Mobile Responsive Notes**: ใช้งานผ่านมือถือเป็นหลัก Card ต้องแตะง่าย (Touch-friendly)

### 3.5 Ticket List
- **Path**: `/tickets`
- **Access**: Central Admin (All), Branch Manager (Own branch)
- **Layout Description**: ส่วนบนมี Filter และ View Toggle ส่วนล่างแสดงข้อมูล
- **Components**:
  - Filter bar: Status, Branch, Team, Work Type, Date range, Urgency
  - Search: ค้นหาด้วย Ticket ID, Description
  - View toggle: สลับระหว่าง Table view และ Kanban view
  - DataTable columns: Ticket ID, Branch, Work Type, Status (Badge), Assigned Team, Created Date, Urgency, Reject Count
  - Kanban columns: WAITING_ASSIGNMENT, ASSIGNED, IN_PROGRESS, WAITING_REVIEW, REWORK
  - Pagination
- **Actions**:
  - ปรับ Filter/Search
  - สลับ View
  - คลิก Row/Card เพื่อไปหน้า Ticket Detail
- **API Calls**: `ticket.list (with filters)`
- **States**:
  - Loading: ตารางหรือ Kanban แสดง Skeleton
  - Empty: ไม่พบข้อมูลที่ตรงกับ Filter
- **Mobile Responsive Notes**: Table มี Horizontal scroll, Kanban แสดงทีละ Column พร้อม Horizontal scroll สลับสถานะ

### 3.6 Create Ticket
- **Path**: `/tickets/new`
- **Access**: Branch Manager
- **Layout Description**: Single column form อาจมี Preview panel (Optional)
- **Components**:
  - Form fields:
    - Branch: Auto-filled จากข้อมูล User (Read-only)
    - Work Type: Dropdown จาก Work_Types
    - Description: Textarea (Sanitized)
  - Items section:
    - รายการ Ticket items (Dynamic add/remove)
    - แต่ละ Item ประกอบด้วย: Description, Work_type_item (Dropdown), Photo upload
  - Attachments: File upload (Multiple)
  - Submit button
- **Actions**:
  - Add/Remove items
  - Upload photos/files
  - Submit form
- **Validation**:
  - ต้องมีอย่างน้อย 1 Item
  - Description ต้องไม่ว่างเปล่า
- **API Calls**: `ticket.create`
- **States**:
  - Loading: ปุ่ม Submit หมุนแสดงการโหลด, แสดง Upload progress
  - Error: แสดง Validation error ใต้ช่องที่มีปัญหา
- **Mobile Responsive Notes**: Input fields เต็มความกว้างหน้าจอ ปุ่ม Add Item ขนาดใหญ่แตะง่าย

### 3.7 Ticket Detail
- **Path**: `/tickets/:id`
- **Access**: All roles (Filtered by RBAC)
- **Layout Description**: Split view หรือ Tabbed (แบ่ง Info, Timeline, Actions)
- **Components**:
  - **Header**: Ticket ID (Mono font), Status badge, Branch name, Created date
  - **Info section**: Work type, Description, Urgency level, Assigned team, Current assignment status
  - **Items list**: รายการ Items ทั้งหมดพร้อมสถานะและ Note
  - **Timeline**: Vertical timeline แสดงเหตุการณ์ (Created, Assigned, Checked_in, Submitted, Rejected, Approved, Reassigned, Closed) แสดง Timestamp, Actor, Action, Details
  - **Review History**: Expandable section แสดงประวัติการ Review (Round, Result, Reason, Reviewer, Date)
  - **GPS Info**: แผนที่แสดงพิกัดการ Check-in พร้อมเวลา
  - **Attachments**: Photo gallery, ไฟล์เอกสาร
  - **Satisfaction**: คะแนน (Score) และคำวิจารณ์ (Comment) เฉพาะเมื่อสถานะ CLOSED
- **Actions**:
  - *Admin*: Set Urgency, Assign Team, Re-assign (พร้อมใส่ Reason), Fuel Review
  - *Manager*: Approve, Reject (ต้องใส่ Reason), Close (ให้คะแนน Satisfaction)
  - *Technician*: Check-in (จับพิกัด GPS), Submit Work (ใส่ Notes + รูป), Submit Rework (ใส่ Notes + รูป)
- **API Calls**: `ticket.get`, `ticket.timeline`, `ticket.assign`, `ticket.reassign`, `ticket.checkin`, `ticket.submit`, `ticket.review`, `ticket.reject`, `ticket.close`
- **States**:
  - Loading: Skeleton สำหรับรายละเอียดทั้งหมด
  - Error: แสดง "Ticket not found or access denied"
- **Mobile Responsive Notes**: แสดง Header เป็น Sticky แผนที่อาจพับเก็บได้ Timeline อยู่ล่างสุด ปุ่ม Action ยึดติดขอบล่าง (Sticky bottom)

### 3.8 Assignment Management
- **Path**: `/assignments`
- **Access**: Central Admin
- **Layout Description**: 2 Panels - งานที่รอจัดสรร และ งานที่กำลังดำเนินอยู่
- **Components**:
  - Tickets awaiting assignment (สถานะ WAITING_ASSIGNMENT)
  - Current active assignments
  - Assignment history
  - Quick assign interface: เลือก Ticket -> เลือก Team -> กดยืนยัน Assign
- **Actions**:
  - ลากวาง (Drag & Drop) หรือกดเมนูเพื่อ Assign งานให้ทีม
- **API Calls**: `ticket.list (WAITING_ASSIGNMENT)`, `ticket.assign`
- **States**: ปกติ
- **Mobile Responsive Notes**: ซ่อน Drag & Drop ใช้ระบบ Click to select แทน

### 3.9 Team Management
- **Path**: `/teams`
- **Access**: Central Admin
- **Layout Description**: List ของทีมด้านซ้าย, Detail ด้านขวา
- **Components**:
  - Team list พร้อมจำนวนสมาชิก
  - Team detail: สมาชิกในทีม, งานปัจจุบัน, ภาระงาน (Workload)
  - ฟอร์ม Add/Remove members
  - Transfer history
- **Actions**:
  - จัดการสมาชิกทีม
- **API Calls**: `team.list`, `team.get`, `team.update`
- **States**: ปกติ
- **Mobile Responsive Notes**: สลับ List และ Detail ด้วยปุ่ม Back

### 3.10 Branch Management
- **Path**: `/branches`
- **Access**: Central Admin
- **Layout Description**: ตารางรายชื่อ Branch
- **Components**:
  - Branch list พร้อมจำนวน Ticket
  - Branch detail: Manager ที่ดูแล, พิกัดสถานที่, Active tickets
- **Actions**:
  - ดูรายละเอียดสาขา
- **API Calls**: `branch.list`, `branch.get`

### 3.11 Fuel Management
- **Path**: `/fuel`
- **Access**: Central Admin
- **Sub-screens**:
  - **11a. Daily Fuel Rate** (`/fuel/rates`)
    - ฟอร์มกำหนด Daily rate per km
    - ตารางประวัติ Rate ในอดีต
    - API: `fuel.setRate`, `fuel.getRates`
  - **11b. Travel Cost Review** (`/fuel/review`)
    - รายการ Tickets ที่ทำงานเสร็จพร้อมค่าเดินทาง
    - Columns: Ticket ID, Team, System Distance, System Amount, Approved Distance, Approved Amount, Status
    - Expand: แสดงแผนที่ GPS และรายละเอียดการคำนวณระยะทาง
    - Adjust Action: ฟอร์มสำหรับปรับ Adjusted_distance, Adjusted_amount พร้อม Reason (Required)
    - API: `fuel.review`, `fuel.adjust`

### 3.12 Reports
- **Path**: `/reports`
- **Access**: Central Admin
- **Layout Description**: กราฟและตารางหลายชุด
- **Components**:
  - Date range filter
  - Tickets by status summary
  - Tickets by branch / team
  - Average resolution time
  - Reject rate by team
  - Satisfaction average by team/branch
  - Travel cost summary
  - Export to CSV button
- **Actions**:
  - ปรับ Filter
  - กดปุ่ม Export
- **API Calls**: `dashboard.summary (extended params)`
- **States**: Loading นานกว่าปกติ ต้องมี Progress indicator
- **Mobile Responsive Notes**: กราฟต้องปรับให้เลื่อนแนวนอนหรือลดรายละเอียดลง

### 3.13 Archive
- **Path**: `/archive`
- **Access**: Central Admin (All), Branch Manager (Own branch history)
- **Layout Description**: คล้าย Ticket List แต่ดูได้อย่างเดียว
- **Components**:
  - Search by Ticket ID, Date range, Branch, Team
  - Archived ticket list (Read-only)
  - Detail view เหมือน Ticket Detail ทุกอย่างแต่เป็นโหมดอ่านอย่างเดียว
- **Actions**:
  - ค้นหาและดูข้อมูล
- **API Calls**: `archive.list`, `archive.get`

### 3.14 Notification Center
- **Path**: `/notifications` (หรือแสดงเป็น Panel/Drawer)
- **Access**: All roles
- **Layout Description**: รายการยาวแนวตั้ง เรียงตามวันที่
- **Components**:
  - List of notifications
  - Item detail: Type icon (Lucide icons), Title, Preview text, Timestamp, Read/Unread indicator
- **Actions**:
  - คลิก Notification นำไปยัง Ticket ที่เกี่ยวข้อง
  - Mark as read / Mark all as read
- **API Calls**: `notification.list`, `notification.read`

### 3.15 Settings
- **Path**: `/settings`
- **Access**: Central Admin
- **Layout Description**: Tabs แบ่งหมวดหมู่การตั้งค่า
- **Components**:
  - Work Types management (CRUD)
  - Work Type Items management
  - Backup settings (Enable/Disable, Schedule)
  - System info (Version, Environment)
- **Actions**:
  - บันทึกการตั้งค่า
- **API Calls**: `settings.get`, `settings.update`

### 3.16 User Profile
- **Path**: `/profile`
- **Access**: All roles
- **Layout Description**: Card กลางหน้า
- **Components**:
  - User info: Name, Employee ID, Role, Branch/Team
  - Change password form
  - Assignment history (สำหรับ Technician)
- **Actions**:
  - เปลี่ยนรหัสผ่าน
- **API Calls**: `auth.me`, `auth.changePassword`

### 3.17 Offline Indicator (Persistent UI)
- **Component**: แถบแบนเนอร์ด้านบน
- **Behavior**:
  - เมื่อ Offline: แสดงแบนเนอร์ "Offline mode - changes will sync when connected"
  - มี Queue indicator นับจำนวนรายการที่รอ Sync
  - เมื่อกลับมา Online: แสดงสถานะ "Syncing..." จากนั้นเปลี่ยนเป็น Success หรือแสดงข้อผิดพลาดถ้ามี Conflict

---

## 4. SCREEN ACCESS MATRIX

| Screen | Central Admin | Branch Manager | Technician |
|--------|:---:|:---:|:---:|
| Login | Yes | Yes | Yes |
| Admin Dashboard | Yes | - | - |
| Branch Manager Dashboard | - | Yes | - |
| Technician Dashboard | - | - | Yes |
| Ticket List | Yes | Yes (Own Branch) | - |
| Create Ticket | - | Yes | - |
| Ticket Detail | Yes | Yes (Own Branch) | Yes (Assigned) |
| Assignment Management | Yes | - | - |
| Team Management | Yes | - | - |
| Branch Management | Yes | - | - |
| Fuel Management | Yes | - | - |
| Reports | Yes | - | - |
| Archive | Yes | Yes (Own Branch) | - |
| Notifications | Yes | Yes | Yes |
| Settings | Yes | - | - |
| Profile | Yes | Yes | Yes |

---

## 5. SCREEN FLOW DIAGRAMS

### Flow 1: Create and Complete a Ticket
1. **Manager**: Login -> Dashboard -> Create Ticket -> Submit
2. **Admin**: Dashboard -> Ticket List -> Assign Team
3. **Technician**: Dashboard -> My Tasks -> Check-in -> Do Work -> Submit
4. **Manager**: Dashboard -> Waiting Review -> Review -> Approve -> Close

### Flow 2: Reject and Rework
1. **Manager**: Review -> Reject (with reason)
2. **Technician**: Dashboard (sees rework) -> Fix -> Submit again
3. **Manager**: Review again -> Approve -> Close

### Flow 3: Re-assign
1. **Admin**: Ticket Detail -> Re-assign -> Select new team + reason -> Confirm
2. **New Technician**: Dashboard (sees new assignment) -> Check-in -> Work -> Submit

---

## 6. COMPONENT-TO-SCREEN MAPPING

| Component | Screens Used On | Data Shown / Purpose |
|-----------|-----------------|----------------------|
| **Stat Card (Animated)** | Admin Dash, BM Dash, Tech Dash | จำนวน Ticket ตามสถานะ, ใช้ ReactBits NumberTicker |
| **Data Table** | Ticket List, Fuel Review, Teams, Branches, Archive | แสดงรายการข้อมูลแบบ Tabular พร้อม Pagination |
| **Kanban Board** | Ticket List, Assignments | แสดง Ticket เรียงตามสถานะแบบลากวางหรือดูสถานะเป็นคอลัมน์ |
| **Timeline** | Ticket Detail | ประวัติการเปลี่ยนแปลงสถานะของ Ticket |
| **Map Viewer** | Ticket Detail, Fuel Review | แสดงพิกัด GPS ตอน Check-in ของ Technician |
| **Image Gallery** | Ticket Detail | แสดงรูปภาพประกอบการแจ้งซ่อมหรือรูปหลังส่งงาน |
| **Dynamic Form List** | Create Ticket | เพิ่ม/ลดรายการซ่อมย่อยๆ ภายในหนึ่ง Ticket |
| **Sidebar Menu** | All (except Login) | นำทางไปยังเมนูต่างๆ ของแต่ละ Role |
| **Notification Drawer** | Shared Layout (Top Bar) | แสดงรายการแจ้งเตือนสั้นๆ แบบ Popover/Drawer |
