/**
 * WebLens - Shared Constants
 * Defines task types, default keywords, categories, scoring weights, and CSS classes.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  WebLens.TASK_TYPES = {
    LEARN: 'learn',
    COMPARE: 'compare',
    DECIDE: 'decide',
    TECHNICAL: 'technical',
    CUSTOM: 'custom'
  };

  WebLens.TASK_LABELS = {
    learn: 'Learn',
    compare: 'Compare',
    decide: 'Decide',
    technical: 'Technical',
    custom: 'Custom'
  };

  WebLens.TASK_DESCRIPTIONS = {
    learn: 'Understand core concepts, definitions, and key findings.',
    compare: 'Analyze features, specifications, pricing, and pros/cons.',
    decide: 'Evaluate benefits, trade-offs, risks, and critical evidence.',
    technical: 'Extract API specs, functions, configurations, and code patterns.',
    custom: 'Find information matching your personalized query.'
  };

  /**
   * Keyword groups and categories for rule-based analysis.
   * Can be easily swapped with embeddings or LLM classification.
   */
  WebLens.TASK_CONFIGS = {
    learn: {
      categories: {
        'Concepts & Definitions': ['definition', 'defined', 'concept', 'meaning', 'term', 'overview', 'what is', 'refers to', 'principle'],
        'Key Findings & Results': ['finding', 'result', 'outcome', 'discovery', 'conclusion', 'evidence', 'proved', 'demonstrated', 'revealed'],
        'Methods & Explanations': ['method', 'methodology', 'approach', 'technique', 'how it works', 'process', 'mechanism', 'explanation'],
        'Core Takeaways': ['important', 'key', 'fundamental', 'essential', 'summary', 'crucial', 'notably', 'highlight']
      },
      expectedTopics: ['Concepts & Definitions', 'Methods & Explanations', 'Key Findings & Results', 'Core Takeaways']
    },
    compare: {
      categories: {
        'Pricing & Cost': ['price', 'pricing', 'cost', 'subscription', 'fee', 'tier', 'plan', 'free', 'discount', 'expensive', 'cheap', '$', '€', '£'],
        'Features & Specifications': ['feature', 'features', 'specification', 'specifications', 'specs', 'capability', 'capabilities', 'dimensions', 'size', 'weight'],
        'Performance & Hardware': ['performance', 'speed', 'benchmark', 'battery', 'efficiency', 'throughput', 'latency', 'capacity', 'cpu', 'gpu', 'ram'],
        'Pros, Cons & Differences': ['advantage', 'disadvantage', 'benefit', 'drawback', 'pro', 'con', 'versus', 'vs', 'compared to', 'difference', 'alternative']
      },
      expectedTopics: ['Pricing & Cost', 'Features & Specifications', 'Performance & Hardware', 'Warranty & Support']
    },
    decide: {
      categories: {
        'Benefits & Strengths': ['benefit', 'advantage', 'strength', 'upside', 'value', 'gain', 'positive', 'ideal for', 'best for'],
        'Risks & Warnings': ['risk', 'warning', 'danger', 'hazard', 'pitfall', 'threat', 'vulnerability', 'issue', 'caution', 'drawback'],
        'Limitations & Trade-offs': ['limitation', 'trade-off', 'constraint', 'downside', 'restriction', 'shortcoming', 'weakness', 'lacking'],
        'Supporting Evidence': ['evidence', 'proof', 'verified', 'study', 'tested', 'certified', 'track record', 'testimonial', 'guarantee']
      },
      expectedTopics: ['Benefits & Strengths', 'Risks & Warnings', 'Limitations & Trade-offs', 'Supporting Evidence']
    },
    technical: {
      categories: {
        'APIs & Functions': ['api', 'function', 'method', 'endpoint', 'route', 'hook', 'interface', 'class', 'parameter', 'return', 'payload'],
        'Setup & Installation': ['installation', 'install', 'setup', 'requirement', 'dependencies', 'prerequisites', 'npm', 'pip', 'command', 'cli'],
        'Configuration & Settings': ['configuration', 'config', 'settings', 'environment', 'variable', 'options', 'flag', 'properties'],
        'Errors & Debugging': ['error', 'exception', 'troubleshooting', 'debug', 'fail', 'bug', 'fix', 'warning', 'handling', 'code', 'snippet']
      },
      expectedTopics: ['APIs & Functions', 'Setup & Installation', 'Configuration & Settings', 'Errors & Debugging']
    },
    custom: {
      categories: {
        'Direct Matches': [],
        'Related Context': []
      },
      expectedTopics: []
    }
  };

  WebLens.SCORING = {
    TAG_WEIGHTS: {
      H1: 3.0,
      H2: 2.5,
      H3: 2.0,
      P: 1.0,
      LI: 1.0,
      TD: 1.0
    },
    KEYWORD_MATCH: 1.5,
    MULTI_KEYWORD_BONUS: 1.0,
    MIN_RELEVANCE_SCORE: 1.0,
    THRESHOLDS: {
      HIGH: 3.0,
      MEDIUM: 2.0,
      WEAK: 1.0
    }
  };

  WebLens.CSS_CLASSES = {
    HIGHLIGHT: 'weblens-highlight',
    HIGHLIGHT_ACTIVE: 'weblens-highlight-active',
    DIMMED: 'weblens-dimmed',
    ROOT_ACTIVE: 'weblens-active-mode'
  };

  WebLens.ELEMENT_ID_PREFIX = 'weblens-el-';
})();
