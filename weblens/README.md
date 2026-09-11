# WebLens – Task-Aware Webpage Intelligence

> **Chrome Extension Manifest V3** | **Vanilla JavaScript** | **Zero External Dependencies**

WebLens transforms how users extract value from information-dense webpages. Rather than general, unfocused summaries or slow chat interactions, WebLens analyzes the current page through **task-specific lenses** to extract, organize, focus, and connect evidence directly to its source.

---

## 1. Problem
Modern web pages (articles, technical documentation, product reviews, and comparison tables) are overloaded with marketing copy, navigation chrome, sidebars, advertisements, and irrelevant details. Users arrive at a page with a specific intent (learning a concept, comparing specs, making a purchasing decision, or finding an API signature), but spend precious minutes manually scanning and filtering noise.

Existing tools fail because:
* Generic webpage summarizers drop crucial context, technical details, or specific figures.
* AI chat sidebars force the user into tedious question-and-answer loops detached from the visual page.
* Traditional search highlights only exact keyword matches without category organization or source traceability.

---

## 2. Solution: The WebLens Principle

$$\textbf{Task} \longrightarrow \textbf{Extract} \longrightarrow \textbf{Organize} \longrightarrow \textbf{Focus} \longrightarrow \textbf{Evidence}$$

WebLens filters and maps content strictly according to the user's immediate cognitive task:
1. **Task-Specific Relevance**: Content is filtered against targeted categories for the chosen task lens.
2. **Visual Focus**: Meaningful sections receive non-destructive highlights while irrelevant sections are dimmed.
3. **Information Map**: Extracted points are organized into structured, collapsible category cards with relevance rankings.
4. **Source Traceability**: Every extracted point features a `[View Source ↗]` trigger that smoothly scrolls the host page to the exact element and pulses it.
5. **Information Gap Detection**: Transparently identifies essential topics expected for the task that were omitted from the webpage (e.g. *"Battery information was not found on this page"*).

---

## 3. The 5 Task Lenses

| Lens | Focus & Purpose | Extracted Categories |
| :--- | :--- | :--- |
| 💡 **Learn** | Understand foundational ideas & discoveries | *Concepts & Definitions*, *Methods & Explanations*, *Key Findings & Results*, *Core Takeaways* |
| ⚖️ **Compare** | Evaluate specifications, costs, and options | *Pricing & Cost*, *Features & Specifications*, *Performance & Hardware*, *Pros, Cons & Differences* |
| 🎯 **Decide** | Weigh trade-offs and evaluate evidence | *Benefits & Strengths*, *Risks & Warnings*, *Limitations & Trade-offs*, *Supporting Evidence* |
| ⚡ **Technical**| Implement, configure, and debug software | *APIs & Functions*, *Setup & Installation*, *Configuration & Settings*, *Errors & Debugging* |
| ✨ **Custom** | Targeted focus on user-defined query keywords | *Direct Matches*, *Related Information* |

---

## 4. System Architecture

```text
                                  USER
                                    |
                                    v
                           +------------------+
                           |   Popup UI       |  (popup.html / popup.js)
                           | Task Selection   |
                           +--------+---------+
                                    |  chrome.tabs.sendMessage
                                    v
                           +------------------+
                           | Content Script   |  (content.js / pageState.js)
                           |  Message Bridge  |
                           +--------+---------+
                                    |
                                    v
                           +------------------+
                           | Task Controller  |  (taskController.js)
                           +--------+---------+
                                    |
                                    v
                           +------------------+
                           |  DOM Extractor   |  (domExtractor.js)
                           | (H1-H3, P, LI, TD|
                           +--------+---------+
                                    |
                                    v
                           +------------------+
                           |  Task Analyzer   |  (taskAnalyzer.js)
                           +--------+---------+
                                    |
            +-----------------------+-----------------------+
            |                       |                       |
            v                       v                       v
    +---------------+       +---------------+       +---------------+
    |   Relevance   |       |   Evidence    |       |      Gap      |
    |    Engine     |       |   Extractor   |       |   Detector    |
    | (relevance.js)|       | (evidence.js) |       | (gapDetector) |
    +---------------+       +---------------+       +---------------+
            |                       |                       |
            +-----------------------+-----------------------+
                                    |
                                    v
                           +------------------+
                           | Information Map  |  (informationMap.js)
                           +--------+---------+
                                    |
            +-----------------------+-----------------------+
            | sendResponse                                  | applyVisualFocus
            v                                               v
  +-------------------+                           +-------------------+
  | Popup Presentation|                           | Webpage Focus     |
  | - Summary Metrics |                           | - Yellow Highlight|
  | - Category Cards  |                           | - Irrelevant Dim  |
  | - Gap Alerts      |                           | - Scroll to Source|
  +-------------------+                           +-------------------+
```

---

## 5. Folder Structure

```text
weblens/
├── manifest.json            # Chrome Manifest V3 configuration
├── README.md                # Documentation and architecture guide
│
├── popup/                   # Presentation Layer (Team Member 1)
│   ├── popup.html           # Popup UI layout and lens controls
│   ├── popup.css            # Modern styling, transitions, and badges
│   └── popup.js             # UI events, tab communication, card rendering
│
├── content/                 # Webpage Interaction Layer (Team Member 2)
│   ├── content.js           # Chrome runtime message dispatcher
│   ├── domExtractor.js      # Noise-free semantic DOM extractor
│   ├── highlighter.js       # Non-destructive highlighter, dimmer & scroller
│   └── pageState.js         # Runtime page state and cache manager
│
├── core/                    # Intelligence & Analysis Engine (Team Member 3)
│   ├── taskController.js    # Analysis pipeline orchestrator
│   ├── taskAnalyzer.js      # Task categorization & keyword rules
│   ├── relevanceEngine.js   # Multi-factor relevance scoring
│   ├── evidenceExtractor.js # Traceable evidence node builder
│   ├── informationMap.js    # Standardized Information Map compiler
│   └── gapDetector.js       # Expected topic gap identifier
│
├── shared/                  # Shared Specifications & Utilities
│   ├── constants.js         # Task definitions, categories & scoring rules
│   ├── messageTypes.js      # Standardized message schema
│   └── utils.js             # Safe DOM, text truncation & regex utilities
│
├── icons/                   # Extension icons (16x16, 48x48, 128x128)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
└── test/
    └── sample-article.html  # Comprehensive sample article for testing all 5 lenses
```

---

## 6. Team Module Responsibilities

The modular architecture enables 3 team members to develop features simultaneously without code conflicts:

### Team Member 1: Popup & Presentation Layer (`popup/`)
* **Files**: `popup/popup.html`, `popup/popup.css`, `popup/popup.js`
* **Responsibilities**:
  * Task lens selector buttons and custom query input field.
  * Rendering the structured `InformationMap` into expandable category cards.
  * Handling user actions (Analyze, View Source, Restore Page).
  * Enforcing zero analysis or DOM parsing inside the popup context.

### Team Member 2: Webpage Extraction & Highlighting (`content/`)
* **Files**: `content/domExtractor.js`, `content/highlighter.js`, `content/pageState.js`, `content/content.js`
* **Responsibilities**:
  * Extracting readable text elements (`h1`, `h2`, `h3`, `p`, `li`, `td`) and stamping `data-weblens-id`.
  * Filtering out advertisements, navigation bars, scripts, styles, and footers.
  * Applying non-destructive CSS highlights (`.weblens-highlight`) and dimming (`.weblens-dimmed`).
  * Smooth scrolling to original source elements upon `[View Source]` requests with a visual pulse effect.
  * Completely restoring page appearance (`restorePage()`).

### Team Member 3: Analysis & Relevance Engine (`core/`)
* **Files**: `core/taskController.js`, `core/taskAnalyzer.js`, `core/relevanceEngine.js`, `core/evidenceExtractor.js`, `core/informationMap.js`, `core/gapDetector.js`
* **Responsibilities**:
  * End-to-end coordination in `taskController.js`.
  * Scoring algorithms in `relevanceEngine.js` (frequency, tag weights, multi-keyword bonuses).
  * Mapping evidence to source IDs in `evidenceExtractor.js`.
  * Detecting missing expected topics in `gapDetector.js`.
  * Constructing the standardized `InformationMap` JSON schema.

---

## 7. Standardized Communication Schema

All modules communicate via `shared/messageTypes.js`:

```javascript
const MESSAGE_TYPES = {
  ANALYZE_PAGE: 'ANALYZE_PAGE',       // Payload: { taskType, customQuery }
  SCROLL_TO_SOURCE: 'SCROLL_TO_SOURCE', // Payload: { sourceId }
  RESTORE_PAGE: 'RESTORE_PAGE',         // Restores original styles
  GET_STATUS: 'GET_STATUS'              // Retrieves active page status
};
```

### Information Map Output Schema
The analysis output returned to the Popup is strictly decoupled from the internal analyzer implementation:

```json
{
  "task": "decide",
  "timestamp": 1726027800000,
  "totalRelevantItems": 5,
  "totalRelevantElements": 4,
  "categories": [
    {
      "name": "Benefits & Strengths",
      "count": 2,
      "items": [
        {
          "id": "ev-weblens-el-4",
          "title": "Advantage",
          "category": "Benefits & Strengths",
          "text": "The primary advantage of ApexCloud is its seamless zero-downtime rolling update pipeline...",
          "sourceId": "weblens-el-4",
          "tag": "p",
          "relevanceScore": 3.5,
          "matchedKeywords": ["advantage", "benefit"]
        }
      ]
    },
    {
      "name": "Limitations & Trade-offs",
      "count": 1,
      "items": [...]
    }
  ],
  "relevantElements": ["weblens-el-4", "weblens-el-5", "weblens-el-6"],
  "gaps": [
    {
      "topic": "Warranty & Support",
      "message": "Warranty & Support information was not found on this page.",
      "severity": "notice"
    }
  ]
}
```

---

## 8. How to Install and Run

1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the `weblens` directory (`Extend-X/weblens`).
6. WebLens is now installed and visible in the Chrome toolbar.

---

## 9. How to Test the Extension

1. Open the included test page:
   * Open Chrome and press `Ctrl + O` (or drag and drop into Chrome):
   * Select `Extend-X/weblens/test/sample-article.html`.
2. Click the **WebLens extension icon** in the browser toolbar.
3. Select any Task Lens (e.g. **Compare**).
4. Click **Analyze Page**:
   * Observe relevant specs and pricing tables highlighted in yellow.
   * Observe irrelevant sections dimmed for focus.
   * Notice the Information Map populated with categorized points.
   * Notice the **Information Gap**: *"Battery & Power information was not found on this page."*
5. Click **View Source ↗** on any evidence card:
   * The page automatically scrolls to the source element and pulses with a golden border.
6. Click **Restore Page**:
   * All highlights and dimming are removed and original styles are restored.

---

## 10. Future AI Roadmap

WebLens was architected with pluggable interfaces specifically to allow swapping the keyword relevance engine for an AI/LLM engine without altering the UI, content script, or highlighting system:

```text
Current MVP:
  DOM Elements -> Keyword Relevance Engine -> Information Map

Future AI Evolution:
  DOM Elements -> Chrome Prompt API / On-Device Gemini Nano / Embeddings -> Information Map
```

* **Zero Interface Breakage**: `TaskAnalyzer.analyzeContent()` can be made `async` and call Chrome's built-in `window.ai.languageModel` (Prompt API) or a remote embedding API while returning the exact same `InformationMap` schema.
* **Semantic Nuance**: Enhances gap detection and multi-lingual webpage understanding without changing the Presentation or Highlighting layers.
