/**
 * WebLens - Content Script Bridge
 * Acts as the primary message listener on the host webpage.
 * Routes incoming popup commands to TaskController and returns structured results.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};
  const MESSAGE_TYPES = WebLens.MESSAGE_TYPES;

  console.log('[WebLens Content Script] Injected and active.');

  // Guard against duplicate listener registrations
  if (window.__WEBLENS_CONTENT_INITIALIZED__) {
    return;
  }
  window.__WEBLENS_CONTENT_INITIALIZED__ = true;

  /**
   * Main runtime message listener.
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.type) return;

    const { type, payload = {} } = message;

    switch (type) {
      case MESSAGE_TYPES.ANALYZE_PAGE: {
        const { taskType, customQuery } = payload;
        // Run analysis pipeline through TaskController
        const result = WebLens.TaskController.analyzePage(taskType, customQuery);
        sendResponse(result);
        break;
      }

      case MESSAGE_TYPES.SCROLL_TO_SOURCE: {
        const { sourceId } = payload;
        const result = WebLens.TaskController.scrollToSource(sourceId);
        sendResponse(result);
        break;
      }

      case MESSAGE_TYPES.RESTORE_PAGE:
      case MESSAGE_TYPES.CLEAR_HIGHLIGHTS: {
        const result = WebLens.TaskController.restorePage();
        sendResponse(result);
        break;
      }

      case MESSAGE_TYPES.GET_STATUS: {
        const status = WebLens.PageState ? WebLens.PageState.getStatus() : { isActive: false };
        const lastAnalysis = WebLens.PageState ? WebLens.PageState.getLastAnalysis() : null;
        sendResponse({ success: true, status, lastAnalysis });
        break;
      }

      default:
        console.warn(`[WebLens Content Script] Unhandled message type: ${type}`);
        sendResponse({ success: false, error: `Unknown message type: ${type}` });
        break;
    }

    // Return true to indicate asynchronous response channel if needed
    return true;
  });
})();
