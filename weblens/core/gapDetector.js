/**
 * WebLens - Information Gap Detector
 * Identifies key expected topics for the chosen task that were missing from the webpage content.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  const GapDetector = {
    /**
     * Map of task types to expected topics and associated keywords for gap detection.
     */
    EXPECTED_TOPICS: {
      compare: [
        { topic: 'Pricing & Cost', keywords: ['price', 'pricing', 'cost', 'fee', 'subscription', 'tier', '$', '€', 'free'] },
        { topic: 'Specifications & Features', keywords: ['specification', 'specifications', 'specs', 'dimensions', 'weight', 'size'] },
        { topic: 'Performance & Speed', keywords: ['performance', 'speed', 'benchmark', 'latency', 'throughput'] },
        { topic: 'Battery & Power', keywords: ['battery', 'battery life', 'battery runtime', 'charging', 'charger', 'mah', 'watt-hour'] },
        { topic: 'Warranty & Support', keywords: ['warranty', 'guarantee', 'customer support', 'customer service', 'refund policy'] }
      ],
      decide: [
        { topic: 'Benefits & Advantages', keywords: ['benefit', 'advantage', 'strength', 'upside', 'value'] },
        { topic: 'Risks & Disadvantages', keywords: ['risk', 'warning', 'danger', 'hazard', 'pitfall', 'threat'] },
        { topic: 'Limitations & Constraints', keywords: ['limitation', 'trade-off', 'constraint', 'downside', 'drawback'] },
        { topic: 'Evidence & Verification', keywords: ['evidence', 'proof', 'study', 'tested', 'certified', 'track record'] }
      ],
      learn: [
        { topic: 'Definitions & Concepts', keywords: ['definition', 'concept', 'meaning', 'overview', 'what is'] },
        { topic: 'Methodology & Process', keywords: ['method', 'process', 'how it works', 'approach', 'technique'] },
        { topic: 'Findings & Conclusions', keywords: ['finding', 'result', 'conclusion', 'outcome', 'discovery'] }
      ],
      technical: [
        { topic: 'API & Parameter Documentation', keywords: ['api', 'parameter', 'endpoint', 'signature', 'method'] },
        { topic: 'Installation & Dependencies', keywords: ['install', 'installation', 'setup', 'npm', 'dependencies'] },
        { topic: 'Configuration & Settings', keywords: ['configuration', 'config', 'options', 'environment', 'variable'] },
        { topic: 'Error Handling & Troubleshooting', keywords: ['error', 'exception', 'troubleshooting', 'debug', 'fail'] }
      ],
      custom: []
    },

    /**
     * Detects missing topics by checking if any extracted evidence items covered them.
     * @param {Array} evidenceItems - Array of identified evidence objects
     * @param {string} taskType - Selected task lens ('learn', 'compare', 'decide', 'technical', 'custom')
     * @param {Array} [allExtractedElements=[]] - Raw extracted elements for secondary check
     * @returns {Array<{ topic: string, message: string, severity: string }>}
     */
    detectInformationGaps(evidenceItems = [], taskType = 'learn', allExtractedElements = []) {
      const expectations = this.EXPECTED_TOPICS[taskType] || [];
      if (expectations.length === 0) return [];

      const gaps = [];
      const combinedText = allExtractedElements.map(el => (el.text || '').toLowerCase()).join(' ');

      for (const item of expectations) {
        // Check if any evidence item matches this topic directly or through keywords
        const coveredInEvidence = evidenceItems.some(ev => {
          if (ev.category.toLowerCase().includes(item.topic.toLowerCase())) return true;
          return item.keywords.some(kw => (ev.matchedKeywords || []).includes(kw));
        });

        if (coveredInEvidence) continue;

        // Secondary check across entire page text for high-precision keywords
        const foundInPage = item.keywords.some(kw => {
          const regex = new RegExp(`(^|\\W)${WebLens.Utils ? WebLens.Utils.escapeRegExp(kw) : kw}(\\W|$)`, 'i');
          return regex.test(combinedText);
        });

        if (!foundInPage) {
          gaps.push({
            topic: item.topic,
            // Precise phrasing requirement: never claim it doesn't exist, only that it wasn't found on this page
            message: `${item.topic} information was not found on this page.`,
            severity: 'notice'
          });
        }
      }

      return gaps;
    }
  };

  WebLens.GapDetector = GapDetector;
})();
