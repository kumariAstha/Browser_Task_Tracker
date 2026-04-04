# Implementation Checklist

- [x] Install `recharts` for data visualization
- [x] Fix Timer Logic (`background/index.js`)
  - [x] Implement `lastSavedTime` so `sessionStartTime` isn't overwritten purely for storage sync
  - [x] Only reset `sessionStartTime` if the active domain *actually* changes
- [x] Upgrade Dashboard CSS (`dashboard/index.css`)
  - [x] Remove hardcoded max-width constraints
  - [x] Make the flex/grid stretch across the screen
- [x] Update Storage Schema and App Logic (`dashboard/App.jsx`)
  - [x] Add ability to configure streak goals (minutes) per website
  - [x] Process historical `trackingData` to calculate individual streaks based on the sites' goals
  - [x] Render per-site usage charts (past 7 days) using `recharts`
- [x] Test the extension completely
