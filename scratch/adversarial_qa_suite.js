/**
 * Adversarial QA & Edge Case Suite
 * Autonomous execution for Principal QA / Security / Concurrency Testing
 */
const fs = require('fs');
const path = require('path');

const inMemoryDatabase = {
  Users: [
    { user_id: 'EMP-0001', username: 'admin', role: 'CENTRAL_ADMIN', active: 'TRUE', salt: 'salt1' },
    { user_id: 'EMP-0002', username: 'mgr_bkk', role: 'BRANCH_MANAGER', branch_id: 'BR-BKK', active: 'TRUE', salt: 'salt2' },
    { user_id: 'EMP-0003', username: 'mgr_cnx', role: 'BRANCH_MANAGER', branch_id: 'BR-CNX', active: 'TRUE', salt: 'salt3' },
    { user_id: 'EMP-0004', username: 'tech_01', role: 'TECHNICIAN', team_id: 'TM-01', active: 'TRUE', salt: 'salt4' }
  ],
  Sessions: [],
  Tickets: [],
  Ticket_Items: [],
  GPS_Checkins: [],
  Work_Assignments: [],
  Work_Sessions: [],
  Reviews: [],
  Ticket_Spare_Parts: [],
  Satisfaction_Scores: [],
  Fuel_Adjustments: [],
  Fuel_Rates: [{ rate_id: 'FR-1', rate_per_km: 5.0 }],
  Branches: [
    { branch_id: 'BR-BKK', branch_name: 'กรุงเทพฯ' },
    { branch_id: 'BR-CNX', branch_name: 'เชียงใหม่' }
  ],
  Audit_Logs: []
};

global.Utilities = {
  getUuid: () => 'uuid-' + Math.random().toString(36).substring(2, 10),
  computeDigest: (algo, str) => Buffer.from(str),
  base64EncodeWebSafe: (buf) => Buffer.from(buf).toString('base64url'),
  DigestAlgorithm: { SHA_256: 'SHA_256' }
};
global.PropertiesService = { getScriptProperties: () => ({ getProperty: () => null, setProperty: () => {} }) };
global.LockService = { getScriptLock: () => ({ waitLock: () => true, releaseLock: () => {} }) };
global.CacheService = { getScriptCache: () => ({ get: () => null, put: () => {}, remove: () => {} }) };
global.ContentService = { MimeType: { JSON: 'application/json' }, createTextOutput: (s) => ({ content: s, setMimeType: () => {} }) };
global.UrlFetchApp = { fetch: () => ({ getResponseCode: () => 200, getContentText: () => '{"ok":true}' }) };

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
      const r = { ...obj };
      inMemoryDatabase[sheetName].push(r);
      return r;
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

const backendDir = path.resolve(__dirname, '../backend');
const files = [
  'Utils.gs', 'Validation.gs', 'Security.gs', 'AuditService.gs', 'RBAC.gs',
  'PermissionService.gs', 'Auth.gs', 'DistanceService.gs', 'FuelService.gs',
  'SparePartService.gs', 'NotificationService.gs', 'TelegramService.gs',
  'TicketService.gs', 'AssignmentService.gs', 'ReassignService.gs',
  'GPSService.gs', 'WorkSessionService.gs', 'ReviewService.gs', 'Router.gs', 'Code.gs'
];
for (const f of files) {
  let c = fs.readFileSync(path.join(backendDir, f), 'utf8');
  c = c.replace(/^(const|let|var)\s+([A-Za-z0-9_]+)\s*=/gm, 'global.$2 =');
  c = c.replace(/^function\s+([A-Za-z0-9_]+)\s*\(/gm, 'global.$1 = function(');
  (new Function(c))();
}

const findings = [];
const adminToken = Auth.login({ username: 'EMP-0001', password: 'EMP-0001' }).token;
const mgrBkkToken = Auth.login({ username: 'EMP-0002', password: 'EMP-0002' }).token;
const mgrCnxToken = Auth.login({ username: 'EMP-0003', password: 'EMP-0003' }).token;
const techToken = Auth.login({ username: 'EMP-0004', password: 'EMP-0004' }).token;

console.log('--- STARTING ADVERSARIAL QA & EDGE CASE EXECUTION ---');

// TEST 1: CSV / Spreadsheet Formula Injection
const formulaPayload = '=cmd|\' /C calc\'!A0';
const sanitizedFormula = Security.sanitizeString(formulaPayload);
if (sanitizedFormula.startsWith("'")) {
  console.log('[SEC-PASS] CSV Formula Injection successfully neutralized with apostrophe quote.');
} else {
  findings.push({ id: 'SEC-01', title: 'Formula injection vulnerability', severity: 'HIGH' });
}

// TEST 2: HTML / Script Tag Injection
const xssPayload = '<img src=x onerror=alert(1)><script>alert(document.cookie)</script>Test Item';
const sanitizedXss = Security.sanitizeString(xssPayload);
if (!sanitizedXss.includes('<script>')) {
  console.log('[SEC-PASS] Script tag stripped successfully.');
} else {
  findings.push({ id: 'SEC-02', title: 'XSS script tags not fully stripped', severity: 'HIGH' });
}

// TEST 3: Negative Spare Part Quantity & Negative Amount
let ticketRes = Router.route('ticket.create', { branch_id: 'BR-BKK', items: [{ detail: 'Air leak' }] }, mgrBkkToken);
let tId = ticketRes.ticket_id;
Router.route('ticket.assign', { ticket_id: tId, team_id: 'TM-01' }, adminToken);
Router.route('ticket.checkin', { ticket_id: tId, latitude: 13.75, longitude: 100.5 }, techToken);

const negPartRes = Router.route('ticket.spare_parts.save', {
  ticket_id: tId,
  items: [{ part_name: 'ฟิลเตอร์', qty: -5, unit_price: 100 }]
}, techToken);
console.log('[BOUNDARY-CHECK] Negative spare part response total:', negPartRes.total_amount);
if (negPartRes.total_amount < 0) {
  findings.push({
    id: 'BUG-BOUNDARY-01',
    title: 'Negative spare part quantity produces negative total cost',
    severity: 'MEDIUM',
    evidence: `Submitted qty -5 at 100 THB -> total_amount was ${negPartRes.total_amount}`
  });
}

// TEST 4: Negative Fuel Adjustment
const negFuelRes = Router.route('fuel.adjust', {
  ticket_id: tId,
  adjusted_amount: -250,
  reason: 'ลดค่าน้ำมัน'
}, techToken);
console.log('[BOUNDARY-CHECK] Negative fuel adjustment status:', negFuelRes.adjusted_amount);
if (negFuelRes.adjusted_amount < 0) {
  findings.push({
    id: 'BUG-BOUNDARY-02',
    title: 'Negative fuel adjustment amount accepted without lower bound check',
    severity: 'LOW',
    evidence: `Negative fuel adjustment allowed: ${negFuelRes.adjusted_amount}`
  });
}

// TEST 5: Extreme / Invalid Satisfaction Score
const extremeScoreRes = Router.route('ticket.close', {
  ticket_id: tId,
  satisfaction_score: 999
}, mgrBkkToken);
const fetchedClosedTicket = inMemoryDatabase.Satisfaction_Scores.find(s => s.ticket_id === tId);
console.log('[BOUNDARY-CHECK] Recorded satisfaction score:', fetchedClosedTicket ? fetchedClosedTicket.score : 'N/A');
if (fetchedClosedTicket && fetchedClosedTicket.score > 5) {
  findings.push({
    id: 'BUG-BOUNDARY-03',
    title: 'Satisfaction score accepts values outside 1-5 rating range',
    severity: 'LOW',
    evidence: `Score recorded as ${fetchedClosedTicket.score}`
  });
}

// TEST 6: Manager Cross-Branch Ticket Creation Scope
const crossBranchRes = Router.route('ticket.create', {
  branch_id: 'BR-CNX', // Manager BKK creates ticket for Chiang Mai
  items: [{ detail: 'Chiang Mai branch test' }]
}, mgrBkkToken);
console.log('[AUTH-CHECK] Cross-branch ticket created ID:', crossBranchRes.ticket_id);
if (crossBranchRes.ticket_id) {
  findings.push({
    id: 'SEC-AUTH-01',
    title: 'Branch Manager can create tickets for other branches without scope check',
    severity: 'MEDIUM',
    evidence: `Manager with branch BR-BKK created ticket for branch BR-CNX (ID: ${crossBranchRes.ticket_id})`
  });
}

// TEST 7: Race Condition in State Transition Validation
// Simulate Manager A closing a ticket while Manager B tries to reject it
const raceTicket = inMemoryDatabase.Tickets.find(t => t.ticket_id === tId);
raceTicket.status = 'CLOSED'; // Already closed in DB
let raceThrown = false;
try {
  // Caller tries to update claiming currentStatus is 'COMPLETED_BY_TECH'
  TicketService.updateTicketStatus(tId, 'COMPLETED_BY_TECH', 'REJECTED_REWORK', Auth.verifyToken(mgrBkkToken));
} catch (e) {
  raceThrown = true;
}
if (!raceThrown) {
  console.log('[CONCURRENCY-CHECK] Race Condition reproduced: Closed ticket was overwritten to REJECTED_REWORK!');
  findings.push({
    id: 'BUG-CONCURRENCY-01',
    title: 'Race condition / stale state overwrite in updateTicketStatus',
    severity: 'HIGH',
    evidence: 'Ticket already CLOSED was overwritten to REJECTED_REWORK because DB current state was not verified against parameter'
  });
} else {
  console.log('[CONCURRENCY-CHECK] State transition conflict prevented.');
}

console.log('\n--- ADVERSARIAL QA FINDINGS ---');
console.log(`Total Findings Discovered: ${findings.length}`);
findings.forEach(f => {
  console.log(`[${f.severity}] ${f.id}: ${f.title}`);
  if (f.evidence) console.log(`  Evidence: ${f.evidence}`);
});
