// Background worker for Learning Tracker
const IDLE_DETECTION_SECONDS = 5 * 60; // 5 minutes

let activeTabId = null;
let activeWindowId = null;
let activeDomain = null;
let sessionStartTime = null;
let lastSavedTime = null; // Track when we last dumped progress to storage

chrome.runtime.onInstalled.addListener(() => {
  chrome.idle.setDetectionInterval(IDLE_DETECTION_SECONDS);
  chrome.storage.local.get(["trackedSites", "trackingData"], (res) => {
    // If it's a fresh install or the old array format, let's reset to robust dictionary format
    if (!res.trackedSites || Array.isArray(res.trackedSites)) {
      chrome.storage.local.set({
        trackedSites: {
          "neetcode.io": 60, // 60 minutes goal
          "deeplearning.ai": 60,
          "leetcode.com": 60
        },
        trackingData: res.trackingData || {}
      });
    }
  });
  initializeActiveTab();
});

// Run this when the service worker wakes up to restore state if it was suspended
initializeActiveTab();

async function initializeActiveTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      handleTabChange(tabs[0].id, tabs[0].windowId, false);
    }
  } catch (e) {
    console.error("Initialization error:", e);
  }
}

async function getTrackedSites() {
  const result = await chrome.storage.local.get("trackedSites");
  return result.trackedSites || {};
}

async function getTrackingData() {
  const result = await chrome.storage.local.get("trackingData");
  return result.trackingData || {};
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function updateTime() {
  if (activeDomain && sessionStartTime && lastSavedTime) {
    const now = Date.now();
    const duration = now - lastSavedTime; // Only add the time elapsed since the last save
    
    if (duration > 0) {
      const today = getTodayString();
      const trackingData = await getTrackingData();
      
      if (!trackingData[today]) {
        trackingData[today] = {};
      }
      if (!trackingData[today][activeDomain]) {
        trackingData[today][activeDomain] = 0;
      }
      
      trackingData[today][activeDomain] += duration;
      await chrome.storage.local.set({ trackingData });
    }
    lastSavedTime = now; // Push the save marker forward, but LEAVE sessionStartTime intact
  }
}

async function handleTabChange(tabId, windowId, isTabSwitch = true) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await updateTime();
    activeDomain = null;
    sessionStartTime = null;
    lastSavedTime = null;
    return;
  }

  activeTabId = tabId;
  activeWindowId = windowId;

  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab && tab.url) {
      const urlObj = new URL(tab.url);
      const domain = urlObj.hostname.replace(/^www\./, '');
      
      const trackedSites = await getTrackedSites();
      if (domain in trackedSites) {
        if (activeDomain !== domain) {
          // Changed to a NEW tracked domain
          await updateTime();
          activeDomain = domain;
          sessionStartTime = Date.now();
          lastSavedTime = sessionStartTime;
        } else {
          // Changed tabs, but it's the SAME tracked domain!
          // We DO NOT restart the session timer! We just keep it running.
          // Unless the service worker just woke up (sessionStartTime is null)
          if (!sessionStartTime) {
            sessionStartTime = Date.now();
            lastSavedTime = sessionStartTime;
          }
        }
      } else {
        // Changed to an untracked domain
        await updateTime();
        activeDomain = null;
        sessionStartTime = null;
        lastSavedTime = null;
      }
    } else {
      await updateTime();
      activeDomain = null;
      sessionStartTime = null;
      lastSavedTime = null;
    }
  } catch (err) {
    await updateTime();
    activeDomain = null;
    sessionStartTime = null;
    lastSavedTime = null;
  }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  handleTabChange(activeInfo.tabId, activeInfo.windowId, true);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    try {
      const tabs = await chrome.tabs.query({ active: true, windowId: tab.windowId });
      if (tabs.length > 0 && tabs[0].id === tabId) {
        handleTabChange(tabId, tab.windowId, false);
      }
    } catch (e) {
      // Ignored
    }
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await updateTime();
    activeDomain = null;
    sessionStartTime = null;
    lastSavedTime = null;
  } else {
    try {
      const tabs = await chrome.tabs.query({ active: true, windowId: windowId });
      if (tabs.length > 0) {
        handleTabChange(tabs[0].id, windowId, false);
      }
    } catch (e) {
      console.error(e);
    }
  }
});

chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === "idle" || state === "locked") {
    await updateTime();
    activeDomain = null; // effectively pauses the timer by clearing domain context temporarily
  } else if (state === "active") {
    initializeActiveTab();
  }
});

// Periodic save via alarms (Service Worker safe)
chrome.alarms.create("saveTimeAlarm", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "saveTimeAlarm") {
    updateTime();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_ACTIVE_SESSION") {
    if (activeDomain && sessionStartTime) {
      // We must optionally push a save here so the dashboard sees live data immediately
      updateTime().then(() => {
        sendResponse({
          domain: activeDomain,
          activeDuration: Date.now() - sessionStartTime
        });
      });
      return true; // Return true indicates asynchronous response
    } else {
      sendResponse(null);
    }
  }
});
