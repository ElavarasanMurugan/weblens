/**
 * WebLens - Popup Controller
 * Manages user interface interactions, task selection, rendering the Information Map,
 * and dispatching commands to the active webpage's content script.
 * Contains ZERO analysis or DOM parsing logic (pure UI controller).
 */

(function () {
  'use strict';

  // Grab shared globals
  const WebLens = window.WebLens || {};
  const MESSAGE_TYPES = WebLens.MESSAGE_TYPES;

  // DOM Element References
  const taskButtons = document.querySelectorAll('.task-btn');
  const taskDescription = document.getElementById('taskDescription');
  const customQueryContainer = document.getElementById('customQueryContainer');
  const customQueryInput = document.getElementById('customQueryInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const analyzeBtnText = document.getElementById('analyzeBtnText');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const restoreBtn = document.getElementById('restoreBtn');
  const statusPill = document.getElementById('statusPill');
  const errorBanner = document.getElementById('errorBanner');
  const errorMessage = document.getElementById('errorMessage');
  const resultsArea = document.getElementById('resultsArea');
  const emptyState = document.getElementById('emptyState');
  const categoryCardsList = document.getElementById('categoryCardsList');
  const gapsSection = document.getElementById('gapsSection');
  const gapsList = document.getElementById('gapsList');
  const metricRelevantCount = document.getElementById('metricRelevantCount');
  const metricCategoriesCount = document.getElementById('metricCategoriesCount');
  const metricScanTime = document.getElementById('metricScanTime');

  // Internal UI State
  let currentTask = WebLens.TASK_TYPES?.LEARN || 'learn';
  let activeTabId = null;

  /**
   * Initializes the popup UI.
   */
  async function initPopup() {
    setupEventListeners();
    await resolveActiveTab();
    await checkInitialStatus();
  }

  /**
   * Resolves the current active browser tab.
   */
  async function resolveActiveTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        activeTabId = tab.id;
      }
    } catch (err) {
      console.error('[WebLens Popup] Failed to get active tab:', err);
      showError('Unable to identify active browser tab.');
    }
  }

  /**
   * Checks if the active page was already analyzed in the current session.
   */
  async function checkInitialStatus() {
    if (!activeTabId) return;

    try {
      const response = await sendTabMessage({ type: MESSAGE_TYPES.GET_STATUS });
      if (response && response.status && response.status.hasAnalysis && response.lastAnalysis) {
        // Restore previous task selection
        if (response.status.activeTask) {
          selectTask(response.status.activeTask);
        }
        if (response.status.customQuery && customQueryInput) {
          customQueryInput.value = response.status.customQuery;
        }
        renderInformationMap(response.lastAnalysis);
      }
    } catch (e) {
      // Content script might not be injected yet on chrome:// or restricted pages
      console.log('[WebLens Popup] Page not initialized or restricted:', e.message);
    }
  }

  /**
   * Attaches UI event listeners.
   */
  function setupEventListeners() {
    // Task Selection
    taskButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const task = btn.getAttribute('data-task');
        selectTask(task);
      });
    });

    // Custom query enter key triggers analyze
    if (customQueryInput) {
      customQueryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleAnalyzeClick();
        }
      });
    }

    // Analyze Page Button
    analyzeBtn.addEventListener('click', handleAnalyzeClick);

    // Restore Page Button
    restoreBtn.addEventListener('click', handleRestoreClick);
  }

  /**
   * Updates task button selection and description.
   */
  function selectTask(task) {
    currentTask = task;

    taskButtons.forEach((btn) => {
      if (btn.getAttribute('data-task') === task) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update description text
    const desc = WebLens.TASK_DESCRIPTIONS?.[task] || '';
    if (taskDescription) {
      taskDescription.textContent = desc;
    }

    // Show/hide custom input
    if (task === WebLens.TASK_TYPES?.CUSTOM || task === 'custom') {
      customQueryContainer.classList.remove('hidden');
      customQueryInput.focus();
    } else {
      customQueryContainer.classList.add('hidden');
    }
  }

  /**
   * Sends a message to the active tab's content script with retry/injection fallback.
   */
  async function sendTabMessage(message) {
    if (!activeTabId) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) throw new Error('No active browser tab detected.');
      activeTabId = tab.id;
    }

    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(activeTabId, message, (response) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }
        resolve(response);
      });
    });
  }

  /**
   * Handles Analyze Page action.
   */
  async function handleAnalyzeClick() {
    hideError();
    const customQuery = customQueryInput ? customQueryInput.value.trim() : '';

    if (currentTask === 'custom' && !customQuery) {
      showError('Please enter at least one keyword for Custom analysis.');
      customQueryInput.focus();
      return;
    }

    setLoading(true);

    try {
      const message = {
        type: MESSAGE_TYPES.ANALYZE_PAGE,
        payload: {
          taskType: currentTask,
          customQuery: customQuery
        }
      };

      let response;
      try {
        response = await sendTabMessage(message);
      } catch (err) {
        // If content script was not ready, try injecting or ask user to reload
        if (err.message.includes('Receiving end does not exist') || err.message.includes('Could not establish connection')) {
          showError('Cannot connect to page. Please refresh the webpage tab and try again.');
          setLoading(false);
          return;
        }
        throw err;
      }

      if (response && response.success && response.data) {
        renderInformationMap(response.data);
      } else {
        showError(response?.error || 'Analysis failed to return valid results.');
      }
    } catch (error) {
      console.error('[WebLens Popup Analysis Error]', error);
      showError(error.message || 'An error occurred during page analysis.');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handles Restore Page action.
   */
  async function handleRestoreClick() {
    hideError();
    try {
      await sendTabMessage({ type: MESSAGE_TYPES.RESTORE_PAGE });
      resetUIAfterRestore();
    } catch (err) {
      console.warn('[WebLens Restore Error]', err);
      // Even if communication fails, reset local view
      resetUIAfterRestore();
    }
  }

  function resetUIAfterRestore() {
    resultsArea.classList.add('hidden');
    emptyState.classList.add('hidden');
    statusPill.textContent = 'Restored';
    statusPill.className = 'status-pill idle';
    categoryCardsList.innerHTML = '';
    gapsList.innerHTML = '';
  }

  /**
   * Renders the structured Information Map in the popup UI.
   */
  function renderInformationMap(infoMap) {
    if (!infoMap) return;

    categoryCardsList.innerHTML = '';
    gapsList.innerHTML = '';

    const hasItems = infoMap.totalRelevantItems > 0;

    if (!hasItems) {
      resultsArea.classList.add('hidden');
      emptyState.classList.remove('hidden');
      statusPill.textContent = '0 Matches';
      statusPill.className = 'status-pill idle';
      return;
    }

    emptyState.classList.add('hidden');
    resultsArea.classList.remove('hidden');

    // Update Status Pill
    statusPill.textContent = `${infoMap.totalRelevantElements} Focused`;
    statusPill.className = 'status-pill analyzed';

    // Update Metrics
    metricRelevantCount.textContent = infoMap.totalRelevantItems;
    metricCategoriesCount.textContent = infoMap.categories ? infoMap.categories.length : 0;
    metricScanTime.textContent = `${infoMap.meta?.elapsedMs || 0}ms`;

    // Render Categories
    infoMap.categories.forEach((cat, index) => {
      if (!cat.items || cat.items.length === 0) return;

      const card = document.createElement('div');
      card.className = `category-card ${index === 0 ? 'expanded' : ''}`;

      // Card Header
      const header = document.createElement('div');
      header.className = 'category-card-header';
      header.innerHTML = `
        <div class="category-title-group">
          <span class="category-name">${WebLens.Utils?.escapeHTML(cat.name) || cat.name}</span>
          <span class="category-badge">${cat.count}</span>
        </div>
        <span class="toggle-arrow">▼</span>
      `;

      // Card Items Container
      const itemsContainer = document.createElement('div');
      itemsContainer.className = 'category-items';

      cat.items.forEach((item) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'evidence-item';

        const escapedTitle = WebLens.Utils?.escapeHTML(item.title) || item.title;
        const escapedText = WebLens.Utils?.escapeHTML(item.text) || item.text;
        const scoreLabel = item.relevanceScore ? `★ ${item.relevanceScore}` : '';

        itemEl.innerHTML = `
          <div class="evidence-header">
            <span class="evidence-title">${escapedTitle}</span>
            <span class="relevance-score-badge">${scoreLabel}</span>
          </div>
          <p class="evidence-text">"${escapedText}"</p>
          <div class="evidence-footer">
            <span class="tag-badge">${item.tag || 'text'}</span>
            <button type="button" class="view-source-btn" data-source-id="${item.sourceId}">
              View Source ↗
            </button>
          </div>
        `;

        // Bind View Source Jump
        const viewSourceBtn = itemEl.querySelector('.view-source-btn');
        viewSourceBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          jumpToSource(item.sourceId);
        });

        itemsContainer.appendChild(itemEl);
      });

      // Toggle Expand/Collapse on Header Click
      header.addEventListener('click', () => {
        card.classList.toggle('expanded');
      });

      card.appendChild(header);
      card.appendChild(itemsContainer);
      categoryCardsList.appendChild(card);
    });

    // Render Information Gaps
    if (infoMap.gaps && infoMap.gaps.length > 0) {
      gapsSection.classList.remove('hidden');
      infoMap.gaps.forEach((gap) => {
        const li = document.createElement('li');
        li.className = 'gap-item';
        li.textContent = gap.message;
        gapsList.appendChild(li);
      });
    } else {
      gapsSection.classList.add('hidden');
    }
  }

  /**
   * Sends command to scroll to and pulse the source element on the webpage.
   */
  async function jumpToSource(sourceId) {
    if (!sourceId) return;

    try {
      await sendTabMessage({
        type: MESSAGE_TYPES.SCROLL_TO_SOURCE,
        payload: { sourceId }
      });
    } catch (err) {
      console.error('[WebLens Popup] Jump to source error:', err);
    }
  }

  /**
   * Sets the loading state on the Analyze button.
   */
  function setLoading(isLoading) {
    analyzeBtn.disabled = isLoading;
    if (isLoading) {
      loadingSpinner.classList.remove('hidden');
      analyzeBtnText.textContent = 'Analyzing...';
      statusPill.textContent = 'Scanning';
      statusPill.className = 'status-pill scanning';
    } else {
      loadingSpinner.classList.add('hidden');
      analyzeBtnText.textContent = 'Analyze Page';
    }
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.remove('hidden');
  }

  function hideError() {
    errorBanner.classList.add('hidden');
  }

  // Initialize once DOM is loaded
  document.addEventListener('DOMContentLoaded', initPopup);
})();
