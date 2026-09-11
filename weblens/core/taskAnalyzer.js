/**
 * WebLens - Task Analyzer
 * Analyzes extracted DOM content according to the active Task Lens.
 * Designed as a modular engine easily swappable with Semantic Embeddings / LLM APIs in future versions.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  const TaskAnalyzer = {
    /**
     * Main analysis method.
     * @param {Array<Object>} extractedElements - List of elements from domExtractor
     * @param {string} taskType - Task lens type ('learn', 'compare', 'decide', 'technical', 'custom')
     * @param {string} [customQuery=''] - User query if custom lens
     * @returns {Object} Structured Information Map
     */
    analyzeContent(extractedElements = [], taskType = 'learn', customQuery = '') {
      const startTime = performance.now();
      const taskConfig = WebLens.TASK_CONFIGS?.[taskType] || WebLens.TASK_CONFIGS?.learn;
      const categorizedEvidence = {};
      const allEvidenceItems = [];

      // Determine category definitions based on task type
      let categoryMap = {};
      if (taskType === 'custom') {
        const tokens = WebLens.Utils ? WebLens.Utils.tokenize(customQuery) : [];
        categoryMap = {
          'Direct Matches': tokens.length > 0 ? tokens : [customQuery.trim().toLowerCase()],
          'Related Information': []
        };
      } else {
        categoryMap = taskConfig.categories || {};
      }

      // Initialize empty arrays for each category
      Object.keys(categoryMap).forEach(cat => {
        categorizedEvidence[cat] = [];
      });

      // Analyze each extracted element
      extractedElements.forEach(element => {
        if (!element || !element.text || element.text.length < 10) return;

        let bestCategory = null;
        let highestScore = 0;
        let bestKeywords = [];

        // Check against each category in the task
        for (const [categoryName, keywords] of Object.entries(categoryMap)) {
          if (keywords.length === 0) continue;

          const relevance = WebLens.RelevanceEngine.calculateRelevance(
            element.text,
            keywords,
            element.tag
          );

          if (relevance.score >= (WebLens.SCORING?.MIN_RELEVANCE_SCORE || 1.0)) {
            if (relevance.score > highestScore) {
              highestScore = relevance.score;
              bestCategory = categoryName;
              bestKeywords = relevance.matchedKeywords;
            }
          }
        }

        // If matched a category with sufficient relevance, create evidence item
        if (bestCategory && highestScore > 0) {
          const evidenceItem = WebLens.EvidenceExtractor.createEvidenceItem(
            element,
            bestCategory,
            highestScore,
            bestKeywords
          );

          categorizedEvidence[bestCategory].push(evidenceItem);
          allEvidenceItems.push(evidenceItem);
        }
      });

      // Detect Information Gaps for the chosen task
      const gaps = WebLens.GapDetector.detectInformationGaps(
        allEvidenceItems,
        taskType,
        extractedElements
      );

      const elapsedMs = Math.round(performance.now() - startTime);

      // Build structured Information Map
      return WebLens.InformationMap.build(
        taskType,
        categorizedEvidence,
        gaps,
        {
          totalExtractedElements: extractedElements.length,
          elapsedMs: elapsedMs,
          customQuery: customQuery || null
        }
      );
    }
  };

  WebLens.TaskAnalyzer = TaskAnalyzer;
})();
