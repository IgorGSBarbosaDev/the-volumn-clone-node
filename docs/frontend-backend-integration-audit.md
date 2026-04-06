# Frontend-Backend Integration Audit

## Summary

This document captures the current repository state before replacing prototype/demo frontend behavior with real backend-connected flows.

Primary source of truth:

1. `PRD_V2.md`
2. `docs/ai/domain-invariants.md`

Supporting context:

- `backend/backend-requirements-spec.md`
- `shared/src/contracts/*`
- `docs/api/openapi.yaml`
- current frontend and backend implementation

Confirmed baseline facts:

- Frontend routes exist for `/`, `/login`, `/home`, `/workout`, `/history`, and `/profile`.
- Most frontend product behavior is currently static, hardcoded, or local-state only.
- Backend implementation is split:
  - implemented: `GET /health`, auth flows, `GET /users/me`, `PATCH /users/me`
  - scaffolded with `501 NOT_IMPLEMENTED`: workout plans, plan sets, exercises, sessions
- Shared contracts already define most auth, user, workout-plan, exercise, and session request/response schemas.
- Shared contracts do not yet define the dashboard/profile/history aggregate read models implied by the current UI.
- Current tests and typecheck pass, but frontend tests mostly verify static rendering and local-state behavior, not real backend integration.

## Frontend Audit

### Current route inventory

| Route | Current state | Real backend dependency today | Fake/static/local behavior |
| --- | --- | --- | --- |
| `/` | Marketing landing page | None required for page render | CTA buttons are visual only; all metrics and sample workout content are hardcoded |
| `/login` | Visual login screen | Auth services exist but are unused by the page | Form uses local state only, submit is blocked with `preventDefault()`, demo credentials are prefilled, no auth bootstrap, no route transition |
| `/home` | Dashboard shell | None wired | Calendar, KPIs, recommended plans, recent sessions, and volume chart are fully hardcoded |
| `/workout` | Workout list plus one local detail view | None wired | Plan list is hardcoded, only "Push" opens a detail state, start actions are inert, no CRUD or real session flow |
| `/history` | Session history list shell | None wired | History list is hardcoded, search is inert, calendar button is inert, no detail drill-down |
| `/profile` | Profile/settings shell | `GET /users/me`, `PATCH /users/me`, and logout service exist but are unused by the page | User identity and stats are hardcoded, logout button is inert, theme is local-only, settings rows are placeholders |

### App/runtime state

- `frontend/src/app/app-root.tsx` mounts all routes directly with no distinction between public and private routes.
- There is no auth bootstrap on app load.
- There is no in-memory access-token lifecycle.
- There is no centralized refresh retry flow in the frontend.
- There is no route guard for authenticated screens.
- React Query is configured globally, but route screens do not use it for real product data.

### Frontend feature/module state

- Existing feature hooks:
  - `frontend/src/features/auth/use-login.ts`
  - `frontend/src/features/auth/use-current-user.ts`
  - `frontend/src/features/users/use-update-profile.ts`
- Existing services:
  - `frontend/src/services/auth-service.ts`
  - `frontend/src/services/users-service.ts`
  - `frontend/src/services/health-service.ts`
- Empty domain feature areas:
  - `frontend/src/features/workout-plans`
  - `frontend/src/features/exercises`
  - `frontend/src/features/sessions`
  - `frontend/src/features/history`

### Theme handling

- Theme switching is currently driven by Zustand in `frontend/src/store/theme-store.ts`.
- Theme preference is persisted only to `localStorage`.
- This conflicts with the PRD requirement that the authenticated user can update their own theme preference server-side.

## PRD vs Frontend Gap Analysis

### PRD-required capabilities already represented somewhere in the repo

- auth/register/login/logout/refresh contracts exist in `shared`
- current-user read/update contracts exist in `shared`
- workout-plan, exercise, and session contracts exist in `shared`
- auth and `users/me` backend endpoints are implemented

### PRD-required capabilities missing from the frontend implementation

- Registration screen and registration flow
- Authenticated route protection
- App startup auth bootstrap using refresh-cookie rehydration
- Real login submission and post-login session handling
- Workout plan list backed by backend data
- Workout plan create flow
- Workout plan edit/update flow
- Workout plan delete flow
- Plan composition flow:
  - add exercise to plan
  - remove exercise from plan
  - reorder plan exercises
  - add planned sets
  - update planned sets
  - delete planned sets
- Exercise browsing flow:
  - search by name
  - filter by muscle group
  - create custom exercise
- Active workout session screen
- Performed-set logging flow
- Session completion flow
- Real history browsing from persisted sessions
- Exercise history review flow
- Profile edit flow for display name
- Real logout action

### Screens that need to be created

The current route set is insufficient to satisfy the PRD. At minimum, these screens or route-level flows still need to be introduced:

- Register screen
- Workout plan editor/composer screen
- Active session logger screen
- Profile edit flow or dedicated profile-edit screen
- Session detail and/or exercise detail view if needed by the chosen history UX

### Existing screens that must be converted from prototype to real flow

- `/login`
- `/home`
- `/workout`
- `/history`
- `/profile`

### Visible placeholders that must stay inert in V0.1

These appear in the UI but are outside PRD V0.1 scope and must not silently become implementation commitments:

- Avatar editing
- Connected Apps
- Export Data
- Performance Hub / advanced analytics

## Mocked/Fake Data Inventory

### Static data sources by file

| File | Hardcoded/static data |
| --- | --- |
| `frontend/src/pages/landing-page.tsx` | ticker items, marketing stat cards, feature cards, process steps, analytics KPIs, weekly volume bars, sample workout device preview |
| `frontend/src/pages/login-page.tsx` | `DEMO_EMAIL`, `DEMO_PASSWORD`, default form state |
| `frontend/src/pages/home-page.tsx` | calendar day grid, recommended plans, recent sessions, weekly KPIs, volume bars, month labels, fixed date text |
| `frontend/src/pages/workout-page.tsx` | `workoutPlans`, `pushWorkout`, hardcoded exercise names, hardcoded planned set labels, fixed duration and totals |
| `frontend/src/pages/history-page.tsx` | `workoutHistory`, `visibleHistory`, hardcoded date labels, durations, set counts, and volumes |
| `frontend/src/pages/profile-page.tsx` | user name, email, training meta, total sessions, PR count, settings items, version label |

### Fake or inert flows by file

| File | Fake/inert flow |
| --- | --- |
| `frontend/src/pages/landing-page.tsx` | CTA buttons have no navigation or mutation behavior |
| `frontend/src/pages/login-page.tsx` | Form submit uses `preventDefault()`, no mutation hook is called, demo credentials button only resets local state |
| `frontend/src/pages/home-page.tsx` | action buttons and dashboard cards do not query or mutate anything |
| `frontend/src/pages/workout-page.tsx` | page behavior is driven by local `selectedWorkout` state instead of route params or backend data |
| `frontend/src/pages/history-page.tsx` | search field does not filter or query, calendar button does nothing, cards do not open detail |
| `frontend/src/pages/profile-page.tsx` | logout button is inert, settings buttons are placeholders, avatar edit is inert |

### Frontend testing reality

- Page tests currently verify static Figma-aligned rendering and local interactions.
- They do not verify:
  - real login/logout
  - refresh/bootstrap behavior
  - protected-route behavior
  - plan/session/history fetching
  - mutation success/error handling
  - backend contract integration

## Required Backend Integration Mapping

### Integration status matrix

| Frontend surface | Backend/shared dependency | Status | Notes |
| --- | --- | --- | --- |
| `/login` | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /users/me` | Contract exists; backend partly available; frontend not wired | Login/refresh/logout/users endpoints exist, but the page does not use them and no auth runtime exists |
| Register flow | `POST /auth/register` | Contract exists; backend available; frontend missing | Service exists, but there is no register screen or feature flow |
| Protected app routes | access-token handling plus refresh rehydration | Contract exists; frontend not wired | Needs centralized auth runtime in `frontend/src/app` and `frontend/src/services` |
| `/profile` identity/theme | `GET /users/me`, `PATCH /users/me` | Backend available; frontend not wired | Existing page ignores live user data and server-backed theme |
| `/profile` stats | new profile stats read model | Backend missing or contract unresolved | Current UI shows total sessions and PR count, but no shared contract or endpoint provides them |
| `/workout` plan list/detail | `GET /workout-plans`, `GET /workout-plans/:id` | Contract exists; backend missing | Routes are scaffolded only |
| Workout plan create/edit/delete | `POST/PATCH/DELETE /workout-plans` | Contract exists; backend missing | Required by PRD |
| Plan composition | plan exercises + plan sets endpoints | Contract exists; backend missing | Required by PRD and needed for real plan authoring |
| Exercise picker/catalog | `GET /exercises`, `POST /exercises` | Contract exists; backend missing | Needed for searchable plan composition |
| Start session | `POST /sessions` | Contract exists; backend missing | Needed from workout detail/start action |
| Active session logging | `POST /sessions/:id/sets`, `PATCH /sessions/:id/complete` | Contract exists; backend missing | Also needs frontend screen and likely session-detail read support |
| `/history` session list | `GET /sessions` | Contract exists; backend missing | Current history screen is static |
| Exercise history review | `GET /exercises/:id/history` | Contract exists; backend missing | Required by PRD |
| `/home` dashboard data | aggregate dashboard read model | Backend missing or contract unresolved | Current UI implies recent sessions, volume trend, monthly counts, and recommended plans |

### Required frontend integration decisions

- Store the access token in memory, not in persistent browser storage.
- Rehydrate authenticated state by calling `POST /auth/refresh` using the HttpOnly refresh cookie.
- Never store refresh tokens in `localStorage`.
- Centralize `Authorization` header injection and refresh retry behavior inside `frontend/src/services`.
- Protect private routes in `frontend/src/app`.
- Keep API calls in services and workflow logic in feature hooks, not directly in pages.

### API needs that remain unresolved before implementation

- Dashboard aggregate read model
- Profile stats read model
- Session detail read model
- Active-session recovery read model
- History search/filter contract
- Workout-plan summary aggregates used by the current cards:
  - muscle-group tags
  - total sets / work sets
  - duration-like display data

These should not be invented ad hoc during implementation. They must be formalized intentionally in `shared`, backend consumers, frontend consumers, and `docs/api/openapi.yaml`.

## Repo-Wide Change Map

### `frontend`

Required work:

- Add auth runtime:
  - access-token storage in memory
  - refresh-cookie bootstrap
  - protected routes
  - logout handling
- Add missing services and feature hooks for:
  - workout plans
  - exercises
  - sessions
  - history
- Replace page-local hardcoded data with query-backed data
- Add mutation-driven flows for:
  - login
  - registration
  - profile update
  - workout-plan CRUD
  - plan composition
  - session logging/completion
- Add the missing PRD-required screens and route flows
- Preserve the current design and styling unless a real workflow requires a small targeted UI addition

### `backend`

Required work:

- Implement workout-plans module
- Implement plan-sets module behavior
- Implement exercises module
- Implement sessions module
- Enforce business rules server-side:
  - ownership checks
  - student five-plan cap
  - one active session per user
  - append-only session sets
  - immutable completed sessions
  - PR evaluation at write time

### `shared`

Required work:

- Keep current auth/user/workout-plan/exercise/session contracts synchronized with actual backend behavior
- Add missing aggregate read models only after intentional contract decisions
- Avoid using frontend-only ad hoc DTOs that diverge from shared schemas

### `docs/api/openapi.yaml`

Required work:

- Expand the spec to match the actual supported API surface
- Document auth, ownership, and route behavior clearly
- Do not document unresolved roadmap endpoints as active until contracts are finalized

### Tests

Required work:

- Add or update tests before behavior changes where feasible
- Add real workflow coverage across packages:
  - frontend auth bootstrap and protected routes
  - frontend query/mutation flows
  - backend workout-plan, exercise, session, and ownership behavior
  - shared contract updates

## Missing Backend Dependencies

These are the current backend blockers that prevent a fully real frontend:

- Workout-plan CRUD endpoints are scaffolded only
- Nested plan-structure endpoints are scaffolded only:
  - add exercise to plan
  - remove exercise from plan
  - reorder plan exercises
  - create plan set
  - update plan set
  - delete plan set
- Exercise catalog endpoint is scaffolded only
- Custom exercise creation endpoint is scaffolded only
- Exercise history endpoint is scaffolded only
- Session start endpoint is scaffolded only
- Session set logging endpoint is scaffolded only
- Session completion endpoint is scaffolded only
- Session list endpoint is scaffolded only
- No agreed aggregate endpoints exist yet for:
  - dashboard summary data
  - profile stats
  - history filtering/detail enrichments
- `docs/api/openapi.yaml` is incomplete relative to the PRD, shared contracts, and mounted backend routes

## Risks and Blockers

- Current UI displays data fields not present in shared read models.
- Theme precedence between the local theme store and the server profile is unresolved.
- Active workout recovery after reload is undefined.
- History drill-down and search/filter behavior is undefined.
- The frontend currently has no access-token lifecycle or protected-route model.
- Placeholder UI elements could be mistaken for committed V0.1 scope if they are not explicitly documented as inert.
- Dashboard, history, and profile visuals currently imply aggregate API behavior that has not been designed as a contract.
- The workout screen currently depends on card/detail data that is richer than the present shared workout-plan summary models.

## Recommended Implementation Order

1. Lock missing contract decisions first.
   - Decide whether new aggregate/session-detail read models are required.
   - Add approved changes to `shared` and `docs/api/openapi.yaml` before implementation.
2. Build the frontend auth runtime and route protection.
   - In-memory access-token handling
   - refresh-cookie bootstrap
   - centralized auth-aware API client behavior
   - protected/private route composition
3. Implement backend workout-plans and exercises foundation.
   - workout-plan CRUD
   - plan exercises
   - plan sets
   - default/custom exercise support
   - student cap enforcement
4. Implement backend sessions and PR logic.
   - session start
   - active-session enforcement
   - performed-set logging
   - session completion
   - PR evaluation and persistence
5. Add missing frontend services/hooks and replace hardcoded page data with queries/mutations.
6. Add only the missing screens required by the PRD.
   - register
   - workout plan editor/composer
   - active session logger
   - profile edit flow
   - session/exercise detail view if required by the chosen history UX
7. Finish by updating shared contracts, OpenAPI, and tests in sync.

## Test and Evidence Notes

Current verification baseline:

- `npm test -w frontend` passes
- `npm test -w @the-volumn/backend` passes
- `npm test -w @the-volumn/shared` passes
- `npm run typecheck` passes

Evidence interpretation:

- The repo is currently stable from a test/typecheck perspective.
- The existing frontend tests mainly validate static Figma rendering and local state behavior.
- They should not be treated as proof that the frontend is functionally connected to the backend.

## Implementation Defaults

- This audit is documentation-only and does not change code behavior.
- The file lives under `docs/` because it is durable cross-stack project documentation.
- Existing design, layout, and styling should be preserved unless a real workflow requires a small targeted UI addition.
- `backend/backend-requirements-spec.md` is useful supporting input, but it does not replace this cross-stack migration audit.
