# 🚀 Proximity Networking Assistant (Google Sheets + AI Engine)

An automated, humanized LinkedIn proximity networking engine designed for Data Science & Quantitative Engineering professionals.

---

## 📌 Features
- **Deterministic Asset Routing**: Matches target profiles to domain-specific portfolio projects:
  - *Predictive Maintenance RUL Copilot (CNN-Transformer)* for IoT / industrial telemetry.
  - *Mathematical Optimization (LP/MILP)* for supply chain / operations research.
  - *Interactive Data Applications (Streamlit)* for software / product / frontend analytics.
  - *Chennai Mathematical Institute (CMI) Foundation* as core quantitative anchor.
- **Human-Centric Warmth**: Eliminates robotic templates; drafts respectful, gratitude-focused outreach messages (< 50 words).
- **Google Sheets Integration**: Custom UI menu and in-sheet buttons via Google Apps Script (`code.gs`).
- **Antigravity Live Daemon**: Autonomous background sync daemon (`sheet_daemon.py`) for real-time bidirectional generation without API rate limit bottlenecks.

---

## 🛠️ Project Structure
- `code.gs`: Google Apps Script engine with custom menus, routing matrix, and Web App REST API (`doGet` / `doPost`).
- `sheet_daemon.py`: Autonomous Python background worker polling and syncing sheet updates.
- `sheet_sync.py`: Python CLI tool for inspecting and updating the Google Sheet.
- `setup_guide.md`: Complete step-by-step deployment guide.
- `spec_v0.md`: Core system specifications, tiers, and asset mapping rules.
- `verifier_v0.md`: QA automated test scenarios and acceptance criteria.
