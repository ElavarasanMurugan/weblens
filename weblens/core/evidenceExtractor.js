/**
 * WebLens - Evidence Extractor
 * Formats extracted elements into traceable evidence items connected to their source element IDs.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  const EvidenceExtractor = {
    /**
     * Creates a structured evidence item linked to the source element.
     * @param {Object} extractedElement - The element from domExtractor ({ id, tag, text, index })
     * @param {string} category - Category the item belongs to
     * @param {number} relevanceScore - Calculated score
     * @param {string[]} matchedKeywords - List of matched keywords
     * @param {string} [title] - Optional heading or summary title
     * @returns {Object} Evidence object
     */
    createEvidenceItem(extractedElement, category, relevanceScore, matchedKeywords = [], title = '') {
      const cleanSnippet = WebLens.Utils
        ? WebLens.Utils.truncate(extractedElement.text, 220)
        : extractedElement.text.slice(0, 220);

      // Determine a short title or use the first few words/matched keyword
      let itemTitle = title;
      if (!itemTitle) {
        if (matchedKeywords.length > 0) {
          itemTitle = matchedKeywords[0].charAt(0).toUpperCase() + matchedKeywords[0].slice(1);
        } else {
          itemTitle = extractedElement.tag.toUpperCase() + ' Snippet';
        }
      }

      return {
        id: `ev-${extractedElement.id}`,
        title: itemTitle,
        category: category,
        text: cleanSnippet,
        fullText: extractedElement.text,
        sourceId: extractedElement.id,
        tag: extractedElement.tag,
        relevanceScore: relevanceScore,
        matchedKeywords: matchedKeywords
      };
    },

    /**
     * Deduplicates and orders evidence items by score.
     * @param {Array} items
     * @returns {Array} Sorted, unique evidence items
     */
    rankAndDeduplicate(items) {
      const seenSources = new Set();
      const unique = [];

      for (const item of items) {
        if (!seenSources.has(item.sourceId)) {
          seenSources.add(item.sourceId);
          unique.push(item);
        }
      }

      return unique.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  };

  WebLens.EvidenceExtractor = EvidenceExtractor;
})();
