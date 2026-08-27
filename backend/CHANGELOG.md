# Backend Changelog

All notable changes to the TaskForge backend are documented here.

## [2.0.0] - 2026-08-27
### Added
- **Symmetric XP Reversal (`lastXpAwarded`)**:
  - Saved `lastXpAwarded` to `Task` database model on completion (`POST /api/tasks/:id/complete`).
  - Unchecking a task reads back `task.lastXpAwarded ?? xpAward` to guarantee exact deduction and prevent deadline-drift XP errors.
  - Returned `xpGained` delta in `res.json` accurately reflects the exact amount awarded or deducted.
- **Prisma 7 Driver Adapter**:
  - Configured `@prisma/adapter-pg` with Neon Serverless PostgreSQL client.
- **Kanban Quick-Status Endpoint**:
  - `PUT /api/tasks/:id/kanban` to update column statuses (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`).
- **Smart Recurrence Engine**:
  - Automatic calculation of next recurring due date (`calculateNextRecurrenceDate`) and auto-spawning of next task occurrence on completion for `DAILY`, `WEEKDAYS`, `WEEKLY`, and `MONTHLY` rules.
- **Trophy Vault & Achievements API**:
  - `GET /api/achievements` computes unlock status, badge progress, and user stats for milestones (`Initiation Rite`, `Speed Demon`, `Streak Master`, `Quest Centurion`, `Cyber Overlord`).
- **Command Center Analytics Engine**:
  - `GET /api/analytics` computes 7-day velocity chart data, category breakdown, priority distribution, and on-time completion percentage.

## [1.0.0] - 2026-08-26
### Added
- **Gamified Task Completion API**:
  - `POST /api/tasks/:id/complete` endpoint with dynamic XP awards based on priority (+150 Critical, +100 High, +50 Medium, +30 Low) and +25 on-time bonus.
  - Automatic level calculation (`Math.floor(xp / 500) + 1`) and level-up detection.
  - Streak tracking with 1-increment-per-day protection and zero-reset fallback.
- **User Profile API**:
  - `GET /api/user/profile` returning XP, level, next level threshold, streak count, and timestamp.
- **Sub-task Steps API**:
  - `POST /api/tasks/:id/steps`, `PUT /api/tasks/:id/steps/:stepId`, and `DELETE /api/tasks/:id/steps/:stepId`.

## [0.2.0] - 2026-08-21
### Added
- Login endpoint (`POST /api/login`) — verifies credentials and returns a JWT token.
- Password comparison using bcrypt.

## [0.1.0] - 2026-08-19
### Added
- Initial Express server setup.
- Neon PostgreSQL database connected via Prisma.
- User and Task models with a one-to-many relationship.
- Signup endpoint (`POST /api/signup`) — hashes password, creates user.