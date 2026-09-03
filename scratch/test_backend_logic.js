/**
 * Comprehensive Backend Logic Debug & Verification Suite
 * Mocks Google Apps Script runtime and verifies all services and business logic.
 */
const fs = require('fs');
const path = require('path');

// 1. Setup Mock Google Apps Script Global Environment
const inMemoryDatabase = {
  Users: [
    {
      user_id: 'EMP-0001',
      username: 'admin',
      name: 'Central Administrator',
      role: 'CENTRAL_ADMIN',
      email: 'admin@system.local',
      branch_id: 'HQ-001',
      active: 'TRUE',
      salt: 'test_salt_123'
    },
    {
      user_id: 'EMP-0002',
      username: 'manager_bkk',
      name: 'Bangkok Branch Manager',
      role: 'BRANCH_MANAGER',
      email: 'mgr.bkk@system.local',
      branch_id: 'BR-BKK-01',
      active: 'TRUE',
      salt: 'test_salt_456'
    },
    {
      user_id: 'EMP-0003',
      username: 'tech_somchai',
      name: 'Somchai Technician',
      role: 'TECHNICIAN',
      email: 'tech.somchai@system.local',
      team_id: 'TEAM-01',
      active: 'TRUE',
      salt: 'test_salt_789'
    }
  ],
  Sessions: [],
  Tickets: [],
  Ticket_Items: [],
  Ticket_Checkins: [],
  Ticket_Reviews: [],
  Ticket_Distances: [],
  Ticket_Spare_Parts: [],
  Teams: [
    { team_id: 'TEAM-01', team_name: 'Alpha Mobile Tech', leader_id: 'EMP-0003', status: 'ACTIVE' }
  ],
  Branches: [
    { branch_id: 'BR-BKK-01', branch_name: 'สาขากรุงเทพพระราม 9', lat: 13.7563, lng: 100.5018, status: 'ACTIVE' }
  ],
  Spare_Parts: [
    { part_id: 'PART-001', part_code: 'FILTER-AIR-01', part_name: 'ไส้กรองอากาศแอร์', unit_price: 450, stock_qty: 20 }
  ],
  Audit_Logs: [],
  System_Config: [
    { key: 'FUEL_RATE_PER_KM', value: '5.50' },
    { key: 'TELEGRAM_BOT_TOKEN', value: '123456:ABC-DEF-GHI' },
    { key: 'MINI_APP_URL', value: 'https://test-app.workers.dev' }
  ],
  Telegram_Users: []
};

const scriptCacheStore = new Map();

global.Utilities = {
  getUuid: () => 'uuid-' + Math.random().toString(36).substring(2, 10),
  computeDigest: (algo, str) => Buffer.from(str),
  base64EncodeWebSafe: (buf) => Buffer.from(buf).toString('base64url'),
  DigestAlgorithm: { SHA_256: 'SHA_256' }
};

global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (k) => null,
    setProperty: (k, v) => {}
  })
};

global.LockService = {
  getScriptLock: () => ({
    waitLock: (timeout) => true,
    releaseLock: () => {}
  })
};

global.CacheService = {
  getScriptCache: () => ({
    get: (k) => scriptCacheStore.get(k) || null,
    put: (k, v, ttl) => scriptCacheStore.set(k, String(v)),
    remove: (k) => scriptCacheStore.delete(k)
  })
};

global.ContentService = {
  MimeType: { JSON: 'application/json' },
  createTextOutput: (str) => ({
    content: str,
    mimeType: '',
    setMimeType: function(m) { this.mimeType = m; return this; }
  })
};

global.UrlFetchApp = {
  fetch: (url, opts) => {
    return {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ ok: true, result: true })
    };
  }
};

// Mock Database wrapper
global.Database = {
  getInstance: () => ({
    query: (sheetName, filter = {}) => {
      const rows = inMemoryDatabase[sheetName] || [];
      return rows.filter(row => {
        for (const k in filter) {
          if (String(row[k]) !== String(filter[k])) return false;
        }
        return true;
      });
    },
    insert: (sheetName, obj) => {
      if (!inMemoryDatabase[sheetName]) inMemoryDatabase[sheetName] = [];
      inMemoryDatabase[sheetName].push({ ...obj });
      return obj;
    },
    update: (sheetName, keyField, keyValue, updateObj) => {
      const rows = inMemoryDatabase[sheetName] || [];
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][keyField]) === String(keyValue)) {
          rows[i] = { ...rows[i], ...updateObj };
          return true;
        }
      }
      return false;
    },
    delete: (sheetName, keyField, keyValue) => {
      const rows = inMemoryDatabase[sheetName] || [];
      inMemoryDatabase[sheetName] = rows.filter(r => String(r[keyField]) !== String(keyValue));
      return true;
    }
  })
};

// 2. Load and evaluate backend files in topological order
const backendDir = path.resolve(__dirname, '../backend');
const filesToLoad = [
  'Utils.gs',
  'Validation.gs',
  'Security.gs',
  'AuditService.gs',
  'RBAC.gs',
  'PermissionService.gs',
  'Auth.gs',
  'DistanceService.gs',
  'FuelService.gs',
  'SparePartService.gs',
  'NotificationService.gs',
  'TelegramService.gs',
  'TicketService.gs',
  'AssignmentService.gs',
  'ReassignService.gs',
  'GPSService.gs',
  'WorkSessionService.gs',
  'ReviewService.gs',
  'Router.gs',
  'Code.gs'
];

console.log('Loading backend files...');
for (const file of filesToLoad) {
  const fullPath = path.join(backendDir, file);
  if (!fs.existsSync(fullPath)) {
    console.error('File missing:', file);
    process.exit(1);
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(/^(const|let|var)\s+([A-Za-z0-9_]+)\s*=/gm, 'global.$2 =');
  content = content.replace(/^function\s+([A-Za-z0-9_]+)\s*\(/gm, 'global.$1 = function(');
  try {
    (new Function(content))();
    console.log('  Loaded: ' + file);
  } catch (err) {
    console.error('  Failed to eval ' + file + ':', err);
    process.exit(1);
  }
}

// 3. Execution of Debug Tests
const results = [];
function test(name, fn) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log('[PASS]', name);
  } catch (err) {
    results.push({ name, passed: false, error: err.message, stack: err.stack });
    console.error('[FAIL]', name, ':', err.message);
  }
}

console.log('\n--- RUNNING LOGIC & BUSINESS VERIFICATION SUITE ---\n');

// TEST 1: Password Hash & Verification
test('Security: Hash and Salt Password verification', () => {
  const salt = Security.generateSalt();
  const pass = 'SuperSecret123';
  const hashed = Security.hashPassword(pass, salt);
  const verifyHash = Security.hashPassword(pass, salt);
  if (hashed !== verifyHash) throw new Error('Password hash does not match');
  const wrongHash = Security.hashPassword('WrongPass', salt);
  if (hashed === wrongHash) throw new Error('Wrong password produced identical hash');
});

// TEST 2: Auth Login & Session Generation
let adminToken = '';
let managerToken = '';
let techToken = '';
test('Auth: Login as Central Admin with default password', () => {
  const res = Auth.login({ username: 'EMP-0001', password: 'EMP-0001' });
  if (!res.token || res.user.role !== 'CENTRAL_ADMIN') {
    throw new Error('Admin login failed or invalid role');
  }
  adminToken = res.token;
});

test('Auth: Login as Branch Manager with default password', () => {
  const res = Auth.login({ username: 'EMP-0002', password: 'EMP-0002' });
  if (!res.token || res.user.role !== 'BRANCH_MANAGER') {
    throw new Error('Manager login failed or invalid role');
  }
  managerToken = res.token;
});

test('Auth: Login as Technician with default password', () => {
  const res = Auth.login({ username: 'EMP-0003', password: 'EMP-0003' });
  if (!res.token || res.user.role !== 'TECHNICIAN') {
    throw new Error('Tech login failed or invalid role');
  }
  techToken = res.token;
});

test('Auth: Prevent login with invalid password', () => {
  let thrown = false;
  try {
    Auth.login({ username: 'EMP-0001', password: 'IncorrectPassword' });
  } catch (e) {
    thrown = true;
  }
  if (!thrown) throw new Error('Did not throw error on wrong password');
});

// TEST 3: RBAC & Permissions
test('RBAC: Validate role permissions', () => {
  const adminCtx = Auth.verifyToken(adminToken);
  const mgrCtx = Auth.verifyToken(managerToken);
  const techCtx = Auth.verifyToken(techToken);

  if (adminCtx.role !== 'CENTRAL_ADMIN') throw new Error('Admin context mismatch');
  if (mgrCtx.role !== 'BRANCH_MANAGER') throw new Error('Manager context mismatch');
  if (techCtx.role !== 'TECHNICIAN') throw new Error('Tech context mismatch');
});

// TEST 4: Ticket Creation by Branch Manager
let createdTicketId = '';
test('TicketService: Branch Manager creates a new ticket via Router', () => {
  const ticketData = {
    branch_id: 'BR-BKK-01',
    category: 'AIR_CONDITION',
    priority: 'HIGH',
    overview: 'แอร์ห้องเซิร์ฟเวอร์มีน้ำหยดและไม่เย็น',
    items: [
      { category: 'AIR_CONDITION', detail: 'แอร์ตัวที่ 1 มีน้ำแอร์หยด', location: 'Server Room FL 2' }
    ]
  };

  const res = Router.route('ticket.create', ticketData, managerToken);
  if (!res || !res.ticket_id) {
    throw new Error('Ticket creation failed: ' + JSON.stringify(res));
  }
  createdTicketId = res.ticket_id;

  const fetched = Router.route('ticket.get', { ticket_id: createdTicketId }, managerToken);
  if (fetched.status !== 'WAITING_ASSIGNMENT') {
    throw new Error('Ticket created with unexpected status: ' + fetched.status);
  }
});

// TEST 5: Ticket Assignment by Central Admin
test('TicketService: Central Admin assigns ticket to Tech Team via Router', () => {
  const res = Router.route('ticket.assign', {
    ticket_id: createdTicketId,
    team_id: 'TEAM-01'
  }, adminToken);

  if (!res.success) {
    throw new Error('Ticket assignment failed: ' + JSON.stringify(res));
  }

  const fetched = Router.route('ticket.get', { ticket_id: createdTicketId }, adminToken);
  if (fetched.status !== 'ASSIGNED') {
    throw new Error('Ticket status not ASSIGNED: ' + fetched.status);
  }
});

// TEST 6: Technician Check-In (GPS & Hop Distance)
test('TicketService: Technician GPS Check-in & distance calculation via Router', () => {
  const res = Router.route('ticket.checkin', {
    ticket_id: createdTicketId,
    latitude: 13.7570,
    longitude: 100.5020,
    accuracy: 10
  }, techToken);

  if (!res || !res.gps_id) {
    throw new Error('Technician check-in failed: ' + JSON.stringify(res));
  }

  const fetched = Router.route('ticket.get', { ticket_id: createdTicketId }, techToken);
  if (fetched.status !== 'IN_PROGRESS') {
    throw new Error('Ticket status after checkin not IN_PROGRESS: ' + fetched.status);
  }
});

// TEST 7: Spare Parts Deduction
test('SparePartService: Technician records used spare parts via Router', () => {
  const partsPayload = {
    ticket_id: createdTicketId,
    items: [
      { part_id: 'PART-001', part_name: 'ไส้กรองอากาศแอร์', qty: 2, unit_price: 450 }
    ]
  };

  const res = Router.route('ticket.spare_parts.save', partsPayload, techToken);
  if (!res.success || Number(res.total_amount) !== 900) {
    throw new Error('Spare part calculation failed: expected 900, got ' + res.total_amount);
  }
});

// TEST 8: Technician Work Submission
test('TicketService: Technician submits completed work via Router', () => {
  const res = Router.route('ticket.submit', {
    ticket_id: createdTicketId,
    technician_note: 'ล้างทำความสะอาดท่อน้ำทิ้งและเปลี่ยนไส้กรองเรียบร้อย แอร์เย็นปกติ',
    work_completed: true
  }, techToken);

  if (!res.success) {
    throw new Error('Work submission failed: ' + JSON.stringify(res));
  }

  const fetched = Router.route('ticket.get', { ticket_id: createdTicketId }, techToken);
  if (fetched.status !== 'COMPLETED_BY_TECH') {
    throw new Error('Status not COMPLETED_BY_TECH: ' + fetched.status);
  }
});

// TEST 9: Branch Manager Rework Cycle
test('ReviewService: Branch Manager rejects work for Rework via Router', () => {
  const res = Router.route('ticket.review', {
    ticket_id: createdTicketId,
    review_status: 'REJECTED_REWORK',
    comments: 'ยังมีคราบน้ำซึมด้านหลังโครงแอร์ กรุณาเช็ดทำความสะอาดให้เรียบร้อย'
  }, managerToken);

  if (!res.success || res.status !== 'REJECTED_REWORK') {
    throw new Error('Ticket rework rejection failed: ' + JSON.stringify(res));
  }
});

// TEST 10: Technician Resubmission after Rework
test('TicketService: Technician resubmits work after Rework via Router', () => {
  const res = Router.route('ticket.submit', {
    ticket_id: createdTicketId,
    technician_note: 'เช็ดทำความสะอาดคราบน้ำด้านหลังโครงเรียบร้อย สะอาด 100%',
    work_completed: true
  }, techToken);

  if (!res.success) {
    throw new Error('Resubmission failed: ' + JSON.stringify(res));
  }

  const fetched = Router.route('ticket.get', { ticket_id: createdTicketId }, techToken);
  if (fetched.status !== 'COMPLETED_BY_TECH') {
    throw new Error('Status not COMPLETED_BY_TECH after rework: ' + fetched.status);
  }
});

// TEST 11: Branch Manager Final Approval & Ticket Close
test('ReviewService: Branch Manager approves and closes ticket via Router', () => {
  const reviewRes = Router.route('ticket.review', {
    ticket_id: createdTicketId,
    review_status: 'APPROVED',
    comments: 'ตรวจรับงานผ่านเรียบร้อย ช่างทำงานเรียบร้อยมาก'
  }, managerToken);

  if (!reviewRes.success || reviewRes.status !== 'COMPLETED') {
    throw new Error('Manager approval failed: ' + JSON.stringify(reviewRes));
  }

  const closeRes = Router.route('ticket.close', {
    ticket_id: createdTicketId,
    satisfaction_score: 5
  }, managerToken);

  if (!closeRes.success) {
    throw new Error('Ticket close failed: ' + JSON.stringify(closeRes));
  }

  const fetched = Router.route('ticket.get', { ticket_id: createdTicketId }, managerToken);
  if (fetched.status !== 'CLOSED') {
    throw new Error('Ticket status is not CLOSED: ' + fetched.status);
  }
});

// TEST 12: Telegram Webhook Ultra-Fast Reply & Deduplication
test('TelegramService: Ultra-fast Webhook Reply verification', () => {
  const update = {
    update_id: 1001,
    message: {
      message_id: 50,
      chat: { id: 987654321 },
      text: '/start'
    }
  };

  const res1 = TelegramService.handleWebhook(update);
  if (res1.method !== 'sendMessage' || !res1.reply_markup || !res1.reply_markup.keyboard) {
    throw new Error('Telegram webhook response invalid: ' + JSON.stringify(res1));
  }
  if (!res1.reply_markup.is_persistent) {
    throw new Error('Reply markup is not persistent');
  }

  // Deduplication check
  const res2 = TelegramService.handleWebhook(update);
  if (res2.method === 'sendMessage') {
    throw new Error('Duplicate update_id was not ignored');
  }
  if (!res2.ok) {
    throw new Error('Deduplicated response does not return ok: true');
  }
});

// TEST 13: Great Circle Distance Calculation
test('DistanceService: Valid GPS distance calculation', () => {
  // Bangkok (13.7563, 100.5018) to Nonthaburi (13.8621, 100.5134) ~ 11.8 km
  const km = DistanceService.calculateStraightLineDistance(13.7563, 100.5018, 13.8621, 100.5134);
  if (km < 11 || km > 13) {
    throw new Error('Distance calculation out of expected range: ' + km);
  }
});

// TEST 14: Router Dispatcher
test('Router: End-to-end Router dispatch test', () => {
  const routerRes = Router.route('work_type.list', {}, adminToken);
  if (!Array.isArray(routerRes)) {
    throw new Error('Router dispatch failed: ' + JSON.stringify(routerRes));
  }
});

// Summary
console.log('\n--- VERIFICATION SUMMARY ---');
const total = results.length;
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`Total Tests : ${total}`);
console.log(`Passed      : ${passed}`);
console.log(`Failed      : ${failed}`);

if (failed > 0) {
  console.error('\nFAILURES:');
  results.filter(r => !r.passed).forEach(r => console.error(`- ${r.name}: ${r.error}`));
  process.exit(1);
} else {
  console.log('\nALL BUSINESS LOGIC AND SERVICES PASSED WITH ZERO ERRORS!');
  process.exit(0);
}
