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
        const ss = this.getSpreadsheet();
        if (!ss) return null;
        return ss.getSheetByName(sheetName);
      },

      ensureSheet: function(sheetName, defaultHeaders) {
        const ss = this.getSpreadsheet();
        if (!ss) return null;
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          sheet = ss.insertSheet(sheetName);
          if (Array.isArray(defaultHeaders) && defaultHeaders.length > 0) {
            sheet.appendRow(defaultHeaders);
          }
        }
        return sheet;
      },

      getHeaders: function(sheet) {
        if (!sheet || sheet.getLastColumn() === 0) return [];
        try {
          const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          return headerRow;
        } catch (e) {
          return [];
        }
      },

      query: function(sheetName, filters = {}) {
        const sheet = this.getSheet(sheetName);
        if (!sheet) return [];
        const lastRow = sheet.getLastRow();
        if (lastRow <= 1) return [];

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
            const val1 = String(obj[key] !== undefined && obj[key] !== null ? obj[key] : '').trim().toUpperCase();
            const val2 = String(filters[key] !== undefined && filters[key] !== null ? filters[key] : '').trim().toUpperCase();
            if (val1 !== val2) {
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
          let sheet = this.getSheet(sheetName);
          if (!sheet) {
            const headers = Object.keys(obj);
            sheet = this.ensureSheet(sheetName, headers);
            const row = headers.map(h => (obj[h] !== undefined ? obj[h] : ""));
            sheet.appendRow(row);
            return;
          }

          let headers = this.getHeaders(sheet);
          if (headers.length === 0) {
            headers = Object.keys(obj);
            sheet.appendRow(headers);
          } else {
            // Auto-append any new columns if not present in headers
            for (const key in obj) {
              if (headers.indexOf(key) === -1) {
                const newColIndex = headers.length + 1;
                sheet.getRange(1, newColIndex).setValue(key);
                headers.push(key);
              }
            }
          }

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
          if (!sheet) return false;

          const data = sheet.getDataRange().getValues();
          if (data.length <= 1) return false;

          const headers = data[0];
          const keyIndex = headers.indexOf(keyField);
          if (keyIndex === -1) return false;

          let updated = false;
          for (let i = 1; i < data.length; i++) {
            if (String(data[i][keyIndex]).trim().toUpperCase() === String(keyValue).trim().toUpperCase()) {
              const rowNum = i + 1;
              for (const key in updateObj) {
                let colIndex = headers.indexOf(key);
                if (colIndex === -1) {
                  // Auto-append missing column header
                  const newCol = headers.length + 1;
                  sheet.getRange(1, newCol).setValue(key);
                  headers.push(key);
                  colIndex = headers.length - 1;
                }
                sheet.getRange(rowNum, colIndex + 1).setValue(updateObj[key]);
              }
              updated = true;
              break;
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
