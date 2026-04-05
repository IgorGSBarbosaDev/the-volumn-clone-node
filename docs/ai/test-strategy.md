# The Volumn Test Strategy

## Required Test Layers

- contract tests
  - shared schemas and inferred types
- backend integration tests
  - route behavior, cookie behavior, ownership, health
- backend regression tests
  - auth, student cap, PR logic, session completion
- frontend tests
  - services, route orchestration, feature hooks, stores

## Minimum Expectation By Domain

- `auth`
  - register, login, refresh rotation, logout invalidation
- `users`
  - `GET /users/me`, `PATCH /users/me`
- `workout-plans`
  - plan CRUD, reorder, plan sets, ownership, student cap
- `exercises`
  - catalog list/filter/search, custom exercise creation, private history access
- `sessions`
  - session start, set logging, completion, PR storage, history behavior
