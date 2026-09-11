/**
 * WebLens - DOM Extractor
 * Extracts meaningful content (headings, paragraphs, list items, table cells)
 * while filtering out script, style, nav, footer, and ads.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  // Internal cache of extracted DOM nodes by ID
  const elementCache = new Map();

  const DOMExtractor = {
    // Selectors to target
    TARGET_SELECTORS: 'h1, h2, h3, p, li, td',

    // Containers and tags to completely ignore
    IGNORED_TAGS: new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'NAV', 'FOOTER', 'IFRAME', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'ASIDE']),

    // Class/ID substrings representing navigation, ads, or footers
    IRRELEVANT_PATTERNS: /ad-|advertisement|banner|cookie|consent|sidebar|footer|navbar|nav-|menu|breadcrumb|modal|popup|widget|social-share/i,

    /**
     * Extracts meaningful textual elements from the current webpage.
     * Stamped with unique IDs for highlighting and source traceability.
     * @returns {Array<{ id: string, tag: string, text: string, element: HTMLElement, index: number }>}
     */
    extractPageContent() {
      elementCache.clear();
      const extracted = [];
      const candidates = document.querySelectorAll(this.TARGET_SELECTORS);

      let counter = 0;

      candidates.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        // Skip if inside ignored tags
        if (this.isInsideIgnoredContainer(node)) return;

        // Skip if hidden
        if (WebLens.Utils && !WebLens.Utils.isElementVisible(node)) return;

        // Clean inner text
        const rawText = node.innerText || node.textContent || '';
        const cleanText = rawText.trim().replace(/\s+/g, ' ');

        // Skip trivial or empty elements
        if (cleanText.length < 8) return;

        // Skip repetitive short navigation or breadcrumb links
        if (node.tagName.toLowerCase() === 'li' && cleanText.length < 12 && node.querySelector('a')) {
          return;
        }

        const id = `${WebLens.ELEMENT_ID_PREFIX || 'weblens-el-'}${counter}`;
        counter++;

        // Stamp element with custom attribute for fast non-destructive lookup
        node.setAttribute('data-weblens-id', id);
        elementCache.set(id, node);

        extracted.push({
          id: id,
          tag: node.tagName.toLowerCase(),
          text: cleanText,
          element: node,
          index: counter - 1
        });
      });

      return extracted;
    },

    /**
     * Determines whether an element is inside an excluded container (nav, footer, ads, etc.)
     */
    isInsideIgnoredContainer(element) {
      let current = element;
      while (current && current !== document.body && current !== document.documentElement) {
        const tagName = current.tagName.toUpperCase();

        if (this.IGNORED_TAGS.has(tagName)) {
          return true;
        }

        // Check aria roles
        const role = current.getAttribute('role');
        if (role === 'navigation' || role === 'banner' || role === 'contentinfo' || role === 'complementary') {
          return true;
        }

        // Check class and ID against ad/nav/footer patterns
        const identifier = `${current.className || ''} ${current.id || ''}`;
        if (typeof identifier === 'string' && this.IRRELEVANT_PATTERNS.test(identifier)) {
          // If it's a main article container with a word like "footer" in some sub-class, be careful
          if (tagName === 'MAIN' || tagName === 'ARTICLE') {
            return false;
          }
          return true;
        }

        current = current.parentElement;
      }
      return false;
    },

    /**
     * Gets a live DOM element reference by its WebLens ID.
     */
    getElement(id) {
      if (elementCache.has(id)) {
        return elementCache.get(id);
      }
      return document.querySelector(`[data-weblens-id="${id}"]`);
    },

    /**
     * Clears cached elements and removes data attributes from the page.
     */
    clear() {
      elementCache.forEach((node) => {
        if (node && node.removeAttribute) {
          node.removeAttribute('data-weblens-id');
        }
      });
      elementCache.clear();
    }
  };

  WebLens.DOMExtractor = DOMExtractor;
})();
