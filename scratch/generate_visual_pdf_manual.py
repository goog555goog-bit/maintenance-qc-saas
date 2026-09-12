import os
import subprocess
import shutil

html_content = """<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>คู่มือการใช้งานระบบบริหารงานซ่อมบำรุงและควบคุมคุณภาพ (Maintenance QC SaaS)</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  @page {
    size: A4;
    margin: 14mm 12mm 14mm 12mm;
    @bottom-right {
      content: counter(page);
    }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    font-size: 12.5px;
    line-height: 1.6;
    word-break: break-word;
  }

  h1, h2, h3, h4, .font-heading {
    font-family: 'Prompt', sans-serif;
    color: #0f172a;
    font-weight: 600;
  }

  .page-break {
    page-break-before: always;
  }

  .avoid-break {
    page-break-inside: avoid;
  }

  /* Cover Header */
  .cover {
    border-bottom: 2px solid #2563eb;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }

  .badge-tag {
    display: inline-block;
    background-color: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .cover h1 {
    font-size: 24px;
    line-height: 1.3;
    margin-bottom: 6px;
    color: #0f172a;
  }

  .cover-subtitle {
    font-size: 13.5px;
    color: #475569;
    margin-bottom: 12px;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 11.5px;
  }

  .meta-item strong {
    color: #64748b;
    display: block;
    font-size: 10px;
    text-transform: uppercase;
  }

  .meta-item span {
    color: #0f172a;
    font-weight: 600;
  }

  /* Section Titles */
  h2 {
    font-size: 16px;
    margin-top: 18px;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #e2e8f0;
    color: #1e3a8a;
  }

  h3 {
    font-size: 13.5px;
    margin-top: 14px;
    margin-bottom: 6px;
    color: #1e293b;
  }

  p {
    margin-bottom: 8px;
    color: #334155;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 16px 0;
    font-size: 11.5px;
  }

  th, td {
    padding: 7px 10px;
    text-align: left;
    border: 1px solid #e2e8f0;
  }

  th {
    background-color: #f1f5f9;
    color: #1e293b;
    font-weight: 600;
    font-family: 'Prompt', sans-serif;
  }

  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  /* Steps List */
  .step-list {
    margin: 8px 0;
    padding-left: 0;
    list-style: none;
  }

  .step-item {
    position: relative;
    padding-left: 32px;
    margin-bottom: 8px;
  }

  .step-number {
    position: absolute;
    left: 0;
    top: 2px;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background-color: #2563eb;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
  }

  .step-title {
    font-weight: 600;
    color: #0f172a;
    font-size: 12.5px;
  }

  .step-desc {
    color: #475569;
    font-size: 11.5px;
  }

  /* UI MOCKUPS STYLING */
  .mockup-container {
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 14px;
    margin: 14px 0;
  }

  .mockup-header-title {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Desktop Window Mockup */
  .window-frame {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  }

  .window-topbar {
    background: #f1f5f9;
    border-bottom: 1px solid #e2e8f0;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .window-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }

  .window-url {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 10px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
    flex: 1;
    margin-left: 8px;
  }

  .window-body {
    padding: 14px;
  }

  /* Phone Frame Mockup */
  .phone-mockup-wrapper {
    display: flex;
    gap: 16px;
    justify-content: center;
  }

  .phone-frame {
    width: 290px;
    background: #ffffff;
    border: 2px solid #334155;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  }

  .phone-notch {
    background: #1e293b;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    color: #ffffff;
    font-size: 9px;
    font-family: 'JetBrains Mono', monospace;
  }

  .phone-screen {
    padding: 12px;
    background: #f8fafc;
    min-height: 280px;
    font-size: 11px;
  }

  /* Telegram UI Elements */
  .tg-bubble {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 10px;
    margin-bottom: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }

  .tg-btn-inline {
    display: block;
    background: #2563eb;
    color: #ffffff;
    text-align: center;
    padding: 6px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 10.5px;
    margin-top: 8px;
    text-decoration: none;
  }

  .tg-bottom-bar {
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tg-menu-btn {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    padding: 5px 10px;
    font-weight: 600;
    font-size: 10px;
    flex: 1;
    text-align: center;
  }

  /* Form Elements in Mockup */
  .mock-form-row {
    margin-bottom: 8px;
  }
  .mock-label {
    font-size: 10.5px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 3px;
    display: block;
  }
  .mock-input {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 5px 8px;
    font-size: 11px;
    background: #ffffff;
  }

  .mock-pills {
    display: flex;
    gap: 6px;
  }
  .mock-pill {
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid #cbd5e1;
    font-size: 10px;
    background: #f8fafc;
  }
  .mock-pill.active {
    background: #fef2f2;
    border-color: #ef4444;
    color: #b91c1c;
    font-weight: 600;
  }

  .mock-item-card {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px;
    margin-bottom: 6px;
  }

  .mock-btn {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    display: inline-block;
    border: none;
  }
  .btn-primary { background: #2563eb; color: #ffffff; }
  .btn-success { background: #16a34a; color: #ffffff; }
  .btn-danger { background: #dc2626; color: #ffffff; }
  .btn-purple { background: #7c3aed; color: #ffffff; }
  .btn-dark { background: #0f172a; color: #ffffff; }

  /* Dashboard Metrics in Mockup */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }
  .metric-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px;
    text-align: center;
  }
  .metric-val {
    font-family: 'Prompt', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
  }
  .metric-lbl {
    font-size: 9.5px;
    color: #64748b;
  }

  code {
    font-family: 'JetBrains Mono', monospace;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 11px;
    border: 1px solid #e2e8f0;
  }

  .role-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
  }
  .role-admin { background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  .role-manager { background-color: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
  .role-tech { background-color: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }

  .footer {
    margin-top: 24px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
    font-size: 10px;
    color: #94a3b8;
    text-align: center;
  }
</style>
</head>
<body>

  <!-- COVER / HEADER -->
  <div class="cover">
    <span class="badge-tag">OFFICIAL ENTERPRISE DOCUMENTATION</span>
    <h1>คู่มือการใช้งานระบบบริหารงานซ่อมบำรุงและควบคุมคุณภาพ</h1>
    <div class="cover-subtitle">Maintenance QC SaaS & Telegram Mini App User Manual (ภาพประกอบหน้าจอจริง)</div>
    
    <div class="meta-grid">
      <div class="meta-item">
        <strong>สถานะระบบ</strong>
        <span>Production Ready (v1.0)</span>
      </div>
      <div class="meta-item">
        <strong>กลุ่มผู้ใช้งาน</strong>
        <span>ผู้จัดการสาขา / ช่างเทคนิค / ผู้บริหาร</span>
      </div>
      <div class="meta-item">
        <strong>เทคโนโลยีรองรับ</strong>
        <span>Web App & Telegram Mini App</span>
      </div>
    </div>
  </div>

  <!-- SECTION 1: CREDENTIALS & WORKFLOW -->
  <h2>1. แผนผังวงจรการทำงานและบัญชีผู้ใช้เริ่มต้น</h2>
  
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">บทบาท (Role)</th>
        <th style="width: 20%;">รหัสผู้ใช้ (Username)</th>
        <th style="width: 20%;">รหัสผ่านเริ่มต้น</th>
        <th style="width: 35%;">หน้าที่หลักในระบบ</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="role-badge role-admin">CENTRAL_ADMIN</span></td>
        <td><code>EMP-0001</code></td>
        <td><code>EMP-0001</code></td>
        <td>แดชบอร์ดผู้บริหาร, จัดสรรทีมช่าง, กำหนดค่าน้ำมันกลาง, ตั้งค่าบ็อต</td>
      </tr>
      <tr>
        <td><span class="role-badge role-manager">BRANCH_MANAGER</span></td>
        <td><code>EMP-0002</code></td>
        <td><code>EMP-0002</code></td>
        <td>สร้างใบแจ้งซ่อม, ตรวจรับงาน QC (Approve/Rework), ให้คะแนน 5 ดาว</td>
      </tr>
      <tr>
        <td><span class="role-badge role-tech">TECHNICIAN</span></td>
        <td><code>EMP-0003</code></td>
        <td><code>EMP-0003</code></td>
        <td>รับงานผ่าน Telegram, เช็คอินพิกัด GPS, บันทึกอะไหล่, ส่งมอบงาน</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 2: BRANCH MANAGER UI -->
  <h2>2. คู่มือผู้จัดการสาขา: การแจ้งซ่อมและการตรวจรับงาน QC</h2>

  <div class="mockup-container avoid-break">
    <div class="mockup-header-title">ภาพประกอบที่ 1: หน้าจอการสร้างใบแจ้งซ่อมใหม่ (Multi-location Ticket Creation)</div>
    <div class="window-frame">
      <div class="window-topbar">
        <div class="window-dot dot-red"></div>
        <div class="window-dot dot-yellow"></div>
        <div class="window-dot dot-green"></div>
        <div class="window-url">https://maintenance-qc-saas.../tickets/create</div>
      </div>
      <div class="window-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="mock-form-row">
            <label class="mock-label">สาขาที่แจ้งซ่อม</label>
            <div class="mock-input">สาขากรุงเทพพระราม 9 (BR-BKK-01)</div>
          </div>
          <div class="mock-form-row">
            <label class="mock-label">ประเภทระบบงาน</label>
            <div class="mock-input">ระบบปรับอากาศ (Air Conditioning)</div>
          </div>
        </div>

        <div class="mock-form-row">
          <label class="mock-label">ระดับความเร่งด่วน</label>
          <div class="mock-pills">
            <span class="mock-pill">ปกติ (Normal)</span>
            <span class="mock-pill active">ด่วน (Urgent)</span>
            <span class="mock-pill">ฉุกเฉิน (Emergency)</span>
          </div>
        </div>

        <div class="mock-form-row">
          <label class="mock-label">ภาพรวมอาการชำรุด</label>
          <div class="mock-input" style="height: 38px;">แอร์ห้องเซิร์ฟเวอร์มีน้ำหยด และห้องประชุม 1 มีเสียงพัดลมดังผิดปกติ</div>
        </div>

        <div class="mock-form-row">
          <label class="mock-label">รายการจุดซ่อมที่ต้องเข้าปฏิบัติงาน (2 จุด)</label>
          <div class="mock-item-card">
            <strong>จุดที่ 1 (Server Room):</strong> แอร์ผนังตัวซ้าย ท่อน้ำทิ้งตัน มีน้ำหยดลงตู้ Rack
          </div>
          <div class="mock-item-card">
            <strong>จุดที่ 2 (Meeting Room 1):</strong> แอร์แขวนกลางห้อง พัดลมกรงกระรอกมีเสียงดัง
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <span class="mock-btn btn-dark" style="font-size: 10px;">+ เพิ่มจุดซ่อม</span>
          <span class="mock-btn btn-primary">ยืนยันการสร้างใบแจ้งซ่อม</span>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 3: QC REVIEW & RATING -->
  <div class="page-break"></div>
  <h2>3. การตรวจรับงานและควบคุมคุณภาพ (Quality Control & Rework)</h2>

  <div class="mockup-container avoid-break">
    <div class="mockup-header-title">ภาพประกอบที่ 2: แผงควบคุมการตรวจรับงานของผู้จัดการสาขา (QC Action Panel)</div>
    <div class="window-frame">
      <div class="window-topbar">
        <div class="window-dot dot-red"></div>
        <div class="window-dot dot-yellow"></div>
        <div class="window-dot dot-green"></div>
        <div class="window-url">https://maintenance-qc-saas.../tickets/TICK-2026-0001</div>
      </div>
      <div class="window-body">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <strong style="font-size: 13px;">ใบแจ้งซ่อม TICK-2026-0001</strong>
            <span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-left: 6px;">ช่างส่งมอบงานแล้ว (รอตรวจรับ)</span>
          </div>
          <span style="font-size: 11px; color: #64748b;">ทีมช่าง: Alpha Mobile Tech</span>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-bottom: 12px; font-size: 11px;">
          <strong>บันทึกจากช่างเทคนิค:</strong> ล้างท่อน้ำทิ้งห้องเซิร์ฟเวอร์เรียบร้อย และเปลี่ยนแคปรันมอเตอร์ห้องประชุม 1 ทดสอบความเย็นสมบูรณ์
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span class="mock-btn btn-success">ตรวจรับงานผ่าน (Approve)</span>
          <span class="mock-btn btn-danger">ส่งกลับแก้ไข (Reject / Rework)</span>
          <span class="mock-btn btn-purple">ปิดใบงานและประเมินความพึงพอใจ</span>
        </div>
      </div>
    </div>
  </div>

  <div class="mockup-container avoid-break" style="margin-top: 12px;">
    <div class="mockup-header-title">ภาพประกอบที่ 3: หน้าต่างประเมินความพึงพอใจ 5 ดาวและการปิดใบงาน (Satisfaction Rating Modal)</div>
    <div style="background: #ffffff; border: 2px solid #7c3aed; border-radius: 8px; padding: 12px; max-width: 480px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <h4 style="font-size: 13px; color: #581c87; margin-bottom: 6px;">ประเมินความพึงพอใจการปฏิบัติงาน</h4>
      <p style="font-size: 11px; color: #64748b; margin-bottom: 8px;">กรุณาให้คะแนนคุณภาพงานซ่อมและความรวดเร็วในการให้บริการ</p>
      <div style="font-size: 24px; color: #f59e0b; margin-bottom: 10px; letter-spacing: 4px;">
        &#9733; &#9733; &#9733; &#9733; &#9733; <span style="font-size: 12px; color: #15803d; font-weight: bold;">(5.0 ยอดเยี่ยม)</span>
      </div>
      <div class="mock-form-row">
        <label class="mock-label">ข้อเสนอแนะเพิ่มเติม</label>
        <div class="mock-input">ช่างมาตรงเวลา ปฏิบัติงานรวดเร็ว เรียบร้อย สะอาดมาก</div>
      </div>
      <div style="text-align: right; margin-top: 8px;">
        <span class="mock-btn btn-purple">ยืนยันปิดใบงานสมบูรณ์ (Closed)</span>
      </div>
    </div>
  </div>

  <!-- SECTION 4: TECHNICIAN TELEGRAM MINI APP -->
  <div class="page-break"></div>
  <h2>4. คู่มือช่างเทคนิค: การปฏิบัติงานผ่าน Telegram Mini App</h2>

  <div class="mockup-container avoid-break">
    <div class="mockup-header-title">ภาพประกอบที่ 4 & 5: หน้าจอ Telegram และการทำงานจริงของช่างเทคนิคบนมือถือ</div>
    <div class="phone-mockup-wrapper">
      
      <!-- PHONE 1: TELEGRAM CHAT -->
      <div class="phone-frame">
        <div class="phone-notch">
          <span>14:15</span>
          <span>5G | 100%</span>
        </div>
        <div class="phone-screen">
          <div style="text-align: center; color: #64748b; font-size: 10px; margin-bottom: 8px;">Maintenance QC Bot</div>
          
          <div class="tg-bubble">
            <strong style="color: #1e3a8a; font-size: 11.5px; display: block; margin-bottom: 4px;">แจ้งเตือนงานซ่อมบำรุง</strong>
            <div>ใบงาน: <code>TICK-2026-0001</code></div>
            <div>สถานะ: <strong>มอบหมายทีมช่างแล้ว</strong></div>
            <div style="color: #475569; margin: 4px 0;">แอร์ห้องเซิร์ฟเวอร์น้ำหยด สาขาพระราม 9</div>
            <div class="tg-btn-inline">เปิดดูใบงานในระบบ</div>
          </div>
        </div>
        <div class="tg-bottom-bar">
          <div class="tg-menu-btn">เปิดระบบซ่อมบำรุง</div>
        </div>
      </div>

      <!-- PHONE 2: MINI APP WORK DETAIL -->
      <div class="phone-frame">
        <div class="phone-notch">
          <span>14:22</span>
          <span>Mini App</span>
        </div>
        <div class="phone-screen" style="background: #ffffff;">
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="font-size: 12px; color: #0f172a;">TICK-2026-0001</strong>
            <div style="font-size: 10px; color: #2563eb; font-weight: 600;">กำลังดำเนินการ (In Progress)</div>
          </div>

          <!-- GPS Hop Box -->
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 6px; margin-bottom: 8px; font-size: 10px;">
            <div>ระยะทางช่วงเดินทาง: <strong>6.5 กม.</strong></div>
            <div>ประมาณการค่าน้ำมัน (เรท 5.50 บ.): <strong style="color: #1d4ed8;">35.75 บาท</strong></div>
          </div>

          <!-- Spare Parts Mini Table -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
            <div style="background: #f1f5f9; padding: 4px 6px; font-weight: 600; font-size: 9.5px;">อะไหล่ที่เบิกใช้จริง</div>
            <div style="padding: 4px 6px; font-size: 9.5px; border-bottom: 1px solid #f1f5f9;">1. ไส้กรองอากาศ (2 ชิ้น) = 900 บ.</div>
            <div style="padding: 4px 6px; font-size: 9.5px; border-bottom: 1px solid #f1f5f9;">2. แคปรันแอร์ 35uF (1 ชิ้น) = 280 บ.</div>
            <div style="padding: 4px 6px; font-size: 10px; font-weight: bold; background: #faf5ff; text-align: right;">รวม: 1,180.00 บาท</div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="background: #2563eb; color: #fff; text-align: center; padding: 5px; border-radius: 4px; font-size: 10px; font-weight: 600;">ลงชื่อเข้าพื้นที่ (GPS Check-in)</div>
            <div style="background: #0f172a; color: #fff; text-align: center; padding: 5px; border-radius: 4px; font-size: 10px; font-weight: 600;">บันทึกการเบิกใช้อะไหล่</div>
            <div style="background: #16a34a; color: #fff; text-align: center; padding: 5px; border-radius: 4px; font-size: 10px; font-weight: 600;">ส่งมอบงาน (Submit Work)</div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- SECTION 5: ADMIN DASHBOARD -->
  <div class="page-break"></div>
  <h2>5. ศูนย์บัญชาการและแดชบอร์ดผู้บริหาร (Executive Command Center)</h2>

  <div class="mockup-container avoid-break">
    <div class="mockup-header-title">ภาพประกอบที่ 6: แดชบอร์ดสรุปผลภาพรวมผู้บริหาร (Executive Analytics)</div>
    <div class="window-frame">
      <div class="window-topbar">
        <div class="window-dot dot-red"></div>
        <div class="window-dot dot-yellow"></div>
        <div class="window-dot dot-green"></div>
        <div class="window-url">https://maintenance-qc-saas.../dashboard</div>
      </div>
      <div class="window-body">
        <div class="metrics-grid">
          <div class="metric-box">
            <div class="metric-val" style="color: #2563eb;">142</div>
            <div class="metric-lbl">ใบงานทั้งหมด</div>
          </div>
          <div class="metric-box">
            <div class="metric-val" style="color: #d97706;">18</div>
            <div class="metric-lbl">กำลังดำเนินการ</div>
          </div>
          <div class="metric-box">
            <div class="metric-val" style="color: #7c3aed;">7</div>
            <div class="metric-lbl">รอผู้จัดการตรวจรับ</div>
          </div>
          <div class="metric-box">
            <div class="metric-val" style="color: #16a34a;">94.2%</div>
            <div class="metric-lbl">ผ่านตรวจรับรอบแรก (QC)</div>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11px;">
          <div>
            <strong style="color: #1e3a8a;">สรุปรายงานค่าน้ำมันสะสม (Fuel Summary)</strong>
            <div style="margin-top: 4px;">ระยะทางรวม: <strong>3,420 กิโลเมตร</strong></div>
            <div>ยอดเบิกจ่ายค่าน้ำมัน: <strong>18,810 บาท</strong> (อัตรากลาง 5.50 บ./กม.)</div>
          </div>
          <div>
            <strong style="color: #1e3a8a;">ประสิทธิภาพการปิดงาน (MTTR)</strong>
            <div style="margin-top: 4px;">เวลาเฉลี่ยจนถึงปิดงาน: <strong>2.4 ชั่วโมง</strong></div>
            <div>ระดับความพึงพอใจเฉลี่ย: <strong style="color: #f59e0b;">4.85 / 5.0 ดาว</strong></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 6: TROUBLESHOOTING -->
  <h2>6. การแก้ปัญหาเบื้องต้นและคำถามที่พบบ่อย (Troubleshooting)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 35%;">ปัญหาที่พบ</th>
        <th style="width: 65%;">วิธีแก้ไขที่ถูกต้อง</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>พิกัด GPS เช็คอินไม่ขึ้น</strong></td>
        <td>เปิด Location บนโทรศัพท์มือถือ และกดอนุญาต (Allow) ให้ Telegram เข้าถึงตำแหน่ง</td>
      </tr>
      <tr>
        <td><strong>ปุ่ม [Open] ใน Telegram ไม่แสดง</strong></td>
        <td>เข้าไปที่ <code>@BotFather</code> เลือก <strong>Mini Apps > Main App</strong> กรอก URL <code>https://maintenance-qc-saas.goog555goog.workers.dev</code> และกด Save</td>
      </tr>
      <tr>
        <td><strong>ต้องการให้พนักงานใหม่รับแจ้งเตือน</strong></td>
        <td>เปิดแอป Telegram ค้นหา <code>@Maintenance_QC_Bot</code> แล้วแตะปุ่ม <em>[ เปิดระบบซ่อมบำรุง ]</em> ระบบจะผูกบัญชีให้อัตโนมัติ</td>
      </tr>
    </tbody>
  </table>

  <!-- FOOTER -->
  <div class="footer">
    ระบบบริหารงานซ่อมบำรุงและควบคุมคุณภาพ (Maintenance QC SaaS) — เอกสารคู่มือทางการเวอร์ชัน 1.0
  </div>

</body>
</html>
"""

html_path = os.path.abspath('scratch/user_manual_guide.html')
pdf_path = os.path.abspath('user_manual_guide.pdf')
artifact_pdf_path = r'C:\Users\User\.gemini\antigravity\brain\22ab63f3-d4ec-4fe5-8e08-bf497091bfe8\user_manual_guide.pdf'

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
if not os.path.exists(chrome):
    chrome = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

print("Compiling Visual Illustrated PDF with Chrome headless...")
cmd = [
    chrome,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--run-all-compositor-stages-before-draw',
    f'--print-to-pdf={pdf_path}',
    html_path
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)

if os.path.exists(pdf_path):
    size = os.path.getsize(pdf_path)
    print(f"Visual Illustrated PDF generated successfully at {pdf_path} (Size: {size:,} bytes)")
    shutil.copy2(pdf_path, artifact_pdf_path)
    print(f"Copied to artifact: {artifact_pdf_path}")
else:
    print("PDF generation failed:", res.stderr)
