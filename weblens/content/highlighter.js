/**
 * WebLens - Webpage Highlighter & Focus System
 * Manages non-destructive visual highlighting, dimming of irrelevant elements,
 * smooth scrolling to evidence sources, and restoring page state.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  const STYLE_TAG_ID = 'weblens-injected-styles';

  const Highlighter = {
    /**
     * Injects the required CSS rules into the host page head if not already present.
     */
    injectStyles() {
      if (document.getElementById(STYLE_TAG_ID)) return;

      const style = document.createElement('style');
      style.id = STYLE_TAG_ID;
      style.textContent = `
        /* WebLens Non-Destructive Highlighting Styles */
        .weblens-highlight {
          background-color: rgba(254, 240, 138, 0.55) !important;
          border-left: 4px solid #eab308 !important;
          padding-left: 8px !important;
          border-radius: 4px !important;
          transition: background-color 0.25s ease, opacity 0.25s ease !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
        }

        .weblens-highlight-active {
          background-color: rgba(253, 224, 71, 0.85) !important;
          border-left: 5px solid #ca8a04 !important;
          outline: 2px solid #eab308 !important;
          outline-offset: 2px !important;
          animation: weblensPulse 1.8s ease-in-out !important;
        }

        .weblens-dimmed {
          opacity: 0.38 !important;
          filter: grayscale(40%) !important;
          transition: opacity 0.25s ease !important;
        }

        @keyframes weblensPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.015); box-shadow: 0 0 12px rgba(234, 179, 8, 0.6); }
          100% { transform: scale(1); }
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    },

    /**
     * Removes injected CSS rules.
     */
    removeStyles() {
      const style = document.getElementById(STYLE_TAG_ID);
      if (style) {
        style.remove();
      }
    },

    /**
     * Applies visual focus to the webpage:
     * - Highlights relevant elements
     * - Dims extracted irrelevant elements
     * Uses requestAnimationFrame batching for high performance.
     */
    async applyVisualFocus(relevantIds = [], allExtracted = []) {
      this.injectStyles();
      const relevantSet = new Set(relevantIds);

      const BATCH_SIZE = 30;
      for (let i = 0; i < allExtracted.length; i += BATCH_SIZE) {
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            const batch = allExtracted.slice(i, i + BATCH_SIZE);
            batch.forEach((item) => {
              const el = WebLens.DOMExtractor.getElement(item.id);
              if (!el) return;

              if (relevantSet.has(item.id)) {
                el.classList.add(WebLens.CSS_CLASSES.HIGHLIGHT);
                el.classList.remove(WebLens.CSS_CLASSES.DIMMED);
              } else {
                el.classList.remove(WebLens.CSS_CLASSES.HIGHLIGHT);
                el.classList.add(WebLens.CSS_CLASSES.DIMMED);
              }
            });
            resolve();
          });
        });
      }
    },

    /**
     * Highlights a single element.
     */
    highlightElement(id) {
      const el = WebLens.DOMExtractor.getElement(id);
      if (el) {
        el.classList.add(WebLens.CSS_CLASSES.HIGHLIGHT);
        return true;
      }
      return false;
    },

    /**
     * Scrolls smoothly to the source element on the webpage and triggers an active pulse effect.
     */
    scrollToElement(id) {
      const el = WebLens.DOMExtractor.getElement(id);
      if (!el) return false;

      // Remove existing active highlight from other elements
      document.querySelectorAll(`.${WebLens.CSS_CLASSES.HIGHLIGHT_ACTIVE}`).forEach((node) => {
        node.classList.remove(WebLens.CSS_CLASSES.HIGHLIGHT_ACTIVE);
      });

      // Add temporary pulse highlight
      el.classList.add(WebLens.CSS_CLASSES.HIGHLIGHT_ACTIVE);
      el.classList.remove(WebLens.CSS_CLASSES.DIMMED);

      // Scroll into view
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Clear the active pulse class after 3 seconds
      setTimeout(() => {
        if (el) {
          el.classList.remove(WebLens.CSS_CLASSES.HIGHLIGHT_ACTIVE);
        }
      }, 3000);

      return true;
    },

    /**
     * Clears all highlights from elements.
     */
    clearHighlights() {
      const highlighted = document.querySelectorAll(`.${WebLens.CSS_CLASSES.HIGHLIGHT}, .${WebLens.CSS_CLASSES.HIGHLIGHT_ACTIVE}`);
      highlighted.forEach((node) => {
        node.classList.remove(WebLens.CSS_CLASSES.HIGHLIGHT, WebLens.CSS_CLASSES.HIGHLIGHT_ACTIVE);
      });
    },

    /**
     * Restores the page to its original state by removing all highlights, dimming, and injected CSS.
     */
    restorePage() {
      const affected = document.querySelectorAll(
        `.${WebLens.CSS_CLASSES.HIGHLIGHT}, .${WebLens.CSS_CLASSES.HIGHLIGHT_ACTIVE}, .${WebLens.CSS_CLASSES.DIMMED}`
      );
      affected.forEach((node) => {
        node.classList.remove(
          WebLens.CSS_CLASSES.HIGHLIGHT,
          WebLens.CSS_CLASSES.HIGHLIGHT_ACTIVE,
          WebLens.CSS_CLASSES.DIMMED
        );
      });

      this.removeStyles();
      WebLens.DOMExtractor.clear();
      console.log('[WebLens Highlighter] Page restored to original appearance.');
    }
  };

  WebLens.Highlighter = Highlighter;
})();
