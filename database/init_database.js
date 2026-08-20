/**
 * Database Initialization Script
 * Run this function in Google Apps Script to create all 24 required sheets, headers, and seed data.
 */

// ใส่ Spreadsheet ID ของคุณตรงนี้ (ถ้าโปรเจกต์ Apps Script ไม่ได้เปิดจากในชีตโดยตรง)
const TARGET_SPREADSHEET_ID = "ใส่_SPREADSHEET_ID_ของคุณที่นี่";

function initDatabase() {
  const schema = {
    "sheets": [
      { "name": "Users", "columns": ["user_id", "username", "email", "password_hash", "salt", "role", "active"] },
      { "name": "Password_Resets", "columns": ["reset_id", "user_id", "email", "otp_code", "expires_at", "used", "created_at"] },
      { "name": "Branches", "columns": ["branch_id", "branch_name", "location_lat", "location_lng", "status"] },
      { "name": "Teams", "columns": ["team_id", "team_name", "status"] },
      { "name": "Fuel_Rates", "columns": ["rate_id", "effective_date", "rate_per_km", "created_by", "created_at", "status"] },
      { "name": "User_Assignment_History", "columns": ["assignment_id", "user_id", "role", "branch_id", "team_id", "effective_from", "effective_to", "assigned_by", "reason"] },
      { "name": "Tickets", "columns": ["ticket_id", "branch_id", "created_by", "created_at", "status", "version"] },
      { "name": "Ticket_Items", "columns": ["item_id", "ticket_id", "description", "status"] },
      { "name": "Work_Assignments", "columns": ["assignment_id", "ticket_id", "team_id", "technician_id", "assigned_by", "assigned_at", "accepted_at", "released_at", "assignment_status", "transfer_reason", "transfer_to_assignment_id"] },
      { "name": "Work_Sessions", "columns": ["session_id", "ticket_id", "assignment_id", "session_no", "started_at", "ended_at", "work_status", "technician_note", "submitted_at"] },
      { "name": "GPS_Checkins", "columns": ["gps_id", "ticket_id", "assignment_id", "technician_id", "checkin_type", "latitude", "longitude", "accuracy", "device_time", "server_time", "source", "created_at"] },
      { "name": "Distance_Calculations", "columns": ["distance_id", "ticket_id", "from_gps_id", "to_gps_id", "straight_distance_km", "road_distance_km", "calculation_method", "calculated_at", "calculated_version"] },
      { "name": "Reviews", "columns": ["review_id", "ticket_id", "assignment_id", "reviewer_id", "review_round", "result", "reason", "reviewed_at"] },
      { "name": "Satisfaction_Scores", "columns": ["satisfaction_id", "ticket_id", "reviewer_id", "score", "comment", "created_at"] },
      { "name": "Activity_Log", "columns": ["log_id", "timestamp", "user_id", "role", "action", "entity_type", "entity_id", "old_value", "new_value", "reason", "metadata_json"] },
      { "name": "Sessions", "columns": ["session_id", "user_id", "token", "expires_at", "created_at", "active"] },
      { "name": "Archived_Tickets", "columns": ["archive_id", "ticket_id", "archived_at", "data_json"] },
      { "name": "Work_Types", "columns": ["work_type_id", "work_type_name", "status"] },
      { "name": "Work_Type_Items", "columns": ["work_type_item_id", "work_type_id", "item_name", "status"] },
      { "name": "Backup_Log", "columns": ["backup_id", "backup_date", "status", "drive_file_id", "notes"] },
      { "name": "Fuel_Adjustments", "columns": ["adjustment_id", "ticket_id", "system_distance", "adjusted_distance", "system_amount", "adjusted_amount", "reason", "adjusted_by", "adjusted_at"] },
      { "name": "Notifications", "columns": ["notification_id", "user_id", "message", "read", "created_at"] },
      { "name": "Attachments", "columns": ["attachment_id", "entity_type", "entity_id", "drive_file_id", "uploaded_by", "uploaded_at"] },
      { "name": "System_Config", "columns": ["key", "value", "updated_at", "updated_by"] },
      { "name": "Error_Log", "columns": ["error_id", "timestamp", "user_id", "error_message", "stack_trace", "context_json"] }
    ]
  };

  let ss = null;

  // 1. ลองเปิดจาก TARGET_SPREADSHEET_ID
  if (typeof TARGET_SPREADSHEET_ID === "string" && TARGET_SPREADSHEET_ID !== "" && !TARGET_SPREADSHEET_ID.includes("ใส่_SPREADSHEET_ID")) {
    try {
      ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID.trim());
    } catch (e) {
      Logger.log("Could not open spreadsheet from TARGET_SPREADSHEET_ID: " + e.message);
    }
  }

  // 2. ถ้าไม่มี ให้ลองดึงจาก Script Properties (DB_SPREADSHEET_ID)
  if (!ss) {
    const propId = PropertiesService.getScriptProperties().getProperty("DB_SPREADSHEET_ID");
    if (propId && propId.trim() !== "") {
      try {
        ss = SpreadsheetApp.openById(propId.trim());
      } catch (e) {
        Logger.log("Could not open spreadsheet from Script Properties: " + e.message);
      }
    }
  }

  // 3. ถ้าไม่มี ให้ลองเปิดจาก Active Spreadsheet (กรณีเปิด Apps Script จากในชีต)
  if (!ss) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      ss = null;
    }
  }

  // ถ้ายังหาไม่เจอ ให้แจ้ง Error ชัดเจน
  if (!ss) {
    throw new Error(
      "ไม่พบ Google Spreadsheet! กรุณาใส่ Spreadsheet ID ของคุณที่บรรทัดที่ 7: " +
      "const TARGET_SPREADSHEET_ID = '1abc...'; หรือตั้งค่าใน Script Properties ชื่อ DB_SPREADSHEET_ID"
    );
  }

  Logger.log("Initializing database in Spreadsheet: " + ss.getName() + " (" + ss.getId() + ")");
  
  schema.sheets.forEach(function(sheetDef) {
    let sheet = ss.getSheetByName(sheetDef.name);
    if (!sheet) {
      sheet = ss.insertSheet(sheetDef.name);
    }
    sheet.clear();
    sheet.appendRow(sheetDef.columns);
    sheet.getRange(1, 1, 1, sheetDef.columns.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    Logger.log("Created/Updated Sheet: " + sheetDef.name);
  });

  // ลบ Sheet1 หรือ แผ่นงาน1 เริ่มต้นถ้าไม่ได้ใช้งาน
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("แผ่นงาน1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      // ignore
    }
  }

  // เพิ่มผู้ใช้งานเริ่มต้น (ถ้าชีต Users ยังไม่มีข้อมูล)
  const usersSheet = ss.getSheetByName("Users");
  if (usersSheet && usersSheet.getLastRow() <= 1) {
    const salt = Utilities.getUuid();
    // Default initial accounts with user_id as initial password
    const defaultUsers = [
      ["EMP-0001", "EMP-0001", "", Security ? Security.hashPassword("EMP-0001", salt) : "", salt, "CENTRAL_ADMIN", "TRUE"],
      ["EMP-0002", "EMP-0002", "", Security ? Security.hashPassword("EMP-0002", salt) : "", salt, "BRANCH_MANAGER", "TRUE"],
      ["EMP-0003", "EMP-0003", "", Security ? Security.hashPassword("EMP-0003", salt) : "", salt, "TECHNICIAN", "TRUE"]
    ];
    defaultUsers.forEach(function(row) {
      usersSheet.appendRow(row);
    });
    Logger.log("Seeded default users (EMP-0001, EMP-0002, EMP-0003) with user_id as initial password.");
  }

  Logger.log("Database initialized successfully with 25 sheets!");
}
