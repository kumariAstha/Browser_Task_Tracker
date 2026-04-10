# 🎓 Learning Tracker

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-v3-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
<!-- [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT) -->

![Learning Tracker Hero](./assets/hero.png)

**Learning Tracker** is a premium Manifest V3 Chrome extension designed to transform your learning habits. It replaces your default new tab with a minimalist, high-performance productivity dashboard and automatically tracks time spent on educational platforms like LeetCode, NeetCode, and DeepLearning.AI.

Link to the project: https://www.youtube.com/watch?v=Wzcui6H8McE
---

## ✨ Features

- ⏱️ **Intelligent Time Tracking** — Automatically monitors active sessions on educational sites. Pauses when you're idle or switch tabs.
- 🏠 **Ambient Dashboard** — A beautiful "New Tab" replacement featuring a live clock, dynamic motivational quotes, and a sleek search interface.
- 📊 **Deep Analytics** — Visualize your learning progress with interactive Area Charts. View usage patterns across 7 days, 30 days, or your entire history.
- 🔥 **Streak System** — Stay motivated with streak tracking. Set daily learning goals and maintain your momentum.
- 🔴 **Live Floating Widget** — A glassy, non-intrusive timer that appears on tracked sites to keep you focused in real-time.
- 🔗 **Smart Shortcuts** — Quickly access your most-visited sites or add custom shortcuts directly from the homepage.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- Google Chrome or any Chromium-based browser

### Installation & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/learning-tracker.git
   cd learning-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Load into Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** (top-right toggle).
   - Click **Load unpacked**.
   - Select the **`dist`** folder generated in the project root.

---

## 🛠️ Project Structure

```text
.
├── assets/               # Branding and README assets
├── public/
│   └── manifest.json     # Extension configuration (MV3)
├── src/
│   ├── background/       # Service worker for session tracking
│   ├── content/          # Scripts injected into tracked pages (Floating Widget)
│   ├── dashboard/        # React source for the New Tab dashboard
│   │   ├── App.jsx       # Main Dashboard UI & Logic
│   │   └── index.css     # Premium styling & animations
│   └── components/       # Shared UI components
├── index.html            # Dashboard entry point
└── vite.config.js        # Build configuration
```

---

## 🎨 Default Tracked Sites

Out of the box, the tracker supports:
- `neetcode.io`
- `deeplearning.ai`

*You can easily add or remove sites and set custom daily goals via the **Settings** menu in the dashboard.*

---

## 🤝 Contributing

Contributions are welcome! If you have a feature request or bug report, please open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`msg: Add AmazingFeature`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<!-- ## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

--- -->

<p align="center">
  Built with ❤️ for lifelong learners.
</p>
