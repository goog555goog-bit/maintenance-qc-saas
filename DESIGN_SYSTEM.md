# UI/UX Design System Specification: Maintenance & Quality Control SaaS

## 1. Design Thesis
Design System นี้ถูกสร้างขึ้นมาสำหรับ Operations Staff ซึ่งประกอบด้วย Branch Managers, Central Admins, และ Technicians ที่ต้องจัดการ Maintenance Workflows ในแต่ละวัน The interface must feel fast, trustworthy, and professional. เราหลีกเลี่ยงการออกแบบที่ดูเป็นระบบราชการ (Bureaucratic) หรือหน้าตาแบบ Dashboard Templates ทั่วไป เป้าหมายหลักคือการสื่อถึงความแม่นยำ (Precision) ความรวดเร็ว (Speed) และความน่าเชื่อถือระดับ Enterprise

## 2. Color System

เราใช้ OKLCH color space เพื่อความแม่นยำในการแสดงผลของสี (Perceptual uniformity) สีหลักคือ Blue, Silver/Slate, และ White

### Primary Palette
- **Blue** (Primary): สำหรับ Action buttons, active states, links, และ primary CTAs
  - Light mode: `oklch(0.55 0.18 240)`
  - Dark mode: `oklch(0.70 0.15 240)`
- **Silver/Slate** (Neutral): สำหรับ Backgrounds, borders, และ secondary text
  - Light: `oklch(0.97 0.005 260)` (Backgrounds)
  - Dark: `oklch(0.20 0.01 260)` (Backgrounds)
- **White**: สำหรับ Paper/surface color ใน Light mode
  - Light: `oklch(1.0 0 0)`

### Semantic Colors
- **Success (Green)**: Approved, Completed, Closed
  - Light: `oklch(0.65 0.15 150)`
  - Dark: `oklch(0.75 0.12 150)`
- **Warning (Amber)**: Rework, Pending review
  - Light: `oklch(0.75 0.18 70)`
  - Dark: `oklch(0.85 0.15 70)`
- **Error (Red)**: Rejected, Failed, Cancelled
  - Light: `oklch(0.60 0.20 25)`
  - Dark: `oklch(0.70 0.16 25)`
- **Info (Blue)**: Assigned, In progress
  - ใช้ Primary Blue

### Status Colors
ระบบสีสำหรับ Ticket Status ทุกสถานะ:

| Status | Light Mode (OKLCH) | Dark Mode (OKLCH) | Usage |
|--------|-------------------|-------------------|-------|
| SUBMITTED | `0.95 0.02 260` (bg), `0.45 0.05 260` (text) | `0.30 0.02 260` (bg), `0.85 0.05 260` (text) | New ticket badge |
| WAITING_ASSIGNMENT | `0.90 0.08 70` (bg), `0.50 0.12 70` (text) | `0.35 0.08 70` (bg), `0.85 0.10 70` (text) | Pending badge |
| ASSIGNED | `0.92 0.05 240` (bg), `0.45 0.15 240` (text) | `0.30 0.08 240` (bg), `0.85 0.12 240` (text) | Active badge |
| CHECKED_IN | `0.90 0.08 200` (bg), `0.45 0.12 200` (text) | `0.30 0.08 200` (bg), `0.85 0.10 200` (text) | Location confirmed |
| IN_PROGRESS | `0.85 0.12 240` (bg), `0.40 0.18 240` (text) | `0.35 0.12 240` (bg), `0.90 0.10 240` (text) | Work underway |
| WAITING_REVIEW | `0.88 0.12 70` (bg), `0.45 0.15 70` (text) | `0.40 0.12 70` (bg), `0.90 0.15 70` (text) | Needs attention |
| REWORK | `0.90 0.08 25` (bg), `0.45 0.15 25` (text) | `0.35 0.08 25` (bg), `0.85 0.12 25` (text) | Rejected, needs fix |
| COMPLETED | `0.92 0.08 150` (bg), `0.40 0.12 150` (text) | `0.25 0.08 150` (bg), `0.80 0.10 150` (text) | Done |
| CLOSED | `0.96 0.01 260` (bg), `0.55 0.02 260` (text) | `0.25 0.01 260` (bg), `0.75 0.02 260` (text) | Archived |
| CANCELLED | `0.94 0.02 25` (bg), `0.50 0.05 25` (text) | `0.28 0.03 25` (bg), `0.80 0.05 25` (text) | Void |

## 3. Typography

### Font Stack
ระบบจะใช้ฟอนต์ Inter สำหรับภาษาอังกฤษ และ Noto Sans Thai สำหรับภาษาไทย เพื่อความสะอาดตาและความเป็นมืออาชีพ

```css
--font-sans: 'Inter', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```
*ข้อควรระวังสำหรับภาษาไทย:* ต้องเผื่อ line-height อย่างน้อย 1.5 - 1.6 เสมอ เพื่อไม่ให้สระบน/ล่าง โดนตัด

### Type Scale (Modular)

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-xs` | 0.75rem | 400 | 1.5 | Captions, timestamps, status labels |
| `--text-sm` | 0.875rem | 400 | 1.5 | Secondary text, table data |
| `--text-base` | 1rem | 400 | 1.6 | Body text, form inputs |
| `--text-lg` | 1.125rem | 500 | 1.5 | Section labels, button text |
| `--text-xl` | 1.25rem | 600 | 1.4 | Card titles, modals headers |
| `--text-2xl`| 1.5rem | 600 | 1.3 | Page section heads |
| `--text-3xl`| 1.875rem | 700 | 1.2 | Page titles |
| `--text-4xl`| 2.25rem | 700 | 1.1 | Dashboard numbers |

## 4. Spacing & Layout

### Spacing Scale (4pt base)
ใช้ระบบ 4pt grid เพื่อความสม่ำเสมอ:
`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`, `80px`, `96px`

### Layout Grid
- **Desktop**: 12-column grid, max-width 1280px, gap 24px
- **Tablet**: 8-column grid, gap 16px
- **Mobile**: 4-column grid, gap 16px

### Page Layout Patterns
- **Sidebar**: Collapsible navigation ด้านซ้าย
- **Top Bar**: ประกอบด้วย Breadcrumbs, User Info, Notifications, Theme Toggle
- **Content Area**: Padding สม่ำเสมอ โครงสร้างตามหลัก Gridgeist ที่เน้น structural logic ที่ชัดเจน ไม่ซับซ้อน

## 5. Component Library

### จาก ReactBits.dev
ใช้เฉพาะที่จำเป็น (ตามหลัก Ponytail):

| Component Need | ReactBits Component | Usage |
|---------------|---------------------|-------|
| Animated counters | `CountUp` / `NumberTicker` | Dashboard stat cards |
| Text animations | `SplitText` / `GradualSpacing` | Page titles on load |
| Backgrounds | `Hyperspeed` / `Threads` | Login page background |
| Buttons | `Magnet` / `ShinyText` | สำหรับ Primary CTAs |
| Cards | `TiltedCard` / `SpotlightCard` | สำหรับ Ticket cards |
| Transitions | `FadeContent` / `BlurText` | Page transitions เปลี่ยนหน้าจอ |

### Custom Components

#### StatusBadge
- รับ props: `status`
- แสดงผล: สีพื้นหลังและอักษรตาม Status Colors, ไม่มีรูปสัญลักษณ์

#### TicketCard
- ประกอบด้วย: Ticket ID, Branch name, Work type, Status badge, Date, Assigned team
- เลย์เอาต์: Compact / List views
- Action: คลิกเพื่อดูรายละเอียด (Detail view)

#### TimelineEntry
- สำหรับแสดงประวัติของ Ticket (Created, Assigned, Checked In, Submitted, Rejected, Approved, Closed, Reassigned)
- โครงสร้าง: แนวตั้งพร้อมจุด Marker ด้านซ้าย

#### StatCard
- แสดงตัวเลขสรุปใน Dashboard พร้อม CountUp animation และ Trend
- สีตาม Category ของข้อมูล

#### DataTable
- รองรับ Sort, Filter, Pagination
- แถว (Row) คลิกได้เพื่อไปหน้า Detail
- Responsive: บังคับ Scroll แนวนอนบน Mobile

#### KanbanBoard
- คอลัมน์ตาม Ticket Status
- การลาก (Drag): ปิดใช้งาน เพื่อบังคับสถานะผ่าน Workflow
- การ์ดแสดงข้อมูลสำคัญของ Ticket

#### NotificationPopup
- แสดงที่มุมขวาบน (Top-right)
- ข้อมูล: Branch, Team, Work type, Reject round, Reason
- Action: ปุ่ม "View Detail"

#### MapView
- แสดงพิกัด GPS Check-in ของ Technician พร้อม Markers

#### FileUploader
- รองรับ Drag & drop และคลิกเลือกไฟล์ พร้อม Thumbnails
- ตรวจสอบขนาด/ประเภทไฟล์ แสดง Progress Bar

## 6. Interactive States

- **Default**: ปกติ
- **Hover**: พื้นหลังเปลี่ยนเล็กน้อย
- **Focus-visible**: ขอบ Outline รองรับ Keyboard navigation ชัดเจน
- **Active/Pressed**: ขนาดลดลงเล็กน้อย
- **Disabled**: ลด Opacity ไม่มี Hover
- **Loading**: แสดง Spinner
- **Error**: กรอบสีแดง ข้อความสีแดง
- **Success**: สีเขียว

## 7. Motion & Animation

### Principles
- Motion เพื่อ Feedback ไม่ใช้เพื่อตกแต่ง
- ความเร็ว: ต่ำกว่า 300ms
- เคารพ `prefers-reduced-motion` เสมอ

### Specific Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transition | Fade + slide-up | 200ms | ease-out |
| Modal open | Scale from 0.95 + fade | 150ms | ease-out |
| Modal close | Fade out | 100ms | ease-in |
| Toast appear | Slide from right | 200ms | ease-out |
| Status change | Color transition | 300ms | ease-in-out |
| Dashboard numbers| CountUp | 800ms | ease-out |
| Skeleton loading| Pulse | 1.5s | infinite |

## 8. Iconography
- ไลบรารี: **Lucide React**
- ขนาด: 16px (inline), 20px (buttons), 24px (navigation)
- สี: อ้างอิงตาม text color
- ห้ามใช้ Unicode symbols แทนไอคอนเด็ดขาด

## 9. Forms
- Layout: Label อยู่ด้านบน
- Required: มี `*` ชัดเจน
- Validation: ข้อความ Error สีแดง แสดงด้านล่าง
- Disabled: พื้นหลัง/ลด Opacity ชัดเจน
- Select: สำหรับข้อมูลตายตัว
- Textarea: รองรับ Free-text เช่น เหตุผลการ Reject
- Security: ค่าที่รับมาต้องใช้ `textContent` ห้ามใช้ `innerHTML`

## 10. Responsive Breakpoints

| Name | Min Width | Columns | Target |
|------|-----------|---------|--------|
| mobile | 0px | 4 | Phone |
| tablet | 768px | 8 | Tablet |
| desktop | 1024px | 12 | Laptop |
| wide | 1280px | 12 | Desktop |

## 11. Dark Mode
- Toggle ใน Top bar และบันทึกลง `localStorage`
- สี: ใช้ Dark variants ทั้งหมด
- Images / Maps: คอนทราสต์ดั้งเดิม ไม่เปลี่ยนสี
- Borders: อ่อนลงและกลืนไปกับพื้น
- Shadows: ถูกแทนที่ด้วยพื้นหลังแบบ Raised หรือเส้นขอบบางๆ

## 12. Accessibility
- Contrast Ratio >= 4.5:1
- Focus-visible ครอบคลุมปุ่ม
- Keyboard navigable แบบเต็ม 100%
- ARIA Labels สำหรับ Icon-only
- Skip-to-content
- Status announcements ใช้ `aria-live`

## 13. Anti-Patterns (DO NOT)
สิ่งที่ **ห้ามทำ** เด็ดขาด (Hallmark Principle):
- NO rounded-card grids with gradient backgrounds
- NO gradient blob decorations
- NO uniform hero + 3-feature + CTA sections
- NO italic headings
- NO fake browser chrome
- NO invented metrics or fake testimonials
- NO emoji in any UI text
- NO decorative animations without function
- NO generic stock illustrations
- NO "clean and modern" without substance

## 14. Design Tokens Summary

```css
:root {
  --color-primary: oklch(0.55 0.18 240);
  --color-primary-hover: oklch(0.50 0.18 240);
  --color-primary-active: oklch(0.45 0.18 240);
  --color-surface: oklch(1.0 0 0);
  --color-surface-raised: oklch(0.98 0.005 260);
  --color-border: oklch(0.90 0.01 260);
  --color-text-primary: oklch(0.20 0.02 260);
  --color-text-secondary: oklch(0.45 0.02 260);
  --color-text-muted: oklch(0.65 0.02 260);
  --color-success: oklch(0.65 0.15 150);
  --color-warning: oklch(0.75 0.18 70);
  --color-error: oklch(0.60 0.20 25);
  --color-info: var(--color-primary);
}

[data-theme='dark'] {
  --color-primary: oklch(0.70 0.15 240);
  --color-primary-hover: oklch(0.75 0.15 240);
  --color-primary-active: oklch(0.80 0.15 240);
  --color-surface: oklch(0.15 0.01 260);
  --color-surface-raised: oklch(0.20 0.01 260);
  --color-border: oklch(0.25 0.01 260);
  --color-text-primary: oklch(0.95 0.01 260);
  --color-text-secondary: oklch(0.75 0.01 260);
  --color-text-muted: oklch(0.50 0.01 260);
  --color-success: oklch(0.75 0.12 150);
  --color-warning: oklch(0.85 0.15 70);
  --color-error: oklch(0.70 0.16 25);
  --color-info: var(--color-primary);
}
```
