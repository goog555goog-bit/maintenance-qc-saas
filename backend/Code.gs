/**
 * Main entry point for POST requests.
 * Expects JSON payload: { action: string, payload: object, token: string }
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * Main entry point for GET requests (can be used for health check or simple reads).
 */
function doGet(e) {
  return Utils.successResponse({ status: "OK", message: "System is online" });
}

/**
 * Handle incoming requests with centralized error handling.
 */
function handleRequest(e) {
  try {
    const postData = e.postData && e.postData.contents;
    if (!postData) {
      return Utils.errorResponse("No data provided", 400);
    }

    let request;
    try {
      request = JSON.parse(postData);
    } catch (parseErr) {
      return Utils.errorResponse("Invalid JSON format: " + parseErr.message, 400);
    }
    
    // Security: Check for malicious payloads and sanitize
    const sanitizedRequest = Security.sanitizePayload(request);
    
    // Telegram Webhook Detection: updates from Telegram contain update_id or message
    if (sanitizedRequest.update_id || sanitizedRequest.message || sanitizedRequest.callback_query) {
      const webhookResult = TelegramService.handleWebhook(sanitizedRequest);
      return ContentService.createTextOutput(JSON.stringify(webhookResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const action = sanitizedRequest.action;
    const payload = sanitizedRequest.payload || {};
    const token = sanitizedRequest.token;

    if (!action) {
      return Utils.errorResponse("Action is required", 400);
    }

    // Process through router
    const result = Router.route(action, payload, token);
    return Utils.successResponse(result);

  } catch (error) {
    try {
      AuditService.logError(error);
    } catch (ignore) {}
    return Utils.errorResponse(error ? (error.message || String(error)) : "Internal Server Error", 500);
  }
}
