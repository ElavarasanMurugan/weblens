/**
 * WebLens - Shared Utility Functions
 * Helper methods for text processing, DOM traversal, and safe data extraction.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  const Utils = {
    /**
     * Normalizes text for comparison (lowercase, trimmed, collapse whitespace).
     */
    normalizeText(text) {
      if (!text || typeof text !== 'string') return '';
      return text.toLowerCase().replace(/\s+/g, ' ').trim();
    },

    /**
     * Truncates text to a maximum length with ellipsis.
     */
    truncate(text, maxLength = 160) {
      if (!text || typeof text !== 'string') return '';
      const trimmed = text.trim().replace(/\s+/g, ' ');
      if (trimmed.length <= maxLength) return trimmed;
      return trimmed.slice(0, maxLength - 3) + '...';
    },

    /**
     * Escapes characters for safe regular expression matching.
     */
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Splits query or string into distinct keyword tokens.
     */
    tokenize(text) {
      if (!text) return [];
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2);
    },

    /**
     * Checks if a DOM element is currently visible in the document.
     */
    isElementVisible(element) {
      if (!element || !(element instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    },

    /**
     * Sanitizes plain text for safe insertion into HTML strings.
     */
    escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    /**
     * Safely executes an async or sync function with standard error wrapper.
     */
    async safeExecute(fn, fallbackValue = null) {
      try {
        return await fn();
      } catch (err) {
        console.error('[WebLens Utils Error]', err);
        return fallbackValue;
      }
    }
  };

  WebLens.Utils = Utils;
})();
