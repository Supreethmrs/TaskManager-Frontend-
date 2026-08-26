# Task Manager — Frontend

A React + TypeScript single-page app for managing tasks, built as a learning project focused on automation testing (E2E, API, CI/CD).

## Tech Stack
- **React 18** — UI library
- **TypeScript** — type safety
- **Vite** — build tool and dev server
- **react-router-dom** — client-side routing with protected routes
- **Plain CSS** (per-component, e.g. `Dashboard.css`, `Login.css`) — no CSS framework
- **Fetch API** — communicating with the backend (no axios or other HTTP library)

## Features
- User signup and login (JWT-based auth)
- Persistent login across page refreshes (token stored in `localStorage`)
- Protected routing — `/dashboard` redirects to `/login` if not authenticated
- Full task management: create, view, edit, delete, mark complete
- Category tagging (Work / Personal / Urgent), pulled from the real backend
- Three dashboard views: List, Cards, and Table (with sortable columns)
- Live dashboard stats (total, active, completed, urgent) calculated from real data

## Project Structure
src/
App.tsx — routing and top-level state
Login.tsx — login page
Signup.tsx — signup page
Dashboard.tsx — main task dashboard (all 3 views)
Login.css — shared styling for Login/Signup
Dashboard.css — Dashboard-specific styling


## Setup
1. Clone this repo
2. Run `npm install`
3. Make sure the backend is running locally at `http://localhost:3000` (see [backend repo](https://github.com/Supreethmrs/TaskManager))
4. Run `npm run dev`
5. Open `http://localhost:5173`

## Routes
| Path         | Page       | Access                          |
|--------------|------------|----------------------------------|
| `/login`     | Login      | Public                          |
| `/signup`    | Signup     | Public                          |
| `/dashboard` | Dashboard  | Requires valid token, else redirects to `/login` |

## Backend
This frontend depends on a separate Express + Prisma + PostgreSQL (Neon) backend. See that repo for API details.

## Author
Built by Supreeth as a learning project focused on automation testing.