# ADR 0001: Node Backend Architecture

## Status

Accepted

## Decision

The backend will be implemented as a Node.js + TypeScript modular monolith.

The structure is module-first:

- `modules/auth`
- `modules/users`
- `modules/workout-plans`
- `modules/exercises`
- `modules/sessions`

Cross-cutting code stays thin:

- `src/app` for Express app bootstrap and route registration
- `src/config` for environment, database, and logger setup
- `src/shared` for HTTP helpers, cross-module domain utilities, and small library helpers
- `prisma` for persistence schema, migrations, and seeds

## Rationale

- The repository has no real backend code to preserve.
- A module-first structure fits the product better than recreating global `Api/Application/Domain/Infrastructure` directories.
- It keeps feature ownership explicit while still supporting pragmatic Clean Architecture boundaries inside each module.
