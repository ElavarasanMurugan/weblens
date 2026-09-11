/**
 * WebLens - Shared Message Types
 * Standardized communication actions between Popup, Background, and Content Scripts.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  WebLens.MESSAGE_TYPES = {
    // Popup -> Content Script / Task Controller
    ANALYZE_PAGE: 'ANALYZE_PAGE',
    HIGHLIGHT_ELEMENT: 'HIGHLIGHT_ELEMENT',
    CLEAR_HIGHLIGHTS: 'CLEAR_HIGHLIGHTS',
    SCROLL_TO_SOURCE: 'SCROLL_TO_SOURCE',
    RESTORE_PAGE: 'RESTORE_PAGE',
    GET_STATUS: 'GET_STATUS',

    // Content Script -> Popup / Controller Responses
    PAGE_CONTENT: 'PAGE_CONTENT',
    ANALYSIS_RESULT: 'ANALYSIS_RESULT',
    STATUS_RESPONSE: 'STATUS_RESPONSE',
    ERROR_RESPONSE: 'ERROR_RESPONSE'
  };
})();
