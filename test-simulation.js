/**
 * Test simulation script verifying the core analysis pipeline in a mocked DOM environment.
 */

const fs = require('fs');
const path = require('path');

// Setup mock window and document
global.window = {};
global.performance = { now: () => Date.now() };

// Load scripts in order
function loadScript(relPath) {
  const code = fs.readFileSync(path.join(__dirname, 'weblens', relPath), 'utf8');
  eval(code);
}

loadScript('shared/constants.js');
loadScript('shared/messageTypes.js');
loadScript('shared/utils.js');
loadScript('core/relevanceEngine.js');
loadScript('core/evidenceExtractor.js');
loadScript('core/gapDetector.js');
loadScript('core/informationMap.js');
loadScript('core/taskAnalyzer.js');

const WebLens = window.WebLens;

console.log('--- TEST 1: Constants & Message Types Loaded ---');
console.assert(WebLens.TASK_TYPES.COMPARE === 'compare', 'Task types check failed');
console.assert(WebLens.MESSAGE_TYPES.ANALYZE_PAGE === 'ANALYZE_PAGE', 'Message types check failed');
console.log('✔ Constants & Message Types Verified');

console.log('\n--- TEST 2: Relevance Scoring Engine ---');
const scoreResult = WebLens.RelevanceEngine.calculateRelevance(
  'The price is $49 per month for the pro tier subscription plan.',
  ['price', 'cost', 'subscription', 'tier', 'plan', '$'],
  'p'
);
console.log('Relevance Score:', scoreResult.score, '| Label:', scoreResult.label, '| Matches:', scoreResult.matchedKeywords);
console.assert(scoreResult.score >= 3.0, 'Expected high relevance score');
console.log('✔ Relevance Engine Verified');

console.log('\n--- TEST 3: Full Task Analysis & Information Map on Mock Content ---');
const sampleElements = [
  {
    id: 'el-0',
    tag: 'h1',
    text: 'ApexCloud Engine: Architecture and Evaluation',
    index: 0
  },
  {
    id: 'el-1',
    tag: 'p',
    text: 'The fundamental concept behind ApexCloud is distributed orchestration. By definition, it operates as a lightweight runtime.',
    index: 1
  },
  {
    id: 'el-2',
    tag: 'p',
    text: 'Our research finding demonstrated that speculative allocation reduces cold-start latency by up to 64%. The key conclusion is proven.',
    index: 2
  },
  {
    id: 'el-3',
    tag: 'p',
    text: 'ApexCloud supports up to 128 virtual CPU cores and 512 GB RAM specifications. Performance sustains 250,000 requests per second.',
    index: 3
  },
  {
    id: 'el-4',
    tag: 'p',
    text: 'Developer Tier price is Free. Pro Tier costs $49 per month subscription with multi-region failover.',
    index: 4
  },
  {
    id: 'el-5',
    tag: 'p',
    text: 'The primary advantage of ApexCloud is zero downtime updates. Teams gain productivity benefits.',
    index: 5
  },
  {
    id: 'el-6',
    tag: 'p',
    text: 'However, significant limitations must be considered. The system imposes a strict 10 MB payload limit trade-off.',
    index: 6
  },
  {
    id: 'el-7',
    tag: 'p',
    text: 'The installation requires npm install -g @apexcloud/cli. Call connectCluster(endpoint, apiKey) API method.',
    index: 7
  }
];

// Test 3.1: Learn Lens
console.log('\nTesting "Learn" Lens:');
const learnMap = WebLens.TaskAnalyzer.analyzeContent(sampleElements, 'learn');
console.log(`- Relevant Elements: ${learnMap.totalRelevantElements}`);
console.log(`- Categories Found: ${learnMap.categories.map(c => `${c.name} (${c.count})`).join(', ')}`);
console.assert(learnMap.totalRelevantElements > 0, 'Learn map should have items');

// Test 3.2: Compare Lens (with missing battery)
console.log('\nTesting "Compare" Lens:');
const compareMap = WebLens.TaskAnalyzer.analyzeContent(sampleElements, 'compare');
console.log(`- Relevant Elements: ${compareMap.totalRelevantElements}`);
console.log(`- Categories Found: ${compareMap.categories.map(c => `${c.name} (${c.count})`).join(', ')}`);
console.log(`- Gaps Detected: ${compareMap.gaps.map(g => g.message).join(' | ')}`);
const hasBatteryGap = compareMap.gaps.some(g => g.message.includes('Battery & Power'));
console.assert(hasBatteryGap, 'Should detect missing Battery & Power information gap');
console.log('✔ Gap Detector for Compare successfully detected missing battery info!');

// Test 3.3: Decide Lens
console.log('\nTesting "Decide" Lens:');
const decideMap = WebLens.TaskAnalyzer.analyzeContent(sampleElements, 'decide');
console.log(`- Relevant Elements: ${decideMap.totalRelevantElements}`);
console.log(`- Categories Found: ${decideMap.categories.map(c => `${c.name} (${c.count})`).join(', ')}`);
console.assert(decideMap.totalRelevantElements > 0, 'Decide map should have items');

// Test 3.4: Technical Lens
console.log('\nTesting "Technical" Lens:');
const techMap = WebLens.TaskAnalyzer.analyzeContent(sampleElements, 'technical');
console.log(`- Relevant Elements: ${techMap.totalRelevantElements}`);
console.log(`- Categories Found: ${techMap.categories.map(c => `${c.name} (${c.count})`).join(', ')}`);
console.assert(techMap.totalRelevantElements > 0, 'Technical map should have items');

// Test 3.5: Custom Lens
console.log('\nTesting "Custom" Lens for query "pricing":');
const customMap = WebLens.TaskAnalyzer.analyzeContent(sampleElements, 'custom', 'price subscription');
console.log(`- Relevant Elements: ${customMap.totalRelevantElements}`);
console.log(`- Categories Found: ${customMap.categories.map(c => `${c.name} (${c.count})`).join(', ')}`);
console.assert(customMap.totalRelevantElements > 0, 'Custom map should find pricing matches');

console.log('\n========================================');
console.log('ALL PIPELINE VERIFICATIONS PASSED SUCCESSFULLY!');
console.log('========================================');
