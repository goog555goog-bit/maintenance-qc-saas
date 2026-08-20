/**
 * Database Access Layer
 */
const Database = (function() {
  let instance;

  function createInstance() {
    return {
      ssId: PropertiesService.getScriptProperties().getProperty('DB_SPREADSHEET_ID'),

      getSpreadsheet: function() {
        if (this.ssId) {
          return SpreadsheetApp.openById(this.ssId);
        }
        return SpreadsheetApp.getActiveSpreadsheet();
      },

      getSheet: function(sheetName) {
        return this.getSpreadsheet().getSheetByName(sheetName);
      },

      getHeaders: function(sheet) {
        const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        return headerRow;
      },

      query: function(sheetName, filters = {}) {
        const sheet = this.getSheet(sheetName);
        if (!sheet) return [];
        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) return [];

        const headers = data[0];
        const rows = data.slice(1);
        const results = [];

        rows.forEach(row => {
          let match = true;
          const obj = {};
          for (let i = 0; i < headers.length; i++) {
            obj[headers[i]] = row[i];
          }

          for (const key in filters) {
            if (obj[key] != filters[key]) {
              match = false;
              break;
            }
          }
          if (match) results.push(obj);
        });

        return results;
      },

      insert: function(sheetName, obj) {
        const lock = LockService.getScriptLock();
        lock.waitLock(10000);
        try {
          const sheet = this.getSheet(sheetName);
          const headers = this.getHeaders(sheet);
          const row = headers.map(h => (obj[h] !== undefined ? obj[h] : ""));
          sheet.appendRow(row);
        } finally {
          lock.releaseLock();
        }
      },

      update: function(sheetName, keyField, keyValue, updateObj) {
        const lock = LockService.getScriptLock();
        lock.waitLock(10000);
        try {
          const sheet = this.getSheet(sheetName);
          const data = sheet.getDataRange().getValues();
          if (data.length <= 1) return false;

          const headers = data[0];
          const keyIndex = headers.indexOf(keyField);
          if (keyIndex === -1) throw new Error("Key field not found");

          let updated = false;
          for (let i = 1; i < data.length; i++) {
            if (data[i][keyIndex] == keyValue) {
              const rowNum = i + 1;
              for (const key in updateObj) {
                const colIndex = headers.indexOf(key);
                if (colIndex !== -1) {
                  sheet.getRange(rowNum, colIndex + 1).setValue(updateObj[key]);
                }
              }
              updated = true;
              break; // Assuming unique key
            }
          }
          return updated;
        } finally {
          lock.releaseLock();
        }
      }
    };
  }

  return {
    getInstance: function() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();
