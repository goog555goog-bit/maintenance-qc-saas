/**
 * Security and sanitization utilities.
 */
const Security = {
  
  sanitizePayload: function(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizePayload(item));
    }
    if (typeof obj === 'object') {
      const sanitizedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitizedObj[key] = this.sanitizePayload(obj[key]);
        }
      }
      return sanitizedObj;
    }
    return obj;
  },

  sanitizeString: function(str) {
    // Prevent spreadsheet injection
    if (/^[\=\+\-\@]/.test(str)) {
      str = "'" + str; // Prefix with apostrophe to force text evaluation
    }
    // Basic XSS mitigation - strip script tags
    str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    return str;
  },

  hashToken: function(token) {
    const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token);
    return Utilities.base64EncodeWebSafe(signature);
  },

  hashPassword: function(password, salt) {
    const combined = password + salt;
    const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined);
    let hexString = '';
    for (let i = 0; i < signature.length; i++) {
      let byte = signature[i];
      if (byte < 0) byte += 256;
      let hex = byte.toString(16);
      if (hex.length == 1) hex = '0' + hex;
      hexString += hex;
    }
    return hexString;
  },
  
  generateSalt: function() {
    return Utilities.getUuid();
  }
};
