/**
 * WebLens - Relevance Engine
 * Calculates relevance score for extracted webpage text based on task keywords and tag context.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  const RelevanceEngine = {
    /**
     * Calculates relevance score for a given text snippet against a keyword list.
     * @param {string} text - The raw text content of the element.
     * @param {string[]} keywords - List of target keywords or key phrases.
     * @param {string} [tag='P'] - The HTML tag name of the element (e.g. 'H1', 'P').
     * @returns {{ score: number, matchedKeywords: string[], label: string }}
     */
    calculateRelevance(text, keywords = [], tag = 'P') {
      if (!text || !keywords || keywords.length === 0) {
        return { score: 0, matchedKeywords: [], label: 'irrelevant' };
      }

      const normalizedText = WebLens.Utils ? WebLens.Utils.normalizeText(text) : text.toLowerCase();
      const upperTag = (tag || 'P').toUpperCase();
      const tagWeight = (WebLens.SCORING?.TAG_WEIGHTS?.[upperTag]) || 1.0;

      const matchedKeywords = [];
      let occurrencesCount = 0;

      keywords.forEach(kw => {
        const normalizedKw = kw.toLowerCase().trim();
        if (!normalizedKw) return;

        // Word boundary or phrase check
        const escaped = WebLens.Utils ? WebLens.Utils.escapeRegExp(normalizedKw) : normalizedKw;
        const regex = new RegExp(`(^|\\W)${escaped}(\\W|$)`, 'gi');
        const matches = normalizedText.match(regex);

        if (matches && matches.length > 0) {
          matchedKeywords.push(normalizedKw);
          occurrencesCount += matches.length;
        }
      });

      if (matchedKeywords.length === 0) {
        return { score: 0, matchedKeywords: [], label: 'irrelevant' };
      }

      // Base score: 1 point for having matches
      let rawScore = 1.0;

      // Add points for frequency of keyword hits
      rawScore += (occurrencesCount - 1) * 0.5;

      // Add bonus for matching multiple distinct keywords from the target set
      if (matchedKeywords.length > 1) {
        rawScore += (matchedKeywords.length - 1) * (WebLens.SCORING?.MULTI_KEYWORD_BONUS || 1.0);
      }

      // Tag multiplier (e.g. H1/H2 get higher weight)
      let finalScore = rawScore * (tagWeight >= 2.0 ? 1.5 : 1.0);
      finalScore = Math.round(finalScore * 10) / 10;

      let label = 'weakly relevant';
      if (finalScore >= (WebLens.SCORING?.THRESHOLDS?.HIGH || 3.0)) {
        label = 'highly relevant';
      } else if (finalScore >= (WebLens.SCORING?.THRESHOLDS?.MEDIUM || 2.0)) {
        label = 'relevant';
      }

      return {
        score: finalScore,
        matchedKeywords,
        label
      };
    }
  };

  WebLens.RelevanceEngine = RelevanceEngine;
})();
