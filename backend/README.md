# Task Manager — Backend

A REST API backend for a task management app, built as a learning project focused on automation testing (API, E2E, CI/CD).

## Tech Stack
- Node.js + Express
- PostgreSQL (hosted on Neon)
- Prisma ORM
- bcrypt (password hashing)
- JWT (authentication)

## Features
- User signup
- User login (JWT-based auth)
- (More coming: task CRUD endpoints)

## Setup
1. Clone this repo
2. Run `npm install`
3. Create a `.env` file with:
4. Run `npx prisma generate`
5. Run `npx tsx server.js`

## API Endpoints
| Method | Endpoint       | Description           |
|--------|----------------|------------------------|
| POST   | /api/signup    | Create a new user      |
| POST   | /api/login     | Log in, returns a JWT  |

## Author
Built by Supreeth as a learning project.