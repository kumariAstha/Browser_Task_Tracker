# 🎓 Learning Tracker — Browser Extension

A Manifest V3 Chrome extension to track time you spend on learning platforms like **Neetcode**, **Deeplearning.ai**, **LeetCode**, and more. Features a live floating timer, a beautiful new-tab dashboard, and streak tracking.

---

## ✨ Features

- ⏱️ **Automatic Time Tracking** — Tracks time only when you are active on a tracked site. Pauses when idle for 5+ minutes or window loses focus.
- 🏠 **New Tab Dashboard** — Replace your new tab page with a beautiful live dashboard showing today's total time, per-site breakdown, and your streak.
- 🔴 **Floating Widget** — A glassy live timer floats in the bottom-right corner of any tracked site, so you can see time ticking in real time.
- 🔥 **Streak Tracking** — See how many consecutive days you've hit your 2-hour daily learning goal.
- 🛠️ **Customizable Sites** — Tracked sites are stored in `chrome.storage` and can be updated easily.

---

## 🚀 Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the **`dist/`** folder inside this project:
   ```
   c:\Astha\Projects\Browser_Task_Tracker\dist
   ```
5. The extension is now active! Open a new tab to see your dashboard.

---

## 🛠️ Development

### Install dependencies
```bash
npm install
```

### Build the extension
```bash
npm run build
```

After building, reload the extension on `chrome://extensions/` by clicking the 🔄 refresh icon.

### Watch mode (auto-rebuild on save)
```bash
npm run dev
```

---

## 📁 Project Structure

```
Browser_Task_Tracker/
├── public/
│   └── manifest.json         # Chrome Extension Manifest v3
├── src/
│   ├── background/
│   │   └── index.js          # Background service worker (tracking logic)
│   ├── content/
│   │   ├── index.jsx         # Content script entry (mounts floating widget)
│   │   └── Widget.jsx        # Floating timer component
│   └── dashboard/
│       ├── index.jsx         # New Tab page entry
│       ├── App.jsx           # Dashboard React component
│       └── index.css         # Dashboard styles
├── index.html                # New Tab HTML shell
├── vite.config.js            # Vite build config
└── package.json
```

---

## 🔧 Default Tracked Sites

- `neetcode.io`
- `deeplearning.ai`
- `leetcode.com`

These are stored in `chrome.storage.local` on first install and can be modified.
