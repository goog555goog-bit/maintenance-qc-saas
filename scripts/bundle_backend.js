/**
 * Bundle all backend Google Apps Script files into a single unified file
 * for ultra-fast deployment and easy copy-paste.
 */
const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, '..', 'backend');
const outputFile = path.join(__dirname, '..', 'backend_all_in_one.gs');

// Order of files to ensure dependencies load properly
const fileOrder = [
  'Utils.gs',
  'Security.gs',
  'Validation.gs',
  'Database.gs',
  'AuditService.gs',
  'CacheService.gs',
  'PermissionService.gs',
  'RBAC.gs',
  'Auth.gs',
  'NotificationService.gs',
  'DistanceService.gs',
  'GPSService.gs',
  'WorkSessionService.gs',
  'ReviewService.gs',
  'FuelService.gs',
  'TicketService.gs',
  'AssignmentService.gs',
  'ReassignService.gs',
  'ArchiveService.gs',
  'BackupService.gs',
  'SyncService.gs',
  'Router.gs',
  'Code.gs'
];

let bundleContent = `/**
 * ============================================================================
 * MAINTENANCE & QUALITY CONTROL SAAS - UNIFIED BACKEND SCRIPT
 * Generated: ${new Date().toISOString()}
 * ============================================================================
 * Instructions:
 * 1. Open your Google Apps Script project (https://script.google.com)
 * 2. Delete existing code in Code.gs
 * 3. Copy all contents of this file and paste into Code.gs
 * 4. Click 'Save' (Ctrl+S)
 * 5. Click 'Deploy' -> 'Manage deployments' -> Edit (Pencil) -> 'New version' -> 'Deploy'
 * ============================================================================
 */

`;

const filesInDir = fs.readdirSync(backendDir).filter(f => f.endsWith('.gs'));
const orderedFiles = [];

// Add ordered files first
fileOrder.forEach(f => {
  if (filesInDir.includes(f)) {
    orderedFiles.push(f);
  }
});

// Add any remaining files
filesInDir.forEach(f => {
  if (!orderedFiles.includes(f)) {
    orderedFiles.push(f);
  }
});

orderedFiles.forEach(fileName => {
  const filePath = path.join(backendDir, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  bundleContent += `\n\n// ==================== FILE: ${fileName} ====================\n`;
  bundleContent += content;
});

fs.writeFileSync(outputFile, bundleContent, 'utf8');
console.log(`Successfully generated unified backend file: ${outputFile}`);
console.log(`Total files bundled: ${orderedFiles.length}`);
