# ⚡ TaskForge HQ — Master Changelog

All notable changes across the TaskForge HQ application (Frontend & Backend) are documented in this file.

---

## [2.0.0] - 2026-08-27 (Power Suite & Polish Release)

### 🚀 Core Power Features Added
- **Global Command Palette (`Ctrl + K` / `Cmd + K`)**: Instant keyboard search, theme selector, and action launcher.
- **Drag-and-Drop Kanban Board View**: 4 workflow stages (`To-Do`, `In Progress`, `In Review`, `Cleared`) with smooth HTML5 drag-and-drop and instant DB sync.
- **AI Quest Decomposer**: One-click checklist sub-task breakdown with intelligent priority and duration suggestions in the task modal.
- **Procedural Ambient Audio Synthesizer**: Web Audio API focus soundscapes (*Cyber Rain*, *Deep Space 432Hz*, *Neo-Tokyo Cafe*, *Synthwave Chill*) embedded in the Focus Clock.
- **Smart Recurring Quests**: Auto-respawns the next occurrence upon completing daily, weekday, weekly, or monthly missions.
- **Trophy Vault & Badges**: Unlockable milestone trophy showcase with live progress bars and player ranks.
- **1-Click Export Suite**: Export to **CSV Spreadsheet**, **Markdown Report**, or **JSON Backup**.

### 🛠️ Backend & Gamification Engine Enhancements
- **Symmetric XP Reversal (`lastXpAwarded`)**:
  - Saved `lastXpAwarded` upon completion to guarantee exact XP deduction on unchecking tasks, preventing deadline-drift errors.
  - Returned `xpGained` delta in `res.json` accurately reflects the exact amount awarded or deducted.
- **Prisma 7 Driver Adapter Integration**: Configured `@prisma/adapter-pg` with Neon PostgreSQL.
- **Analytics API**: Computes 7-day velocity chart, category breakdown, priority distribution, and on-time completion percentage.

### 🐛 Bug Fixes & Precision Improvements
- **Minute-Level Overdue Precision**: Fixed overdue calculation to display exact minutes (`5m Late`, `18m Late`) under 1 hour instead of forcing `1h Late`.
- **60-Second Grace Buffer**: Tasks scheduled for the current minute remain in active `TODAY` status without premature overdue alerts.
- **Smart Modal Time Defaults**: Task modal auto-fills with today's date and the current local time.
- **Interactive Roast Popovers**: Overdue tasks display gaming roasts inside hover popovers in List and Table views.

---

## [1.0.0] - 2026-08-26 (Gen-Z Redesign & Gamification Release)

### 🎨 Theming & Aesthetics
- **4 Gen-Z Cyberpunk Themes**:
  - `acid-glitch` 🧪 (Acid Lime / Glitch Void)
  - `neon-tokyo` 🌆 (Hot Magenta / Cyber Purple)
  - `brat-charcoal` 🍏 (Brat Green / Chrome Silver)
  - `dreamcore-y2k` 🌸 (Barbie Pink / Pastel Sky Blue)
- Swatch discs with live hover previews and `localStorage` persistence.

### 🎮 Gamification Engine
- **Player HUD**: Real-time XP display, dynamic level progression bar (500 XP thresholds), and flame streak badge.
- **Priority-Tiered XP**: +150 XP (Critical), +100 XP (High), +50 XP (Medium), +30 XP (Low), +25 XP (On-time bonus).
- Floating `+50 XP` and red `-50 XP` feedback tags on completion and undo.
- Confetti burst animation on completing quests.

### ⏱️ Focus Clock & Chrono Capsule
- **Cyber Focus Clock**: Circular SVG progress dial, preset buttons (`15m`, `25m Focus`, `45m Deep Work`, `60m`, `5m Break`), quick `+5m`/`-5m` adjustments, and custom minute input.
- **Chrono Capsule HUD**: Calendar tiles displaying uppercase Month, large Day digits, and time badge in List view.

---

## [0.5.0] - 2026-08-24 (Due Dates & Visual Polish)
- Due date field with calendar-block visual layout in List view.
- Overdue and due-today status highlighting.
- Strict date-only picker and past date validation.

---

## [0.4.0] - 2026-08-22 (Full Routing & Auth)
- React Router integration with `/login`, `/signup`, and protected `/dashboard`.
- JWT authentication with protected routes and auto-redirect.

---

## [0.3.0] - 2026-08-22 (Category Management)
- Category support fully wired end-to-end (dropdown → backend → database → dashboard display).

---

## [0.2.0] - 2026-08-21 (Interactive Dashboard & Auth API)
- Dashboard view switching (List, Cards, Table), real CRUD API wiring, and JWT authentication.
- Password hashing with bcrypt.

---

## [0.1.0] - 2026-08-19 (Initial Scaffold)
- Initial React + TypeScript (Vite) frontend and Express.js backend connected to Neon PostgreSQL via Prisma.
