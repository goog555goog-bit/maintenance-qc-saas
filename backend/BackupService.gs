/**
 * System Backup Service
 */
const BackupService = {
  runDailyBackup: function() {
    try {
      const ssId = PropertiesService.getScriptProperties().getProperty('DB_SPREADSHEET_ID');
      const backupFolderId = PropertiesService.getScriptProperties().getProperty('DRIVE_BACKUP_FOLDER_ID');
      
      if (!ssId || !backupFolderId) {
        throw new Error("Backup config missing");
      }
      
      const file = DriveApp.getFileById(ssId);
      const folder = DriveApp.getFolderById(backupFolderId);
      
      const backupName = "Backup_" + new Date().toISOString().split('T')[0] + "_" + file.getName();
      const backupFile = file.makeCopy(backupName, folder);
      
      const db = Database.getInstance();
      db.insert('Backup_Log', {
        backup_id: Utils.generateId('BKP'),
        backup_date: new Date().toISOString(),
        status: 'SUCCESS',
        drive_file_id: backupFile.getId(),
        notes: 'Automated daily backup'
      });
      
    } catch (e) {
      AuditService.logError(e);
      const db = Database.getInstance();
      db.insert('Backup_Log', {
        backup_id: Utils.generateId('BKP'),
        backup_date: new Date().toISOString(),
        status: 'FAILED',
        drive_file_id: '',
        notes: e.message
      });
    }
  }
};
