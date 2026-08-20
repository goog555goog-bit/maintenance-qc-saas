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

    const request = JSON.parse(postData);
    
    // Security: Check for malicious payloads and sanitize
    const sanitizedRequest = Security.sanitizePayload(request);
    
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
    // Log error
    AuditService.logError(error);
    return Utils.errorResponse(error.message || "Internal Server Error", 500);
  }
}
