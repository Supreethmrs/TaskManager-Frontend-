# Changelog

All notable changes to this project are documented here.

## [Unreleased]

## [0.2.0] - 2026-08-21
### Added
- Login endpoint (`POST /api/login`) — verifies credentials and returns a JWT token
- Password comparison using bcrypt

## [0.1.0] - 2026-08-19
### Added
- Initial Express server setup
- Neon PostgreSQL database connected via Prisma
- User and Task models with a one-to-many relationship
- Signup endpoint (`POST /api/signup`) — hashes password, creates user