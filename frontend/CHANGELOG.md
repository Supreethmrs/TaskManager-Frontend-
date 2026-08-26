# Changelog
## [0.5.1] - 2026-08-24
### Fixed
- Due date input was incorrectly behaving like a datetime picker, asking for a time value when only a date was needed — now uses a strict date-only input
- Selecting a past date was silently blocked with no explanation — now shows a clear "Due date cannot be in the past" error message, and the date picker itself visually disables past dates using a min attribute
- Fixed a potential timezone conversion bug where dates could shift by one day when converting between the backend's ISO format and the HTML date input's format

## [0.5.0] - 2026-08-24
### Added
- Due date field for tasks, with a distinctive calendar-block visual layout (day/month tile) in List view
- Overdue highlighting (red accent) and "due today" highlighting (amber accent)
- Date validation: due dates cannot be set in the past, with a clear error message
### Fixed
- Fixed a bug where the date picker unexpectedly requested a time value instead of just a date
- Fixed a bug where past dates were silently blocked with no explanation
### Changed
- Re-themed the entire app to a true-black background with neon red accents, applied selectively (buttons, active states, focus states) rather than uniformly, to preserve visual hierarchy

All notable changes to this project are documented here.

## [0.4.0] - 2026-08-22
### Added
- react-router-dom installed and configured
- Real URL-based routing: `/login`, `/signup`, `/dashboard`
- Protected route logic: `/dashboard` redirects unauthenticated users to `/login`
### Fixed
- Previously, pasting or bookmarking any URL always showed the Dashboard regardless of login state, since the app had no real routing (just a `view` state variable). This is now fixed.

## [0.3.0] - 2026-08-22
### Added
- Category support fully wired end-to-end (dropdown → backend → database → dashboard display)
### Fixed
- Task editing wasn't updating the category shown on the dashboard, because the backend's PUT /api/tasks/:id endpoint was an outdated version missing the category lookup and `include: { category: true }`. Rewrote the endpoint to match the POST/GET endpoints.

## [0.2.0] - 2026-08-22
### Added
- Dashboard.tsx (built with Gemini, then wired to the real backend):
  - Fetches real tasks on page load (GET /api/tasks)
  - Create, edit, delete, and toggle-complete all call real backend endpoints
  - List / Cards / Table view switching
  - Live stats (total, active, completed, urgent)
- Login.tsx and Signup.tsx (built with Gemini, then wired to the real backend):
  - Both now call the real /api/login and /api/signup endpoints instead of only logging to console
  - JWT token saved to localStorage on successful login

## [0.1.0] - 2026-08-19
### Added
- Initial Vite + React + TypeScript project scaffolded
- Basic project structure established