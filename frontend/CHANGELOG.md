# Frontend Changelog

All notable changes to the TaskForge frontend are documented here.

## [2.0.0] - 2026-08-27
### Added
- **Global Command Palette (`Ctrl + K` / `Cmd + K`)**:
  - Quick action launcher for searching missions, switching views, changing themes, toggling focus mode, and filtering categories.
- **Interactive Drag-and-Drop Kanban Board (`KanbanBoard.tsx`)**:
  - 4-column layout (`TO-DO`, `IN PROGRESS`, `IN REVIEW`, `CLEARED`) with HTML5 drag-and-drop and instant backend sync.
- **Smart AI Quest Breakdown (`TaskHelpers.ts`)**:
  - `⚡ AI Breakdown` button in Add/Edit Task modal that automatically parses titles to generate checklist sub-tasks, duration estimates, and suggested priorities.
- **Procedural Ambient Audio Synthesizer (`AmbientAudio.ts`)**:
  - Web Audio API generative soundscapes inside the Focus Clock: *Cyber Rain*, *Deep Space (432Hz)*, *Neo-Tokyo Cafe*, and *Synthwave Chill* with volume controls.
- **Trophy Vault Modal (`AchievementsModal.tsx`)**:
  - Visual gallery of milestone achievement badges with live progress bars and player ranking stats.
- **1-Click Export Suite (`TaskHelpers.ts`)**:
  - Export tasks to **CSV Spreadsheet**, **Markdown Mission Report**, or **JSON Backup**.
- **Recurring Task Support**:
  - Recurrence selector (`DAILY`, `WEEKDAYS`, `WEEKLY`, `MONTHLY`) with automatic next occurrence generation.

### Fixed & Improved
- **Minute-Level Overdue Precision**:
  - Fixed overdue duration calculation (`getOverdueDuration`) to display exact minutes (`5m Late`, `18m Late`) under 1 hour instead of rounding up to `1h Late`.
  - Added 60-second grace window to `isOverdue` to prevent false overdue alerts on newly created tasks.
  - Add Quest modal now automatically defaults time to current local time instead of 09:00 AM.
  - Wrapped Table view overdue status in mini interactive pill with hover roast popovers.

## [1.0.0] - 2026-08-26
### Added
- **4 Gen-Z Cyberpunk Themes (`ThemePicker.tsx`, `index.css`)**:
  - `acid-glitch` 🧪 (Acid Lime `#ccff00` / Electric Cyan)
  - `neon-tokyo` 🌆 (Hot Magenta `#ff007f` / Cyber Purple)
  - `brat-charcoal` 🍏 (Brat Green `#8ace00` / Chrome Silver)
  - `dreamcore-y2k` 🌸 (Barbie Pink `#ff2a85` / Pastel Sky Blue)
  - Swatch discs with live hover previews and `localStorage` persistence.
- **Gamification Player HUD (`PlayerHud.tsx`)**:
  - Real-time XP display, dynamic level progression bar (500 XP thresholds), and flame streak badge.
  - Floating `+50 XP` and red `-50 XP` feedback tags on task completion and undo.
  - Confetti burst animation on completing quests.
- **Cyber Focus Clock (`PomodoroTimer.tsx`)**:
  - Circular SVG progress dial, preset buttons (`15m`, `25m Focus`, `45m Deep Work`, `60m`, `5m Break`), quick `+5m`/`-5m` adjustments, and custom minute input.
- **Sub-task Checklist Drawer**:
  - Expandable drawer in List view with inline step addition, progress bar, and completion checkboxes.
- **Funny Overdue Roasts & Chrono Capsule**:
  - Futurism-inspired date/month/time capsule tiles and humorous gaming roasts in hover popovers.

## [0.5.1] - 2026-08-24
### Fixed
- Due date input was incorrectly behaving like a datetime picker — updated to strict date-only input.
- Clear error message for past dates and min attribute restriction.
- Fixed timezone offset conversion preventing date shifts.

## [0.5.0] - 2026-08-24
### Added
- Due date field for tasks with calendar-block visual layout in List view.
- Overdue highlighting (red accent) and "due today" highlighting (amber accent).

## [0.4.0] - 2026-08-22
### Added
- React Router configuration with `/login`, `/signup`, and protected `/dashboard`.

## [0.3.0] - 2026-08-22
### Added
- Category support fully wired end-to-end.

## [0.2.0] - 2026-08-22
### Added
- Dashboard view switching (List, Cards, Table), real CRUD API wiring, and JWT authentication.

## [0.1.0] - 2026-08-19
### Added
- Initial Vite + React + TypeScript scaffold.