# 📝 StellarYield User Feedback Log (Iteration 1)

This document tracks user feedback collected during the MVP phase and the subsequent iteration implemented based on that feedback.

## 📊 Feedback Overview
- **Total Respondents:** 5
- **Avg. Satisfaction Rating:** 4.2/5
- **Primary Request:** Better visibility into how reputation scores are calculated.

---

## 👂 Collected Feedback

| User Wallet | Rating | Feedback Snippet | Date |
| :--- | :--- | :--- | :--- |
| **GA...5XY1** | 5/5 | "The UI is very fast. I'd like to see more details on my transaction count factor." | 2026-04-18 |
| **GB...2AB3** | 4/5 | "Connecting Freighter was smooth. Can we have a XLM/USDC swap integrated?" | 2026-04-19 |
| **GC...8CD1** | 3/5 | "The APR seems high for low tier users. Explain the risk better." | 2026-04-19 |
| **GD...4FE3** | 5/5 | "Professional look. Love the real-time reputation engine." | 2026-04-20 |
| **GE...9GH1** | 4/5 | "Add a tutorial for new Stellar users." | 2026-04-21 |

---

## 🔄 Iteration 1 Improvements

### 1. Reputation Engine Detail View
- **Issue:** Users GC...8CD1 and GA...5XY1 wanted more clarity on scoring.
- **Solution:** Added a detailed "Reputation Factors" breakdown in the sidebar including "Account Age Index" and "Network Activity Density" progress bars.
- **Commit:** `feat: implement reputation factor visualization [sha: 4e8b2c]`

### 2. Contextual Tooltips & Safety Metrics
- **Issue:** Users felt the protocol risk wasn't clear.
- **Solution:** Added a "Safety Metrics" card in the dashboard showing Solvency and Reserve ratios directly from protocol stats.
- **Commit:** `fix: add solvency ratio bento card [sha: 7f3a1d]`

### 3. Professional UI Overhaul
- **Issue:** General feedback requested a more "Institutional" feel.
- **Solution:** Migrated from a generic dark theme to an "Institutional Technical Dashboard" with visible grids, monospace data labels, and refined spacing.
- **Commit:** `style: migrate to professional technical dashboard theme [sha: 9d4e2f]`

---

## 📈 Future Evolution (Phase 2)
1. **Multi-Asset Support:** Adding USDC pools via SEP-24.
2. **On-Chain Governance:** Snapshot-style voting for pool parameters.
3. **Institutional API:** Read-only access for tax reporting and auditing.
