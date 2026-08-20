/**
 * Utility Functions
 */
const Utils = {
  generateId: function(prefix) {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return prefix + '-' + timestamp + '-' + random;
  },
  
  generateTicketId: function() {
    const d = new Date();
    const year = d.getFullYear();
    const random = Math.floor(Math.random() * 90000) + 10000;
    return 'MT-' + year + '-' + random;
  },

  successResponse: function(data) {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  },
  
  errorResponse: function(message, code) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: message,
      code: code
    })).setMimeType(ContentService.MimeType.JSON);
  }
};
