/**
 * WebLens - Information Map Builder
 * Aggregates categorized evidence, relevance metadata, element IDs, and gaps into the unified Information Map schema.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  const InformationMap = {
    /**
     * Builds the structured Information Map object for presentation and popup rendering.
     * @param {string} taskType - Current task type ('learn', 'compare', 'decide', 'technical', 'custom')
     * @param {Object} categorizedEvidence - Map of category name to evidence item arrays
     * @param {Array} gaps - List of detected information gaps
     * @param {Object} [meta={}] - Optional additional metadata (e.g. execution time, element count)
     * @returns {Object} Structured Information Map
     */
    build(taskType, categorizedEvidence = {}, gaps = [], meta = {}) {
      const categories = [];
      const relevantElementIds = new Set();
      let totalItems = 0;

      for (const [categoryName, items] of Object.entries(categorizedEvidence)) {
        if (items && items.length > 0) {
          // Sort items within category by relevance score
          const sortedItems = [...items].sort((a, b) => b.relevanceScore - a.relevanceScore);

          sortedItems.forEach(item => {
            if (item.sourceId) relevantElementIds.add(item.sourceId);
            totalItems++;
          });

          categories.push({
            name: categoryName,
            count: sortedItems.length,
            items: sortedItems
          });
        }
      }

      return {
        task: taskType,
        timestamp: Date.now(),
        totalRelevantItems: totalItems,
        totalRelevantElements: relevantElementIds.size,
        categories: categories,
        relevantElements: Array.from(relevantElementIds),
        gaps: gaps || [],
        meta: {
          totalExtractedElements: meta.totalExtractedElements || 0,
          elapsedMs: meta.elapsedMs || 0,
          customQuery: meta.customQuery || null
        }
      };
    },

    /**
     * Generates an empty or fallback Information Map when no relevant elements are found.
     */
    createEmpty(taskType, gaps = [], meta = {}) {
      return {
        task: taskType,
        timestamp: Date.now(),
        totalRelevantItems: 0,
        totalRelevantElements: 0,
        categories: [],
        relevantElements: [],
        gaps: gaps || [],
        meta: meta
      };
    }
  };

  WebLens.InformationMap = InformationMap;
})();
