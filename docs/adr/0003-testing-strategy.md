# ADR 0003: Testing Strategy

## Status

Accepted

## Decision

The repository uses test-first by default and keeps verification split by responsibility:

- `shared`: contract and schema tests
- `backend/tests/contract`: contract alignment and route-shape tests
- `backend/tests/integration`: HTTP and cross-module integration tests
- `frontend`: route, feature, service, and store tests

Protected regression areas:

- auth
- ownership
- student five-plan cap
- PR logic
- session completion

## Rationale

- The migration changes the backend stack and repo structure at the same time.
- Regression-sensitive business rules need explicit tests independent of transport and UI changes.
