/**
 * WebLens - Task Controller
 * Coordinates the end-to-end analysis workflow:
 * DOM Extraction -> Task Analysis -> Information Map -> Webpage Highlighting & Dimming.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  const TaskController = {
    /**
     * Executes the task-aware analysis pipeline on the current webpage.
     * @param {string} taskType - 'learn' | 'compare' | 'decide' | 'technical' | 'custom'
     * @param {string} [customQuery=''] - Custom search query if taskType is 'custom'
     * @returns {Object} Final Information Map result
     */
    analyzePage(taskType = 'learn', customQuery = '') {
      try {
        console.log(`[WebLens TaskController] Starting analysis for task: ${taskType}`);

        // 1. Extract meaningful page content
        const extractedElements = WebLens.DOMExtractor.extractPageContent();
        console.log(`[WebLens TaskController] Extracted ${extractedElements.length} meaningful elements.`);

        // 2. Pass extracted content to Task Analyzer
        const informationMap = WebLens.TaskAnalyzer.analyzeContent(
          extractedElements,
          taskType,
          customQuery
        );
        console.log(`[WebLens TaskController] Analysis complete. Found ${informationMap.totalRelevantElements} relevant elements.`);

        // 3. Highlight relevant elements and dim irrelevant elements on the page
        WebLens.Highlighter.applyVisualFocus(
          informationMap.relevantElements,
          extractedElements
        );

        // 4. Update page state
        if (WebLens.PageState) {
          WebLens.PageState.setActiveTask(taskType, customQuery);
          WebLens.PageState.setLastAnalysis(informationMap);
          WebLens.PageState.setExtractedElements(extractedElements);
        }

        return {
          success: true,
          data: informationMap
        };
      } catch (error) {
        console.error('[WebLens TaskController Error]', error);
        return {
          success: false,
          error: error.message || 'An unexpected error occurred during page analysis.'
        };
      }
    },

    /**
     * Restores the page appearance to its original un-highlighted state.
     */
    restorePage() {
      try {
        WebLens.Highlighter.restorePage();
        if (WebLens.PageState) {
          WebLens.PageState.clearActiveTask();
        }
        return { success: true };
      } catch (error) {
        console.error('[WebLens TaskController Restore Error]', error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Focuses and scrolls to a specific source element by ID.
     */
    scrollToSource(sourceId) {
      try {
        const found = WebLens.Highlighter.scrollToElement(sourceId);
        return { success: found };
      } catch (error) {
        console.error('[WebLens TaskController Scroll Error]', error);
        return { success: false, error: error.message };
      }
    }
  };

  WebLens.TaskController = TaskController;
})();
