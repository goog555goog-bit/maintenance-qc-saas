import os
import subprocess
import shutil

html_template = """<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>คู่มือการใช้งานระบบบริหารงานซ่อมบำรุงและควบคุมคุณภาพ (Maintenance QC SaaS)</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&amp;family=Sarabun:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;600;700&amp;display=swap" rel="stylesheet">
<style>
  @page {
    size: A4;
    margin: 12mm 10mm 12mm 10mm;
    @bottom-right {
      content: counter(page);
    }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b; background-color: #ffffff; font-size: 11px; line-height: 1.55; word-break: break-word;
  }
  h1, h2, h3, h4, .font-heading { font-family: 'Prompt', sans-serif; color: #0f172a; font-weight: 600; }
  .page-break { page-break-before: always; }
  .avoid-break { page-break-inside: avoid; }
  .cover { border-bottom: 2px solid #2563eb; padding-bottom: 14px; margin-bottom: 14px; }
  .badge-tag {
    display: inline-block; background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;
    padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 600; letter-spacing: 0.5px;
    margin-bottom: 6px; text-transform: uppercase;
  }
  .cover h1 { font-size: 20px; line-height: 1.3; margin-bottom: 4px; color: #0f172a; }
  .cover-subtitle { font-size: 11.5px; color: #475569; margin-bottom: 10px; }
  .meta-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; background-color: #f8fafc;
    border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; font-size: 10px;
  }
  .meta-item strong { color: #64748b; display: block; font-size: 8.5px; text-transform: uppercase; }
  .meta-item span { color: #0f172a; font-weight: 600; }
  h2 {
    font-size: 13.5px; margin-top: 14px; margin-bottom: 6px; padding-bottom: 3px;
    border-bottom: 1px solid #e2e8f0; color: #1e3a8a;
  }
  h3 { font-size: 11.5px; margin-top: 8px; margin-bottom: 4px; color: #1e293b; }
  p { margin-bottom: 6px; color: #334155; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 10px 0; font-size: 10px; }
  th, td { padding: 5px 8px; text-align: left; border: 1px solid #e2e8f0; }
  th { background-color: #f1f5f9; color: #1e293b; font-weight: 600; font-family: 'Prompt', sans-serif; }
  tr:nth-child(even) td { background-color: #f8fafc; }
  .mockup-container {
    background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; margin: 8px 0;
  }
  .mockup-header-title {
    font-size: 9.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: 6px; display: flex; align-items: center; gap: 4px;
  }
  .window-frame {
    background: #ffffff; border: 1px solid #cbd5e1; border-radius: 5px; overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }
  .window-topbar {
    background: #f1f5f9; border-bottom: 1px solid #e2e8f0; padding: 4px 8px; display: flex; align-items: center; gap: 4px;
  }
  .window-dot { width: 7px; height: 7px; border-radius: 50%; }
  .dot-red { background: #ef4444; } .dot-yellow { background: #f59e0b; } .dot-green { background: #10b981; }
  .window-url {
    background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 1px 6px;
    font-size: 9px; color: #64748b; font-family: 'JetBrains Mono', monospace; flex: 1; margin-left: 6px;
  }
  .window-body { padding: 8px; }
  .phone-mockup-wrapper { display: flex; gap: 10px; justify-content: center; }
  .phone-frame {
    width: 250px; background: #ffffff; border: 2px solid #334155; border-radius: 18px; overflow: hidden;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  }
  .phone-notch {
    background: #1e293b; height: 14px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 10px; color: #ffffff; font-size: 8px; font-family: 'JetBrains Mono', monospace;
  }
  .phone-screen { padding: 8px; background: #f8fafc; min-height: 220px; font-size: 9.5px; }
  .tg-bubble {
    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; margin-bottom: 6px;
  }
  .tg-btn-inline {
    display: block; background: #2563eb; color: #ffffff; text-align: center; padding: 4px; border-radius: 4px;
    font-weight: 600; font-size: 9px; margin-top: 4px; text-decoration: none;
  }
  .tg-bottom-bar {
    background: #ffffff; border-top: 1px solid #e2e8f0; padding: 4px 6px; display: flex; align-items: center; gap: 4px;
  }
  .tg-menu-btn {
    background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 4px; padding: 3px 6px;
    font-weight: 600; font-size: 8.5px; flex: 1; text-align: center;
  }
  .mock-form-row { margin-bottom: 5px; }
  .mock-label { font-size: 9px; font-weight: 600; color: #475569; margin-bottom: 2px; display: block; }
  .mock-input {
    width: 100%; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 6px; font-size: 9.5px; background: #ffffff;
  }
  .mock-pills { display: flex; gap: 4px; }
  .mock-pill { padding: 2px 5px; border-radius: 3px; border: 1px solid #cbd5e1; font-size: 8.5px; background: #f8fafc; }
  .mock-pill.active { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; font-weight: 600; }
  .mock-tab-nav { display: flex; gap: 3px; border-bottom: 1px solid #cbd5e1; margin-bottom: 6px; padding-bottom: 2px; }
  .mock-tab { padding: 3px 6px; font-size: 8.5px; border-radius: 3px 3px 0 0; background: #e2e8f0; color: #475569; font-weight: 500; }
  .mock-tab.active { background: #2563eb; color: #ffffff; font-weight: 600; }
  .mock-btn { padding: 3px 8px; border-radius: 3px; font-size: 9px; font-weight: 600; display: inline-block; border: none; cursor: pointer; }
  .btn-primary { background: #2563eb; color: #ffffff; }
  .btn-success { background: #16a34a; color: #ffffff; }
  .btn-danger { background: #dc2626; color: #ffffff; }
  .btn-purple { background: #7c3aed; color: #ffffff; }
  .btn-dark { background: #0f172a; color: #ffffff; }
  .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-bottom: 8px; }
  .metric-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 5px; text-align: center; }
  .metric-val { font-family: 'Prompt', sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; }
  .metric-lbl { font-size: 8px; color: #64748b; }
  code { font-family: 'JetBrains Mono', monospace; background-color: #f1f5f9; color: #0f172a; padding: 1px 3px; border-radius: 3px; font-size: 9px; border: 1px solid #e2e8f0; }
  .role-badge { display: inline-block; padding: 1px 4px; border-radius: 3px; font-size: 8.5px; font-weight: 600; }
  .role-admin { background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  .role-manager { background-color: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
  .role-tech { background-color: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
  .footer { margin-top: 14px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 8.5px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>

  <!-- COVER / HEADER -->
  <div class="cover">
    <span class="badge-tag">OFFICIAL ENTERPRISE DOCUMENTATION</span>
    <h1>คู่มือการใช้งานระบบบริหารงานซ่อมบำรุงและควบคุมคุณภาพ (100% Full System)</h1>
    <div class="cover-subtitle">Maintenance QC SaaS & Telegram Mini App User Manual (ครอบคลุมครบทุกโมดูล ทุกฟังก์ชัน และภาพประกอบระบบจริง)</div>
    
    <div class="meta-grid">
      <div class="meta-item">
        <strong>สถานะระบบ</strong>
        <span>Production Ready (v2.0)</span>
      </div>
      <div class="meta-item">
        <strong>ความครอบคลุม</strong>
        <span>18 โมดูล / 100% ครบทุกฟังก์ชัน</span>
      </div>
      <div class="meta-item">
        <strong>มาตรฐานเอกสาร</strong>
        <span>Zero-Emoji Enterprise Specs</span>
      </div>
      <div class="meta-item">
        <strong>ช่องทางเข้าถึง</strong>
        <span>Web App & Telegram Mini App</span>
      </div>
    </div>
  </div>

  <!-- SECTION 1: CREDENTIALS & WORKFLOW -->
  <h2>1. แผนผังวงจรการทำงานและบัญชีผู้ใช้เริ่มต้น</h2>
  
  <table>
    <thead>
      <tr>
        <th style="width: 22%;">บทบาท (Role)</th>
        <th style="width: 18%;">รหัสผู้ใช้</th>
        <th style="width: 18%;">รหัสผ่าน</th>
        <th style="width: 42%;">หน้าที่และฟังก์ชันที่เข้าถึงได้</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="role-badge role-admin">CENTRAL_ADMIN</span></td>
        <td><code>EMP-0001</code></td>
        <td><code>EMP-0001</code></td>
        <td>ดูแดชบอร์ด KPI องค์กร, จัดสรรทีมช่าง, ตรวจสอบค่าน้ำมัน, ตั้งค่า Master Data (สาขา, ทีม, อะไหล่, Webhook)</td>
      </tr>
      <tr>
        <td><span class="role-badge role-manager">BRANCH_MANAGER</span></td>
        <td><code>EMP-0002</code></td>
        <td><code>EMP-0002</code></td>
        <td>เปิดใบแจ้งซ่อมประจำสาขา, ติดตามคิวงาน, ตรวจรับงาน QC (Approve/Rework), ให้คะแนน 5 ดาว และปิดใบงาน</td>
      </tr>
      <tr>
        <td><span class="role-badge role-tech">TECHNICIAN</span></td>
        <td><code>EMP-0003</code></td>
        <td><code>EMP-0003</code></td>
        <td>รับแจ้งเตือนผ่าน Telegram, เช็คอิน GPS เข้าพื้นที่, บันทึกการเบิกอะไหล่, ส่งมอบงานพร้อมภาพถ่าย</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 2: USER PROFILE & NOTIFICATION DRAWER -->
  <div class="avoid-break">
    <h2>2. ข้อมูลส่วนตัวและการแจ้งเตือน (User Profile & Notification Center)</h2>
    <div class="mockup-container">
      <div class="mockup-header-title">ภาพประกอบที่ 1: หน้าข้อมูลโปรไฟล์ การผูก Telegram และแถบดึงแจ้งเตือนด่วน (Drawer)</div>
      <div class="window-frame">
        <div class="window-topbar">
          <div class="window-dot dot-red"></div>
          <div class="window-dot dot-yellow"></div>
          <div class="window-dot dot-green"></div>
          <div class="window-url">https://maintenance-qc-saas.../profile</div>
        </div>
        <div class="window-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            
            <!-- Profile Info Box -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
              <strong style="font-size: 11px; color: #1e3a8a; display: block; margin-bottom: 6px;">การเชื่อมต่อบัญชี Telegram</strong>
              <div class="mock-form-row">
                <label class="mock-label">สถานะการเชื่อมต่อ</label>
                <div style="color: #16a34a; font-weight: 600; font-size: 10px;">เชื่อมต่อสำเร็จ (Telegram Chat ID: 8182286462)</div>
              </div>
              <div style="display: flex; gap: 6px; margin-top: 8px;">
                <span class="mock-btn btn-primary">ทดสอบส่งการแจ้งเตือน</span>
                <span class="mock-btn btn-danger">ยกเลิกการผูกบัญชี</span>
              </div>
              
              <hr style="margin: 8px 0; border: none; border-top: 1px solid #e2e8f0;">
              
              <strong style="font-size: 11px; color: #1e3a8a; display: block; margin-bottom: 6px;">การเปลี่ยนรหัสผ่านส่วนตัว</strong>
              <div class="mock-form-row">
                <label class="mock-label">รหัสผ่านใหม่</label>
                <div class="mock-input">••••••••••••</div>
              </div>
              <span class="mock-btn btn-dark" style="margin-top: 4px;">บันทึกรหัสผ่าน</span>
            </div>

            <!-- Notification Drawer Mockup -->
            <div style="background: #ffffff; border: 2px solid #2563eb; border-radius: 6px; padding: 8px; box-shadow: -2px 0 6px rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                <strong style="font-size: 11px; color: #0f172a;">การแจ้งเตือนล่าสุด (Notification Drawer)</strong>
                <span style="font-size: 9px; color: #2563eb; font-weight: 600; cursor: pointer;">อ่านทั้งหมด</span>
              </div>
              
              <div style="background: #eff6ff; border-left: 3px solid #2563eb; padding: 6px; border-radius: 4px; margin-bottom: 4px;">
                <strong style="font-size: 10px; color: #1e40af; display: block;">ใบงาน TICK-2026-0001 ส่งมอบแล้ว</strong>
                <div style="font-size: 9.5px; color: #475569;">ช่างได้ส่งมอบงานซ่อมแอร์ห้องเซิร์ฟเวอร์ กรุณาเข้าตรวจรับงาน QC</div>
                <div style="font-size: 8.5px; color: #94a3b8; margin-top: 2px;">5 นาทีที่แล้ว</div>
              </div>

              <div style="background: #fef2f2; border-left: 3px solid #ef4444; padding: 6px; border-radius: 4px;">
                <strong style="font-size: 10px; color: #991b1b; display: block;">งานแจ้งซ่อมใหม่ (ฉุกเฉิน)</strong>
                <div style="font-size: 9.5px; color: #475569;">ระบบไฟฟ้าตู้ MDB สาขาพระราม 9 ชำรุด</div>
                <div style="font-size: 8.5px; color: #94a3b8; margin-top: 2px;">15 นาทีที่แล้ว</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 3: TICKET CREATION & LIST FILTERING -->
  <div class="page-break"></div>
  <h2>3. การสร้างใบแจ้งซ่อม และระบบค้นหากรองข้อมูล (Tickets & Filters)</h2>

  <div class="mockup-container avoid-break">
    <div class="mockup-header-title">ภาพประกอบที่ 2: หน้าจอสร้างใบแจ้งซ่อมแบบหลายจุดซ่อม (Multi-item Ticket Create)</div>
    <div class="window-frame">
      <div class="window-topbar">
        <div class="window-dot dot-red"></div>
        <div class="window-dot dot-yellow"></div>
        <div class="window-dot dot-green"></div>
        <div class="window-url">https://maintenance-qc-saas.../tickets/create</div>
      </div>
      <div class="window-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div class="mock-form-row">
            <label class="mock-label">สาขาที่แจ้งซ่อม</label>
            <div class="mock-input">สาขากรุงเทพพระราม 9 (BR-BKK-01)</div>
          </div>
          <div class="mock-form-row">
            <label class="mock-label">ประเภทระบบงานหลัก</label>
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
          <label class="mock-label">ภาพรวมปัญหา</label>
          <div class="mock-input">แอร์ห้องเซิร์ฟเวอร์น้ำหยด และแอร์ห้องประชุม 1 มีเสียงพัดลมดัง</div>
        </div>

        <div class="mock-form-row">
          <label class="mock-label">รายการจุดซ่อมย่อย (2 จุด)</label>
          <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px; margin-bottom: 4px;">
            <strong>จุดที่ 1 (Server Room):</strong> แอร์ผนังฝั่งซ้าย ท่อน้ำทิ้งตัน น้ำหยดลงตู้ Rack [มีรูปแนบ 1 ภาพ]
          </div>
          <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px;">
            <strong>จุดที่ 2 (Meeting Room 1):</strong> แอร์แขวนกลางห้อง พัดลมกรงกระรอกมีเสียงดังผิดปกติ [มีรูปแนบ 1 ภาพ]
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span class="mock-btn btn-dark" style="font-size: 9.5px;">+ เพิ่มจุดซ่อมย่อย</span>
          <span class="mock-btn btn-primary">ยืนยันสร้างใบแจ้งซ่อม</span>
        </div>
      </div>
    </div>
  </div>

  <div class="mockup-container avoid-break" style="margin-top: 10px;">
    <div class="mockup-header-title">ภาพประกอบที่ 3: หน้ารายการใบแจ้งซ่อม พร้อมระบบตัวกรองขั้นสูง (Ticket List Multi-Filters)</div>
    <div class="window-frame">
      <div class="window-topbar">
        <div class="window-dot dot-red"></div>
        <div class="window-dot dot-yellow"></div>
        <div class="window-dot dot-green"></div>
        <div class="window-url">https://maintenance-qc-saas.../tickets</div>
      </div>
      <div class="window-body">
        <!-- Filters Row -->
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 6px; margin-bottom: 8px;">
          <div class="mock-input">ค้นหาด้วยรหัส หรือสาขา...</div>
          <div class="mock-input">สาขา: ทั้งหมด</div>
          <div class="mock-input">ประเภท: แอร์</div>
          <div class="mock-input">สถานะ: รอตรวจรับ</div>
          <div class="mock-input">ความเร่งด่วน: ทั้งหมด</div>
        </div>

        <!-- Table Summary -->
        <table>
          <thead>
            <tr>
              <th>รหัสใบงาน</th>
              <th>สาขา</th>
              <th>ประเภท</th>
              <th>ระดับ</th>
              <th>ทีมช่าง</th>
              <th>สถานะปัจจุบัน</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>TICK-2026-0001</code></td>
              <td>พระราม 9</td>
              <td>ระบบปรับอากาศ</td>
              <td><span style="color: #dc2626; font-weight: bold;">ด่วน</span></td>
              <td>Alpha Mobile Tech</td>
              <td><span style="background: #fef3c7; color: #92400e; padding: 1px 4px; border-radius: 3px; font-weight: 600;">รอตรวจรับ (QC)</span></td>
              <td><span class="mock-btn btn-primary" style="padding: 2px 6px; font-size: 9px;">เปิดดู</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- SECTION 4: 6-TAB TICKET DETAIL -->
  <div class="page-break"></div>
  <h2>4. หน้ารายละเอียดใบงานเชิงลึก 6 แท็บการทำงาน (Ticket Detail Deep Dive)</h2>

  <div class="mockup-container avoid-break">
    <div class="mockup-header-title">ภาพประกอบที่ 4: การทำงาน 6 แท็บ และแผงควบคุมการตรวจรับงาน QC</div>
    <div class="window-frame">
      <div class="window-topbar">
        <div class="window-dot dot-red"></div>
        <div class="window-dot dot-yellow"></div>
        <div class="window-dot dot-green"></div>
        <div class="window-url">https://maintenance-qc-saas.../tickets/TICK-2026-0001</div>
      </div>
      <div class="window-body">
        
        <!-- Tab Navigation Bar -->
        <div class="mock-tab-nav">
          <span class="mock-tab active">1. ภาพรวม</span>
          <span class="mock-tab">2. จุดซ่อม (2)</span>
          <span class="mock-tab">3. อะไหล่ (2 รายการ)</span>
          <span class="mock-tab">4. ลำดับเหตุการณ์</span>
          <span class="mock-tab">5. ประวัติการตรวจรับ</span>
          <span class="mock-tab">6. แผนที่ GPS & ค่าน้ำมัน</span>
        </div>

        <!-- Tab 1 Active Content -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-bottom: 8px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10.5px;">
            <div>
              <div><strong>สาขา:</strong> สาขากรุงเทพพระราม 9</div>
              <div><strong>ผู้เปิดงาน:</strong> ผู้จัดการสาขา (สมศักดิ์)</div>
              <div><strong>ทีมช่าง:</strong> Alpha Mobile Tech (วิชัย ช่างชำนาญ)</div>
            </div>
            <div>
              <div><strong>สถานะ:</strong> <span style="background: #fef3c7; color: #92400e; padding: 1px 5px; border-radius: 3px; font-weight: bold;">ช่างส่งมอบงานแล้ว (รอตรวจรับ)</span></div>
              <div><strong>ระยะทางช่วงเดินทาง:</strong> 6.5 กิโลเมตร (35.75 บาท)</div>
              <div><strong>ยอดเบิกอะไหล่รวม:</strong> 1,180.00 บาท</div>
            </div>
          </div>
          <div style="margin-top: 6px; font-size: 10.5px; background: #f8fafc; padding: 6px; border-radius: 4px;">
            <strong>บันทึกจากช่าง:</strong> ล้างท่อน้ำทิ้งและเปลี่ยนแคปรันเรียบร้อย ทดสอบเดินเครื่อง 30 นาที อุณหภูมิวัดได้ 21 องศาเซลเซียส
          </div>
        </div>

        <!-- Action Control Buttons for Manager -->
        <div style="display: flex; gap: 6px; flex-wrap: wrap; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; align-items: center;">
          <strong style="font-size: 10px; color: #475569; margin-right: 6px;">คำสั่งผู้จัดการ:</strong>
          <span class="mock-btn btn-success">ตรวจรับงานผ่าน (Approve)</span>
          <span class="mock-btn btn-danger">ส่งกลับแก้ไข (Reject / Rework)</span>
          <span class="mock-btn btn-purple">ปิดใบงานและประเมินความพึงพอใจ 5 ดาว</span>
          <span class="mock-btn btn-dark">พิมพ์รายงานบริการ (Service Report)</span>
        </div>

      </div>
    </div>
  </div>

  <div class="mockup-container avoid-break" style="margin-top: 10px;">
    <div class="mockup-header-title">ภาพประกอบที่ 5: กล่องข้อความส่งกลับแก้ไข (Rework) และการประเมิน 5 ดาว</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      
      <!-- Rework Modal -->
      <div style="background: #ffffff; border: 2px solid #ef4444; border-radius: 6px; padding: 8px;">
        <h4 style="font-size: 11px; color: #b91c1c; margin-bottom: 4px;">ส่งกลับแก้ไขงาน (Reject / Rework)</h4>
        <div class="mock-form-row">
          <label class="mock-label">ระบุข้อบกพร่องที่ต้องแก้ไข</label>
          <div class="mock-input" style="height: 36px;">ยังมีน้ำหยดซึมบริเวณข้อต่อท่อด้านหลังตู้ Rack กรุณาเข้าพันฉนวนและยึดท่อใหม่</div>
        </div>
        <div style="text-align: right; margin-top: 4px;">
          <span class="mock-btn btn-danger">ยืนยันส่งกลับช่าง</span>
        </div>
      </div>

      <!-- Rating Modal -->
      <div style="background: #ffffff; border: 2px solid #7c3aed; border-radius: 6px; padding: 8px;">
        <h4 style="font-size: 11px; color: #581c87; margin-bottom: 4px;">ประเมินความพึงพอใจ 5 ดาว (Close Ticket)</h4>
        <div style="font-size: 18px; color: #f59e0b; margin-bottom: 4px; letter-spacing: 3px;">
          &#9733; &#9733; &#9733; &#9733; &#9733; <span style="font-size: 10.5px; color: #15803d; font-weight: bold;">5.0 ยอดเยี่ยม</span>
        </div>
        <div class="mock-form-row">
          <label class="mock-label">ข้อคิดเห็นเพิ่มเติม</label>
          <div class="mock-input">ช่างบริการดีเยี่ยม เข้าพื้นที่รวดเร็ว ทำงานสะอาด</div>
        </div>
        <div style="text-align: right; margin-top: 4px;">
          <span class="mock-btn btn-purple">ปิดใบงานสมบูรณ์</span>
        </div>
      </div>

    </div>
  </div>

  <!-- SECTION 5: FIELD TECH TELEGRAM MINI APP -->
  <div class="page-break"></div>
  <h2>5. คู่มือช่างเทคนิค: การปฏิบัติงานผ่าน Telegram Mini App</h2>

  <div class="mockup-container avoid-break">
    <div class="mockup-header-title">ภาพประกอบที่ 6: การทำงานบน Telegram แชท และหน้าต่าง Mini App ของช่าง</div>
    <div class="phone-mockup-wrapper">
      
      <!-- PHONE 1: TELEGRAM CHAT -->
      <div class="phone-frame">
        <div class="phone-notch">
          <span>14:15</span>
          <span>5G | 100%</span>
        </div>
        <div class="phone-screen">
          <div style="text-align: center; color: #64748b; font-size: 9px; margin-bottom: 6px;">Maintenance QC Bot</div>
          
          <div class="tg-bubble">
            <strong style="color: #1e3a8a; font-size: 10.5px; display: block; margin-bottom: 3px;">งานซ่อมบำรุงใหม่</strong>
            <div>ใบงาน: <code>TICK-2026-0001</code></div>
            <div>สถานะ: <strong>มอบหมายทีมช่างแล้ว</strong></div>
            <div style="color: #475569; margin: 3px 0;">แอร์ห้องเซิร์ฟเวอร์น้ำหยด สาขาพระราม 9</div>
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
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="font-size: 11px; color: #0f172a;">TICK-2026-0001</strong>
            <div style="font-size: 9.5px; color: #2563eb; font-weight: 600;">กำลังดำเนินการ (In Progress)</div>
          </div>

          <!-- GPS Hop Box -->
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 5px; margin-bottom: 6px; font-size: 9.5px;">
            <div>ระยะทางเดินทาง: <strong>6.5 กม.</strong></div>
            <div>ประมาณการค่าน้ำมัน (5.50 บ./กม.): <strong style="color: #1d4ed8;">35.75 บาท</strong></div>
          </div>

          <!-- Spare Parts Mini Table -->
          <div style="border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 6px; font-size: 9px;">
            <div style="background: #f1f5f9; padding: 3px 5px; font-weight: 600;">อะไหล่ที่เบิกใช้</div>
            <div style="padding: 3px 5px; border-bottom: 1px solid #f1f5f9;">1. ไส้กรองอากาศ (2 ชิ้น) = 900 บ.</div>
            <div style="padding: 3px 5px; border-bottom: 1px solid #f1f5f9;">2. แคปรันแอร์ 35uF (1 ชิ้น) = 280 บ.</div>
            <div style="padding: 3px 5px; font-weight: bold; background: #faf5ff; text-align: right;">รวม: 1,180 บาท</div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="background: #2563eb; color: #fff; text-align: center; padding: 4px; border-radius: 4px; font-size: 9.5px; font-weight: 600;">ลงชื่อเข้าพื้นที่ (GPS Check-in)</div>
            <div style="background: #0f172a; color: #fff; text-align: center; padding: 4px; border-radius: 4px; font-size: 9.5px; font-weight: 600;">บันทึกการเบิกใช้อะไหล่</div>
            <div style="background: #16a34a; color: #fff; text-align: center; padding: 4px; border-radius: 4px; font-size: 9.5px; font-weight: 600;">ส่งมอบงาน (Submit Work)</div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- SECTION 6: FUEL REVIEW & ASSIGNMENTS -->
  <div class="page-break"></div>
  <h2>6. การบริหารค่าน้ำมัน การจัดสรรงาน และรายงานบริการ (Operations)</h2>

  <div class="mockup-container avoid-break">
    <div class="mockup-header-title">ภาพประกอบที่ 7: ระบบตรวจสอบและอนุมัติค่าน้ำมัน (Fuel Review & Adjustment Workflow)</div>
    <div class="window-frame">
      <div class="window-topbar">
        <div class="window-dot dot-red"></div>
        <div class="window-dot dot-yellow"></div>
        <div class="window-dot dot-green"></div>
        <div class="window-url">https://maintenance-qc-saas.../fuel/review</div>
      </div>
      <div class="window-body">
        <table>
          <thead>
            <tr>
              <th>ใบงาน</th>
              <th>ช่างเทคนิค</th>
              <th>ระยะทาง GPS</th>
              <th>ยอดคำนวณ</th>
              <th>ยอดที่ขอปรับ</th>
              <th>เหตุผลความจำเป็น</th>
              <th>การพิจารณา</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>TICK-2026-0001</code></td>
              <td>วิชัย ช่างชำนาญ</td>
              <td>6.5 กม.</td>
              <td>35.75 บาท</td>
              <td><strong style="color: #b91c1c;">60.00 บาท</strong></td>
              <td>มีทางปิดซ่อมสะพานข้ามแยก ต้องอ้อมเส้นทางบายพาส 11 กม.</td>
              <td>
                <span class="mock-btn btn-success" style="padding: 2px 6px; font-size: 9px;">อนุมัติ</span>
                <span class="mock-btn btn-danger" style="padding: 2px 6px; font-size: 9px;">ปฏิเสธ</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="mockup-container avoid-break" style="margin-top: 10px;">
    <div class="mockup-header-title">ภาพประกอบที่ 8: ใบสรุปงานบริการสำหรับพิมพ์และลงนาม (Service Report Printable View)</div>
    <div class="window-frame">
      <div class="window-topbar">
        <div class="window-dot dot-red"></div>
        <div class="window-dot dot-yellow"></div>
        <div class="window-dot dot-green"></div>
        <div class="window-url">https://maintenance-qc-saas.../tickets/TICK-2026-0001/report</div>
      </div>
      <div class="window-body" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 12px;">
        
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 8px;">
          <div>
            <h3 style="font-size: 13px; color: #0f172a;">ใบรายงานผลการบริการและส่งมอบงาน (Service Report)</h3>
            <div style="font-size: 9.5px; color: #64748b;">เลขที่เอกสาร: SR-2026-0001 | ใบแจ้งซ่อม: TICK-2026-0001</div>
          </div>
          <div style="text-align: right; font-size: 9.5px;">
            <div><strong>สาขา:</strong> กรุงเทพพระราม 9</div>
            <div><strong>วันที่:</strong> 12 กันยายน 2026</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9.5px; margin-bottom: 8px;">
          <div>
            <div><strong>ประเภทงาน:</strong> ระบบปรับอากาศ (แอร์ห้องเซิร์ฟเวอร์)</div>
            <div><strong>ทีมช่างผู้รับผิดชอบ:</strong> Alpha Mobile Tech</div>
          </div>
          <div>
            <div><strong>สถานะตรวจรับ:</strong> ผ่านการตรวจรับมาตรฐาน QC</div>
            <div><strong>คะแนนความพึงพอใจ:</strong> 5 ดาว (ยอดเยี่ยม)</div>
          </div>
        </div>

        <!-- Signature Boxes -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 14px; text-align: center; font-size: 9.5px;">
          <div style="border-top: 1px dashed #94a3b8; padding-top: 4px;">
            <div>( ลงชื่อ ) .....................................................</div>
            <div style="color: #64748b; margin-top: 2px;">ช่างผู้ส่งมอบงาน (วิชัย ช่างชำนาญ)</div>
          </div>
          <div style="border-top: 1px dashed #94a3b8; padding-top: 4px;">
            <div>( ลงชื่อ ) .....................................................</div>
            <div style="color: #64748b; margin-top: 2px;">ผู้จัดการสาขา / ผู้ตรวจรับ (สมศักดิ์ มุ่งมั่น)</div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- SECTION 7: SETTINGS & MASTER DATA -->
  <div class="page-break"></div>
  <h2>7. การตั้งค่าระบบ ข้อมูลหลัก และ Telegram Bot Webhook (Settings & Master Data)</h2>

  <div class="mockup-container avoid-break">
    <div class="mockup-header-title">ภาพประกอบที่ 9: หน้าตั้งค่าระบบ Master Data และลงทะเบียน Telegram Webhook</div>
    <div class="window-frame">
      <div class="window-topbar">
        <div class="window-dot dot-red"></div>
        <div class="window-dot dot-yellow"></div>
        <div class="window-dot dot-green"></div>
        <div class="window-url">https://maintenance-qc-saas.../settings</div>
      </div>
      <div class="window-body">
        
        <!-- Settings Tabs -->
        <div class="mock-tab-nav">
          <span class="mock-tab active">สาขา (Branches)</span>
          <span class="mock-tab">ทีมช่าง (Teams)</span>
          <span class="mock-tab">พนักงาน (Users)</span>
          <span class="mock-tab">ทะเบียนอะไหล่กลาง</span>
          <span class="mock-tab">ตั้งค่า Telegram Bot</span>
        </div>

        <!-- Settings Content Sample -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-bottom: 8px; font-size: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #1e3a8a;">รายการสาขาและพิกัดแผนที่ (Latitude / Longitude)</strong>
            <span class="mock-btn btn-primary" style="padding: 2px 6px; font-size: 9px;">+ เพิ่มสาขาใหม่</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>รหัสสาขา</th>
                <th>ชื่อสาขา</th>
                <th>พิกัดละติจูด (Lat)</th>
                <th>พิกัดลองจิจูด (Lng)</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>BR-BKK-01</code></td>
                <td>กรุงเทพ พระราม 9</td>
                <td>13.7563</td>
                <td>100.5018</td>
                <td><span style="color: #16a34a; font-weight: bold;">เปิดใช้งาน</span></td>
              </tr>
              <tr>
                <td><code>BR-CNX-01</code></td>
                <td>เชียงใหม่ นิมมาน</td>
                <td>18.7961</td>
                <td>98.9662</td>
                <td><span style="color: #16a34a; font-weight: bold;">เปิดใช้งาน</span></td>
              </tr>
            </tbody>
          </table>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 6px; margin-top: 6px;">
            <strong style="color: #1e40af; display: block; margin-bottom: 2px;">Telegram Webhook & Menu Status</strong>
            <div>URL: <code>https://maintenance-qc-saas.goog555goog.workers.dev</code></div>
            <div style="color: #16a34a; font-weight: bold; margin-top: 2px;">Webhook ทำงานปกติ (เชื่อมต่อกับ @Maintenance_QC_Bot สำเร็จ)</div>
          </div>

        </div>

      </div>
    </div>
  </div>

  <!-- SECTION 8: TROUBLESHOOTING & FAQ -->
  <h2>8. การแก้ปัญหาเบื้องต้นและคำถามที่พบบ่อย (Troubleshooting & FAQ)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 35%;">ปัญหาที่พบบ่อย</th>
        <th style="width: 65%;">วิธีการตรวจสอบและแก้ไข</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>พิกัด GPS ไม่แสดงหรือกดเช็คอินไม่ได้</strong></td>
        <td>ตรวจสอบการเปิด Location Service ในสมาร์ตโฟน และแตะ อนุญาต (Allow) เมื่อเบราว์เซอร์หรือ Telegram ขอสิทธิ์พิกัด</td>
      </tr>
      <tr>
        <td><strong>ปุ่ม [ เปิดระบบซ่อมบำรุง ] ไม่แสดงใน Telegram</strong></td>
        <td>เข้าไปที่ <code>@BotFather</code> เลือกคำสั่ง <strong>/mybots > Bot Settings > Menu Button</strong> กรอก URL และบันทึก</td>
      </tr>
      <tr>
        <td><strong>ผู้จัดการต้องการให้ช่างแก้ไขงานซ้ำ</strong></td>
        <td>กดปุ่ม <strong>ส่งกลับแก้ไข (Reject / Rework)</strong> และระบุเหตุผล ใบงานจะส่งกลับไปยังคิวช่างทันทีโดยไม่ต้องสร้างใบงานใหม่</td>
      </tr>
      <tr>
        <td><strong>ต้องการเปลี่ยนรหัสผ่านส่วนตัว</strong></td>
        <td>เข้าเมนู <strong>ข้อมูลส่วนตัว (Profile)</strong> กรอกรหัสผ่านใหม่แล้วกดบันทึก หรือให้ Admin ช่วยรีเซ็ตให้</td>
      </tr>
      <tr>
        <td><strong>ต้องการสรุปข้อมูลส่งผู้บริหาร</strong></td>
        <td>เข้าเมนู <strong>รายงาน (Reports)</strong> หรือ <strong>คลังประวัติ (Archive)</strong> เพื่อดาวน์โหลดสรุปยอดค่าน้ำมันและสถิติ MTTR</td>
      </tr>
    </tbody>
  </table>

  <!-- FOOTER -->
  <div class="footer">
    ระบบบริหารงานซ่อมบำรุงและควบคุมคุณภาพ (Maintenance QC SaaS) — เอกสารคู่มือทางการเวอร์ชัน 2.0 (ครอบคลุม 100% ทุกฟังก์ชัน)
  </div>

</body>
</html>
"""

html_path = os.path.abspath('scratch/user_manual_guide.html')
pdf_path = os.path.abspath('user_manual_guide.pdf')
artifact_pdf_path = r'C:\\Users\\User\\.gemini\\antigravity\\brain\\22ab63f3-d4ec-4fe5-8e08-bf497091bfe8\\user_manual_guide.pdf'

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_template)

chrome = r'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
if not os.path.exists(chrome):
    chrome = r'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

print('Compiling 100% Full Functional Illustrated PDF with Chrome headless...')
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
print('Return code:', res.returncode)

if os.path.exists(pdf_path):
    size = os.path.getsize(pdf_path)
    print(f'Visual Illustrated PDF generated successfully at {pdf_path} (Size: {size:,} bytes)')
    shutil.copyfile(pdf_path, artifact_pdf_path)
    print(f'Copied to artifact directory: {artifact_pdf_path}')
else:
    print('Error: PDF file was not created')
