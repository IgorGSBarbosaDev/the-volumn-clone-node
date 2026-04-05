# The Volumn Change Impact Matrix

## Contract Change

Update:

- `shared`
- backend validation and route handlers
- frontend services and affected features
- `docs/api/openapi.yaml`
- affected `AGENTS.md`

## Auth Or Ownership Change

Update:

- `backend/src/modules/auth`
- affected backend modules
- `frontend/src/features/auth`
- `frontend/src/services/auth-service.ts`
- regression tests first

## Workout Plan Change

Update:

- `backend/src/modules/workout-plans`
- `frontend/src/features/workout-plans`
- `shared`
- `docs/api/openapi.yaml`
- ownership and student-cap tests

## Session Or PR Change

Update:

- `backend/src/modules/sessions`
- `frontend/src/features/sessions`
- `frontend/src/features/history`
- `shared`
- `docs/api/openapi.yaml`
- PR and session-flow tests
