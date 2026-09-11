/**
 * WebLens - Page State Manager
 * Tracks current active task, extracted elements, and analysis status in the content script context.
 */

(function () {
  'use strict';

  const WebLens = window.WebLens = window.WebLens || {};

  const state = {
    activeTask: null,
    customQuery: '',
    lastAnalysis: null,
    extractedElements: [],
    isActive: false
  };

  const PageState = {
    setActiveTask(taskType, customQuery = '') {
      state.activeTask = taskType;
      state.customQuery = customQuery;
      state.isActive = true;
    },

    clearActiveTask() {
      state.activeTask = null;
      state.customQuery = '';
      state.lastAnalysis = null;
      state.extractedElements = [];
      state.isActive = false;
    },

    setLastAnalysis(analysis) {
      state.lastAnalysis = analysis;
    },

    getLastAnalysis() {
      return state.lastAnalysis;
    },

    setExtractedElements(elements) {
      state.extractedElements = elements;
    },

    getExtractedElements() {
      return state.extractedElements;
    },

    getStatus() {
      return {
        isActive: state.isActive,
        activeTask: state.activeTask,
        customQuery: state.customQuery,
        hasAnalysis: Boolean(state.lastAnalysis),
        totalElements: state.extractedElements.length,
        totalRelevant: state.lastAnalysis ? state.lastAnalysis.totalRelevantElements : 0
      };
    }
  };

  WebLens.PageState = PageState;
})();
