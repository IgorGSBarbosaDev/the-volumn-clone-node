# The Volumn Backend Requirements Specification

## 1. Backend Overview

### 1.1 Purpose

This document defines the backend work required to support The Volumn V0.1 based on:

1. `PRD_V2.md` as the primary source of truth
2. `docs/ai/domain-invariants.md`
3. current shared contracts in `shared/src/contracts`
4. current backend scaffolding in `backend/src/modules`
5. the current frontend implementation in `frontend/src`

It is implementation-oriented and intended to tell backend engineers exactly what must exist so the frontend can be wired into a functioning V0.1 product.

### 1.2 Current Backend Shape

- Architecture: module-first Node.js + TypeScript modular monolith using Express, Prisma, PostgreSQL, Zod, JWT, bcrypt-compatible password hashing, and cookie-based refresh tokens.
- Current backend modules:
  - `auth`
  - `users`
  - `workout-plans`
  - `exercises`
  - `sessions`
- Current route mounting exists for:
  - `GET /health`
  - `/auth/*`
  - `/users/*`
  - `/workout-plans/*`
  - `/plan-sets/*`
  - `/exercises/*`
  - `/sessions/*`
- Current implementation status:
  - `GET /health` is implemented.
  - Most module routes are scaffolded only and currently throw `501 NOT_IMPLEMENTED`.
  - Prisma already defines the core domain models and enums required by the PRD.
  - Shared contracts already define baseline request and response schemas for auth, users, workout plans, exercises, and sessions.

### 1.3 Frontend Audit Summary

#### Folder structure and ownership

- `frontend/src/app`: router, providers, query client
- `frontend/src/pages`: route-level screens
- `frontend/src/components`: reusable presentation primitives
- `frontend/src/features`: only `auth` and `users` currently contain hooks; `workout-plans`, `exercises`, `sessions`, and `history` folders exist but are empty
- `frontend/src/services`: API wrappers for `auth`, `users`, and `health`
- `frontend/src/store`: Zustand theme store
- `frontend/src/styles`: tokens, themes, globals

#### Current routes and screen state

- `/`: static marketing landing page, no live backend dependency yet
- `/login`: static login screen, no real submit wiring yet
- `/home`: static dashboard with recommended plans, recent sessions, calendar, and volume chart
- `/workout`: static workout plan list and one local-state detail view for the "Push" plan
- `/history`: static history list with search input and calendar button only
- `/profile`: static profile screen with logout button, stats, settings list, and theme toggle

#### Current forms and interactions

- Login form uses local React state only and prevents default submit.
- Workout list/detail flow is local component state only.
- History search field has no query wiring.
- Profile logout button has no service wiring.
- Landing page CTA buttons are visual only.
- No register screen exists yet.
- No active workout session screen exists yet.

#### Current state and data usage

- React Query is configured globally but is not used by pages.
- Existing feature hooks:
  - `useLogin`
  - `useCurrentUser`
  - `useUpdateProfile`
- Existing services:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /users/me`
  - `PATCH /users/me`
  - `GET /health`
- Theme preference is currently stored only in Zustand + `localStorage`.
- No route protection or auth bootstrap exists in the router.
- No frontend code currently consumes workout plans, exercises, sessions, or history endpoints.

#### Frontend-derived backend implication summary

- The backend cannot rely on the current frontend service layer as a complete inventory of required APIs.
- The PRD requires more backend behavior than the current frontend has wired.
- Several current screens display aggregated or derived data not represented in current services or shared read models.
- Theme persistence is currently local in the frontend, but the PRD requires server-side theme preference storage on the user profile.

## 2. Full Backend Feature Requirements

### 2.1 Feature: Auth and Session Security

- Classification:
  - `Explicit (PRD)`: register, login, logout, refresh token flow, role selection, token TTLs, cookie transport rules
  - `Inferred (Frontend)`: auth bootstrap support for future route protection and current-user hydration
  - `Gap/Ambiguity`: multi-device refresh-token behavior is not fully specified
- Purpose:
  - Authenticate users securely and issue session credentials compatible with the frontend's cookie-based API client.
- Functional description:
  - Implement user registration, login, refresh, and logout.
  - Return an `AuthSession` body on successful register, login, and refresh.
  - Set refresh token cookies using `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
  - Rotate refresh tokens on refresh and invalidate the current refresh token on logout.
  - Support later frontend auth bootstrapping via `POST /auth/refresh` and `GET /users/me`.
- Related frontend screens/components:
  - `frontend/src/pages/login-page.tsx`
  - `frontend/src/pages/landing-page.tsx`
  - `frontend/src/app/app-root.tsx`
  - `frontend/src/services/auth-service.ts`
  - `frontend/src/features/auth/use-login.ts`
- Required inputs and outputs:
  - `POST /auth/register`
    - input: `RegisterRequest`
    - output: `AuthSession` plus refresh-token cookie
  - `POST /auth/login`
    - input: `LoginRequest`
    - output: `AuthSession` plus refresh-token cookie
  - `POST /auth/refresh`
    - input: refresh-token cookie
    - output: `AuthSession` plus rotated refresh-token cookie
  - `POST /auth/logout`
    - input: refresh-token cookie
    - output: `204 No Content`
- Business rules:
  - Passwords must be stored as hashes, never plaintext.
  - Access token TTL is 15 minutes.
  - Refresh token TTL is 30 days.
  - Refresh tokens must rotate on refresh.
  - Logout invalidates the current refresh token session server-side.
  - Roles allowed at registration are only `STUDENT` and `TRAINER`.
  - All private resources remain user-owned regardless of role in V0.1.
- Validations:
  - Email must be valid.
  - Password length must match shared contract constraints.
  - Display name must satisfy shared constraints on registration.
  - Role and theme must match supported enums.
  - Refresh requests must reject missing, expired, revoked, or malformed refresh tokens.
  - Auth routes must be rate limited.
- Persistence needs:
  - `User`
  - `RefreshToken`
  - refresh-token hash, expiry, revocation timestamp, and user association
- Integration dependencies:
  - shared contracts in `shared/src/contracts/auth.ts`
  - `users` module for current-user hydration after auth
  - frontend auth services and future route-guard flow
  - OpenAPI must reflect cookie + body behavior
- Notes about ambiguity or inferred behavior:
  - The PRD defines the current-session logout behavior but does not define whether multiple active refresh-token sessions per user are allowed. Prisma currently supports multiple refresh tokens; that should be treated as the default unless a later product decision says otherwise.
  - The current frontend has no register page and no auth guard, but the backend must still implement full auth because it is required by the PRD and shared contracts.

### 2.2 Feature: Current User Profile and Theme Preference

- Classification:
  - `Explicit (PRD)`: get current user, update own display name, update own theme preference
  - `Inferred (Frontend)`: theme state needs eventual backend reconciliation with local client theme
  - `Gap/Ambiguity`: source-of-truth precedence between local theme and server theme is not defined
- Purpose:
  - Provide the logged-in user's profile data and allow controlled updates to profile fields required by V0.1.
- Functional description:
  - Implement `GET /users/me` and `PATCH /users/me`.
  - Return the authenticated user's profile using the shared `CurrentUserResponse`.
  - Allow updating only allowed self-service fields in V0.1: `displayName` and `theme`.
  - Support future frontend auth bootstrap and profile settings screens.
- Related frontend screens/components:
  - `frontend/src/pages/profile-page.tsx`
  - `frontend/src/components/theme-switcher.tsx`
  - `frontend/src/store/theme-store.ts`
  - `frontend/src/services/users-service.ts`
  - `frontend/src/features/auth/use-current-user.ts`
  - `frontend/src/features/users/use-update-profile.ts`
- Required inputs and outputs:
  - `GET /users/me`
    - input: authenticated access token
    - output: `CurrentUserResponse`
  - `PATCH /users/me`
    - input: `UpdateCurrentUserRequest`
    - output: updated `CurrentUserResponse`
- Business rules:
  - A user may read and update only their own profile.
  - Only `displayName` and `theme` are editable in V0.1.
  - Theme values are limited to `rose`, `green`, and `black`.
  - Email and role are not editable through this endpoint in V0.1.
- Validations:
  - Authentication required.
  - `displayName` must match shared length constraints.
  - `theme` must match enum constraints.
  - Empty PATCH bodies must be rejected according to the shared contract refinement.
- Persistence needs:
  - `User.displayName`
  - `User.theme`
  - `User.updatedAt`
- Integration dependencies:
  - shared contracts in `shared/src/contracts/users.ts`
  - auth middleware / token verification
  - frontend theme store reconciliation work
- Notes about ambiguity or inferred behavior:
  - The current frontend stores theme locally in `localStorage`; the backend requirement is to persist the same preference server-side. A sync strategy is still needed so login/bootstrap can decide whether the server value overwrites local state or local state is pushed up once.
  - The current profile screen visually shows avatar editing and other settings items, but those are placeholders and are out of scope for committed V0.1 backend work unless the product scope changes.

### 2.3 Feature: Workout Plans and Planned Structure

- Classification:
  - `Explicit (PRD)`: create, edit, delete, list, detail, add/remove/reorder plan exercises, add/update/delete planned sets, student five-plan cap
  - `Inferred (Frontend)`: plan summaries need enough data to power list cards, home recommendations, and workout detail screens
  - `Gap/Ambiguity`: exact read-model fields for workout cards are not fully defined in shared contracts
- Purpose:
  - Let users build reusable workout plans with ordered exercises and ordered planned sets.
- Functional description:
  - Implement workout plan CRUD and nested planned structure management.
  - Enforce the student free-tier plan cap server-side.
  - Keep planned sets separate from performed sets.
  - Support detail reads that allow the frontend to render plan composition and start a workout session from a plan.
- Related frontend screens/components:
  - `frontend/src/pages/workout-page.tsx`
  - `frontend/src/pages/home-page.tsx`
  - local plan cards and plan detail blocks inside `workout-page.tsx`
- Required inputs and outputs:
  - `GET /workout-plans`
    - input: authenticated user, `page`, `pageSize`
    - output: `WorkoutPlanListResponse`
  - `POST /workout-plans`
    - input: `CreateWorkoutPlanRequest`
    - output: `WorkoutPlanDetail` or equivalent created resource payload
  - `GET /workout-plans/:id`
    - input: workout plan ID
    - output: `WorkoutPlanDetail`
  - `PATCH /workout-plans/:id`
    - input: `UpdateWorkoutPlanRequest`
    - output: updated workout plan payload
  - `DELETE /workout-plans/:id`
    - input: workout plan ID
    - output: `204 No Content`
  - `POST /workout-plans/:id/exercises`
    - input: `AddPlanExerciseRequest`
    - output: updated `PlanExercise` or updated plan detail
  - `DELETE /workout-plans/:planId/exercises/:planExerciseId`
    - input: plan and plan exercise IDs
    - output: `204 No Content`
  - `PATCH /workout-plans/:planId/exercises/reorder`
    - input: `ReorderPlanExercisesRequest`
    - output: reordered plan detail or `204 No Content`
  - `POST /workout-plans/:planId/exercises/:planExerciseId/sets`
    - input: `CreatePlanSetRequest`
    - output: created `PlanSet` or updated plan detail
  - `PATCH /plan-sets/:setId`
    - input: `UpdatePlanSetRequest`
    - output: updated `PlanSet`
  - `DELETE /plan-sets/:setId`
    - input: set ID
    - output: `204 No Content`
- Business rules:
  - Users can manage only their own workout plans and nested plan resources.
  - `STUDENT` users can create at most five workout plans.
  - `TRAINER` users are not capped by plan count in V0.1.
  - Reorder requests send the full ordered list of `planExerciseId` values and must be atomic at the workout-plan level.
  - Planned sets and performed sets must remain separate concepts.
  - Deleting a plan deletes its nested plan exercises and plan sets.
- Validations:
  - Authentication required.
  - Ownership required for plan, plan exercise, and plan set mutations.
  - Workout plan name length must match shared constraints.
  - Accent must match supported values when provided.
  - Focus label must respect length constraints.
  - Reorder payload must contain only IDs belonging to that plan and should represent the complete current set of plan exercises.
  - Plan-set payload must validate set type, reps, load, and note constraints.
  - Plan exercise creation must reject exercise IDs the user cannot access.
- Persistence needs:
  - `WorkoutPlan`
  - `PlanExercise`
  - `PlanSet`
  - relationships to `User` and `Exercise`
- Integration dependencies:
  - shared contracts in `shared/src/contracts/workout-plans.ts`
  - `exercises` module for validating default/custom exercise access
  - `sessions` module for starting sessions from plan IDs
  - OpenAPI and frontend services/hooks that do not yet exist
- Notes about ambiguity or inferred behavior:
  - The current workout UI shows fields such as muscle-group tags, total sets, work sets, and estimated duration on plan cards and detail screens. Current shared contracts only guarantee `exerciseCount`, `accent`, `focusLabel`, and nested plan structures. The backend spec should treat these additional read-model values as required by the frontend, but their exact wire shape is unresolved.
  - The current frontend has no actual plan editor screen yet, but the backend must implement full plan composition because it is required by the PRD.

### 2.4 Feature: Exercise Catalog, Filtering, and Custom Exercises

- Classification:
  - `Explicit (PRD)`: browse default catalog, filter by muscle group, search by name, create custom exercises, read exercise history
  - `Inferred (Frontend)`: workout-plan editing will need searchable exercise selection even though no picker UI exists yet
  - `Gap/Ambiguity`: custom exercise update/delete rules are not defined in V0.1
- Purpose:
  - Provide a searchable exercise catalog that combines global default exercises with user-owned custom exercises.
- Functional description:
  - Implement exercise listing with pagination, name search, muscle-group filter, and optional source filtering.
  - Implement custom exercise creation for the authenticated user.
  - Implement exercise history reads scoped to the current user and exercise.
  - Seed a default catalog of read-only exercises.
- Related frontend screens/components:
  - future plan-editor and exercise-picker UI implied by `workout-page.tsx`
  - `frontend/src/pages/history-page.tsx`
  - `frontend/src/pages/home-page.tsx`
- Required inputs and outputs:
  - `GET /exercises`
    - input: `ExercisesQuery`
    - output: `ExercisesListResponse`
  - `POST /exercises`
    - input: `CreateExerciseRequest`
    - output: created `Exercise`
  - `GET /exercises/:id/history`
    - input: exercise ID, `page`, `pageSize`
    - output: `ExerciseHistoryResponse`
- Business rules:
  - Default catalog exercises are global read-only records.
  - Custom exercises belong to exactly one user.
  - A user can use default exercises and their own custom exercises.
  - A user cannot see or use another user's custom exercises.
  - Exercise history is based only on performed sets from completed sessions.
- Validations:
  - Authentication required for private use cases.
  - Search string, muscle group, source, and pagination must match shared schema.
  - Custom exercise name and muscle group must satisfy shared schema.
  - `GET /exercises/:id/history` must reject exercises the user does not own and must not leak another user's custom exercise existence.
- Persistence needs:
  - `Exercise`
  - seed/default-catalog data
  - links from `PlanExercise` and `SessionSet`
- Integration dependencies:
  - shared contracts in `shared/src/contracts/exercises.ts`
  - `workout-plans` for exercise selection
  - `sessions` for history source data
- Notes about ambiguity or inferred behavior:
  - The PRD does not define edit/delete behavior for custom exercises in V0.1. This backend spec should not add those endpoints.
  - The frontend does not yet expose exercise browsing or custom exercise creation, but both are required for plan authoring.

### 2.5 Feature: Workout Sessions, Performed Sets, and PR Logic

- Classification:
  - `Explicit (PRD)`: start session, log performed sets, complete session, persist duration and completion time, store PR flag at write time
  - `Inferred (Frontend)`: active-session read model and recovery behavior will be needed once the workout UI becomes functional
  - `Gap/Ambiguity`: no dedicated active-session endpoint or session-detail endpoint exists in the current API baseline
- Purpose:
  - Allow a user to execute a workout plan, log performed work quickly, and preserve progression data without mutating completed sessions.
- Functional description:
  - Start a session from a workout plan.
  - Enforce at most one active session per user.
  - Accept append-only performed sets during an active session.
  - Complete the session and persist `completedAt` and `durationSeconds`.
  - Evaluate and store `isPR` when each qualifying performed set is created.
  - Return session data suitable for listing and, once added, active-session detail screens.
- Related frontend screens/components:
  - `frontend/src/pages/workout-page.tsx`
  - "Start Workout" actions in the workout detail screen
  - future active-session logging screen not yet implemented
  - `frontend/src/pages/history-page.tsx`
  - `frontend/src/pages/home-page.tsx`
- Required inputs and outputs:
  - `POST /sessions`
    - input: `StartSessionRequest`
    - output: created session payload, ideally session detail for immediate UI hydration
  - `GET /sessions`
    - input: authenticated user, pagination, and likely future filters
    - output: `SessionsListResponse`
  - `POST /sessions/:id/sets`
    - input: `CreateSessionSetRequest`
    - output: created `SessionSet`
  - `PATCH /sessions/:id/complete`
    - input: `CompleteSessionRequest`
    - output: completed session payload
- Business rules:
  - A user may have at most one active session at a time.
  - Sessions belong to exactly one user.
  - A session is started from one workout plan.
  - Completed sessions are immutable in V0.1.
  - Performed sets are append-only in V0.1.
  - PR eligibility:
    - `WARM_UP` and `FEEDER` are not eligible
    - `NORMAL`, `FAILURE`, and `DROP_SET` are eligible
    - PR metric is `weightKg * reps`
    - comparison scope is prior qualifying performed sets for the same user and exercise
    - `DROP_SET` compares only the primary entered load in V0.1
    - PR is stored on write and must not be recomputed on read
- Validations:
  - Authentication required.
  - Ownership required for every session mutation.
  - Session must be `ACTIVE` to accept new sets or completion.
  - `CreateSessionSetRequest` must respect set type, load, reps, and note constraints.
  - Starting a session must reject missing or unauthorized workout plan IDs.
  - Starting a session must reject creation when another active session already exists.
  - Completing a session should reject if the session is already completed.
  - Session-set creation should reject exercises not valid for the user's accessible catalog; if sessions are meant to follow the originating workout plan strictly, that rule must be enforced consistently.
- Persistence needs:
  - `WorkoutSession`
  - `SessionSet`
  - `isPR`, `completedAt`, `durationSeconds`, and session status
- Integration dependencies:
  - shared contracts in `shared/src/contracts/sessions.ts`
  - `workout-plans` for start-session source plan
  - `exercises` for exercise ownership/access and history references
  - future frontend session features not yet built
- Notes about ambiguity or inferred behavior:
  - The current API baseline has no `GET /sessions/:id` or `GET /sessions/active`. At least one of those read capabilities will be needed to power a real active workout flow, restore an in-progress session, and navigate from workout history into session detail. The exact endpoint shape is unresolved.
  - The frontend has no active-session screen yet, but the backend must still support the full session lifecycle because it is a core MVP requirement.

### 2.6 Feature: History and Progress Reporting

- Classification:
  - `Explicit (PRD)`: list workout sessions, view exercise history, review whether the user is progressing
  - `Inferred (Frontend)`: dashboard cards, recent sessions, monthly calendar counts, profile stats, search, and list-card aggregates
  - `Gap/Ambiguity`: exact reporting endpoint design is not defined for dashboard/home/profile/history screens
- Purpose:
  - Expose historical session and exercise performance data so users can understand prior performance and progression.
- Functional description:
  - Provide paginated session history.
  - Provide per-exercise performed-set history.
  - Support frontend views that display recent sessions, volume summaries, session counts, PR counts, and date-based history navigation.
  - Ensure history is built only from performed work, not planned data.
- Related frontend screens/components:
  - `frontend/src/pages/history-page.tsx`
  - `frontend/src/pages/home-page.tsx`
  - `frontend/src/pages/profile-page.tsx`
- Required inputs and outputs:
  - Confirmed baseline:
    - `GET /sessions` -> `SessionsListResponse`
    - `GET /exercises/:id/history` -> `ExerciseHistoryResponse`
  - Frontend-implied additional read capabilities:
    - recent sessions read model for `/home`
    - dashboard monthly overview and volume aggregates for `/home`
    - profile stats such as total sessions and PR count for `/profile`
    - history search and date filtering for `/history`
    - session detail navigation target for history cards
- Business rules:
  - History is user-scoped.
  - History uses performed sets only.
  - PR display uses stored `isPR`, not lazy recomputation.
  - Pagination defaults apply wherever result size grows over time.
- Validations:
  - Authentication required.
  - Ownership enforcement on session and exercise history reads.
  - Search/filter fields, if added, must be validated explicitly.
  - Date filters, if added, must use UTC ISO timestamps or documented calendar-date semantics.
- Persistence needs:
  - No new core write models beyond `WorkoutSession` and `SessionSet`
  - likely read-model queries or service-level aggregations over sessions and session sets
- Integration dependencies:
  - `sessions` data
  - `exercises` history queries
  - future frontend services/hooks for dashboard, history, and profile aggregates
- Notes about ambiguity or inferred behavior:
  - The PRD names session history and exercise history, but it does not define the API shape for dashboard aggregates or profile stats. Those are clearly required by the current frontend visuals, but the exact contract should be treated as unresolved until intentionally added to `shared` and `docs/api/openapi.yaml`.
  - The history screen implies search, calendar filtering, and card drill-down behavior, but those interaction contracts do not exist yet.

## 3. Domain Entities and Required Data

| Entity / Read Model | Type | Required data | Notes |
| --- | --- | --- | --- |
| `User` | persisted | `id`, `email`, `passwordHash`, `displayName`, `role`, `theme`, `createdAt`, `updatedAt` | Core authenticated actor. Owns private resources. |
| `RefreshToken` | persisted | `id`, `userId`, `tokenHash`, `createdAt`, `expiresAt`, `revokedAt` | Supports refresh rotation and logout invalidation. |
| `Exercise` | persisted | `id`, `ownerUserId`, `name`, `muscleGroup`, `source`, `createdAt`, `updatedAt` | `source` is `DEFAULT` or `CUSTOM`. Default entries are global read-only. |
| `WorkoutPlan` | persisted | `id`, `ownerUserId`, `name`, `accent`, `focusLabel`, `createdAt`, `updatedAt` | Root plan entity. Student cap applies here. |
| `PlanExercise` | persisted | `id`, `workoutPlanId`, `exerciseId`, `order` | Ordered exercise entry inside a workout plan. |
| `PlanSet` | persisted | `id`, `planExerciseId`, `order`, `setType`, `targetReps`, `targetLoadKg`, `notes` | Planned intent only, never used as performed history. |
| `WorkoutSession` | persisted | `id`, `ownerUserId`, `workoutPlanId`, `status`, `startedAt`, `completedAt`, `durationSeconds` | Active or completed execution of a plan. |
| `SessionSet` | persisted | `id`, `workoutSessionId`, `exerciseId`, `setType`, `weightKg`, `reps`, `notes`, `isPR`, `createdAt` | Performed set; append-only; source of progression history. |
| `WorkoutPlanSummary` | shared read model | `id`, `name`, `accent`, `focusLabel`, `exerciseCount`, `createdAt`, `updatedAt` | Current minimum contract. |
| `WorkoutPlanDetail` | shared read model | summary fields plus ordered `PlanExercise[]` and `PlanSet[]` | Current minimum plan detail contract. |
| `WorkoutSessionSummary` | shared read model | `id`, `workoutPlanId`, `workoutPlanName`, `status`, `startedAt`, `completedAt`, `durationSeconds`, `totalSets` | Current minimum session-list contract. |
| `ExerciseHistoryEntry` | shared read model | `sessionId`, `sessionCompletedAt`, `setId`, `setType`, `weightKg`, `reps`, `volume`, `isPR`, `notes` | Used for exercise progression review. |
| Dashboard summary | inferred read model | recommended plans, recent sessions, monthly counts, volume aggregates, possibly PR counts | Required by `/home`, but contract shape is unresolved. |
| Profile stats summary | inferred read model | total sessions, PR count, possibly other user-scoped counters | Required by `/profile`, but contract shape is unresolved. |
| Session detail / active session read model | inferred read model | session metadata plus ordered performed sets and plan context | Required for a real workout logging screen, but endpoint shape is unresolved. |

## 4. Required API Endpoints and Expected Contracts

### 4.1 Confirmed Baseline Endpoints

These are already established by the PRD, backend route scaffolding, and/or current shared contracts.

| Endpoint | Purpose | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `GET /health` | backend health check | none | `{ service, status, time }` | Already implemented. Public. |
| `POST /auth/register` | register and create session | `RegisterRequest` | `AuthSession` + refresh cookie | `201 Created`. |
| `POST /auth/login` | login and create session | `LoginRequest` | `AuthSession` + refresh cookie | `200 OK`. |
| `POST /auth/refresh` | rotate session | refresh cookie | `AuthSession` + rotated refresh cookie | `200 OK`. |
| `POST /auth/logout` | invalidate current refresh session | refresh cookie | no body | `204 No Content`. |
| `GET /users/me` | get current user | bearer token | `CurrentUserResponse` | authenticated. |
| `PATCH /users/me` | update display name/theme | `UpdateCurrentUserRequest` | `CurrentUserResponse` | authenticated. |
| `GET /workout-plans` | list own plans | `page`, `pageSize` | `WorkoutPlanListResponse` | authenticated. |
| `POST /workout-plans` | create plan | `CreateWorkoutPlanRequest` | created plan payload | authenticated; student cap enforced. |
| `GET /workout-plans/:id` | plan detail | path ID | `WorkoutPlanDetail` | authenticated + ownership. |
| `PATCH /workout-plans/:id` | update plan metadata | `UpdateWorkoutPlanRequest` | updated plan payload | authenticated + ownership. |
| `DELETE /workout-plans/:id` | delete plan | path ID | no body | authenticated + ownership. |
| `POST /workout-plans/:id/exercises` | add exercise to plan | `AddPlanExerciseRequest` | created plan exercise or updated plan detail | authenticated + ownership. |
| `DELETE /workout-plans/:planId/exercises/:planExerciseId` | remove plan exercise | path IDs | no body | authenticated + ownership. |
| `PATCH /workout-plans/:planId/exercises/reorder` | atomic reorder | `ReorderPlanExercisesRequest` | reordered plan payload or no body | authenticated + ownership. |
| `POST /workout-plans/:planId/exercises/:planExerciseId/sets` | add plan set | `CreatePlanSetRequest` | created plan set or updated detail | authenticated + ownership. |
| `PATCH /plan-sets/:setId` | update plan set | `UpdatePlanSetRequest` | updated plan set | authenticated + ownership. |
| `DELETE /plan-sets/:setId` | delete plan set | path ID | no body | authenticated + ownership. |
| `GET /exercises` | browse catalog | `ExercisesQuery` | `ExercisesListResponse` | authenticated in practice for owned-data semantics. |
| `POST /exercises` | create custom exercise | `CreateExerciseRequest` | created `Exercise` | authenticated. |
| `GET /exercises/:id/history` | exercise progression history | `page`, `pageSize` | `ExerciseHistoryResponse` | authenticated + ownership/access. |
| `POST /sessions` | start workout session | `StartSessionRequest` | created session payload | authenticated; only one active session allowed. |
| `GET /sessions` | list workout sessions | `page`, `pageSize` | `SessionsListResponse` | authenticated. |
| `POST /sessions/:id/sets` | add performed set | `CreateSessionSetRequest` | created `SessionSet` | authenticated + active-session enforcement. |
| `PATCH /sessions/:id/complete` | complete session | `CompleteSessionRequest` | completed session payload | authenticated + ownership. |

### 4.2 Response and Contract Defaults

- Resource IDs are UUID strings.
- Timestamps are ISO 8601 UTC strings.
- Validation and domain errors use:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

- Paginated endpoints use:
  - `page = 1`
  - `pageSize = 20`
  - `max pageSize = 100`
- Shared contract files are the default wire-shape authority wherever a schema already exists.

### 4.3 Frontend-Implied or Unresolved API Needs

These needs are real, but their exact endpoint design is not settled.

| Need | Why it exists | Current status |
| --- | --- | --- |
| Session detail endpoint | history cards and active workout flow need a detail target | `Gap/Ambiguity` |
| Active session recovery endpoint | app must eventually recover an in-progress session after reload/navigation | `Gap/Ambiguity` |
| Dashboard summary endpoint or equivalent aggregate contract | `/home` shows calendar counts, recent sessions, recommended plans, and volume trend data | `Gap/Ambiguity` |
| Profile stats contract | `/profile` shows total sessions and PR count | `Gap/Ambiguity` |
| History search/date-filter contract | `/history` includes search and calendar affordances | `Gap/Ambiguity` |
| Workout-plan summary aggregates | workout cards show muscle groups, set totals, and duration-like metadata not present in current shared summaries | `Gap/Ambiguity` |

The backend should not invent these contracts ad hoc during implementation. They should be added intentionally to `shared`, `docs/api/openapi.yaml`, and the backend/frontend together.

## 5. Validation and Business Rules

### 5.1 Ownership and Access

- Every private V0.1 resource belongs to exactly one authenticated user.
- Ownership must be enforced server-side.
- No user may access another user's:
  - workout plans
  - custom exercises
  - sessions
  - private history
- Default catalog exercises are global read-only records.

### 5.2 Auth and Security

- Refresh tokens must be stored in HttpOnly cookies.
- Refresh token rotation is mandatory.
- Logout must invalidate the current refresh token server-side.
- Passwords must be hashed with bcrypt-compatible behavior.
- Auth routes must be rate limited.
- Refresh tokens must never be sent to or expected from `localStorage`.

### 5.3 Workout-Plan Rules

- `STUDENT` users may create at most five workout plans.
- `TRAINER` users are not capped in V0.1.
- Reordering plan exercises is atomic at the workout-plan level.
- Plan exercises are ordered and plan sets are ordered.
- Planned sets remain separate from performed sets at the model and API level.

### 5.4 Session Rules

- A user may have at most one active session at a time.
- Completed sessions are immutable in V0.1.
- Performed sets are append-only after creation in V0.1.
- Duration and completion timestamp are persisted when the session is completed.

### 5.5 PR Rules

- PR is evaluated per user and per exercise.
- Only qualifying prior performed sets are compared.
- PR metric is `weightKg * reps`.
- `WARM_UP` and `FEEDER` are not PR-eligible.
- `NORMAL`, `FAILURE`, and `DROP_SET` are PR-eligible.
- `DROP_SET` compares only the primary entered load in V0.1.
- PR is stored at write time and must not be recomputed on read.

### 5.6 Validation Baselines

- IDs are UUIDs.
- Timestamps are UTC ISO strings in responses.
- Shared Zod contracts are authoritative for request validation where they already exist.
- Domain rules that exceed schema validation must live in module logic, not only in route handlers or Prisma constraints.

### 5.7 Out-of-Scope Placeholder Handling

The following visible frontend items are placeholders and must not silently become backend commitments for V0.1:

- profile photo editing
- connected apps
- export center / CSV / JSON / PDF export
- advanced analytics / charts / "Performance Hub"
- trainer-to-student workflows

## 6. Frontend-Backend Integration Mapping

| Current route | Current frontend behavior | Required backend responsibilities | Status label |
| --- | --- | --- | --- |
| `/` | static marketing page with CTA buttons | no functional backend dependency required for V0.1 render; auth/register destinations still required elsewhere | `Inferred (Frontend)` |
| `/login` | static login form using local state only | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`, auth errors, current-user hydration after auth | `Explicit (PRD)` + `Gap/Ambiguity` because register screen is missing |
| `/home` | static dashboard with recommended plans, recent sessions, monthly overview, and volume bars | workout-plan listing, session history, dashboard aggregates, PR counts, monthly summaries | `Inferred (Frontend)` + `Gap/Ambiguity` for aggregate contract shape |
| `/workout` | static workout-plan list and one local detail view | workout-plan CRUD, plan detail, plan exercises/sets, plan summary aggregates, start-session flow, active-session read capability | `Explicit (PRD)` + `Gap/Ambiguity` for active-session detail |
| `/history` | static history cards, search input, calendar button | `GET /sessions`, `GET /exercises/:id/history`, session detail read, search/date filters, list-card aggregates | `Explicit (PRD)` + `Gap/Ambiguity` for filters and detail endpoint |
| `/profile` | static profile info, stats, theme toggle, logout button | `GET /users/me`, `PATCH /users/me`, logout, profile stats summary, server theme persistence | `Explicit (PRD)` + `Gap/Ambiguity` for stats contract |

### Component and hook mapping

- `frontend/src/components/theme-switcher.tsx`
  - backend dependency: persisted user theme once authenticated
- `frontend/src/store/theme-store.ts`
  - backend dependency: eventual sync with `PATCH /users/me`
- `frontend/src/services/auth-service.ts`
  - backend dependency: fully implemented `/auth/*`
- `frontend/src/services/users-service.ts`
  - backend dependency: fully implemented `/users/me`
- `frontend/src/features/auth/use-login.ts`
  - backend dependency: login response and error semantics
- `frontend/src/features/auth/use-current-user.ts`
  - backend dependency: authenticated `GET /users/me`
- `frontend/src/features/users/use-update-profile.ts`
  - backend dependency: authenticated `PATCH /users/me`

## 7. Missing or Unclear Requirements

1. No register page exists in the frontend, but registration is explicitly required by the PRD and already represented in shared contracts.
2. No active workout-session screen exists yet, but session start, set logging, and completion are explicitly required by the PRD.
3. The current frontend theme is local-only, while the PRD requires server-persisted theme preference.
4. The home dashboard needs aggregate data such as recent sessions, monthly overview counts, and volume trends, but no shared contract or endpoint defines that payload.
5. The profile page needs total-session and PR-count stats, but no shared contract or endpoint defines those fields.
6. The workout list/detail UI shows muscle-group tags, set counts, and duration-like metadata that are not present in current `WorkoutPlanSummary` or `WorkoutPlanDetail` contracts.
7. The history screen implies search, calendar filtering, and session drill-down, but the current API baseline defines only paginated `GET /sessions`.
8. There is no dedicated session detail or active-session recovery endpoint even though realistic workout logging will need one.
9. Route protection and auth bootstrap are absent in the current frontend; backend 401/403 semantics must still be designed cleanly before frontend wiring starts.
10. Concurrent refresh-token and concurrent-session behavior are only partially specified:
  - Prisma supports multiple refresh tokens per user
  - the PRD only guarantees current-session logout invalidation
  - the PRD guarantees only one active workout session at a time
11. The current OpenAPI file is incomplete relative to the PRD, shared contracts, and backend route scaffolding.

## 8. Risks and Implementation Notes

1. The biggest delivery risk is contract drift between static frontend visuals and the backend/shared contracts. Dashboard, history, profile, and workout summary read models need explicit decisions before implementation starts.
2. Current backend modules already exist, so new behavior should be added inside the owned module boundaries instead of creating cross-cutting generic abstractions.
3. Business rules such as ownership checks, student plan cap, active-session uniqueness, and PR write-time evaluation must live in module logic, not only in request validation or Prisma constraints.
4. Theme persistence needs a deliberate migration path from local UI state to server-backed state; otherwise the frontend can show one theme locally while the server stores another.
5. Because most backend routes currently return `501`, endpoint-by-endpoint tests should be added before implementing module logic to avoid silent behavior drift.
6. History and dashboard reporting should be implemented from persisted sessions and session sets only. Planned sets must never contaminate progression metrics.
7. Out-of-scope profile settings visible in the frontend should remain inert until product scope expands. The backend should not add avatar uploads, connected apps, export jobs, or advanced analytics under V0.1 pressure.
8. `docs/api/openapi.yaml` and `shared` must be updated whenever unresolved aggregate endpoints are formalized; otherwise the frontend will wire to undocumented behavior.

## 9. Priority by Feature

| Priority | Feature | Why |
| --- | --- | --- |
| P0 | Auth and session security | Required for any authenticated product use; already exposed in services/shared. |
| P0 | Current user profile and theme update | Required for `/users/me`, profile, and eventual auth bootstrap. |
| P0 | Workout plans and planned structure | Core MVP capability and prerequisite for session start. |
| P0 | Workout sessions and PR logic | Core MVP capability and prerequisite for progression tracking. |
| P0 | Exercise catalog and exercise history | Required for plan building and progression review. |
| P1 | Session history list and exercise history UX completion | Needed to make `/history` functional beyond static cards. |
| P1 | Dashboard aggregate read models | Needed to make `/home` data-backed, but not part of the currently formalized API baseline. |
| P1 | Profile stats read model | Needed to make `/profile` stats data-backed. |
| P2 | Search/date filtering refinements for history | Important for UX, but exact contract is still unresolved. |
| P2 | Active-session recovery endpoint formalization | Needed for polished session UX once the frontend screen exists; endpoint shape still needs intentional design. |

## 10. Recommended Implementation Order

1. Lock contract decisions first.
   - Confirm whether any new read-model endpoints are needed for dashboard, profile stats, session detail, and history filtering.
   - Add approved contract changes to `shared` and `docs/api/openapi.yaml` before backend implementation.
2. Implement auth foundation.
   - register
   - login
   - refresh rotation
   - logout invalidation
   - token verification middleware
   - auth rate limiting
3. Implement `users/me`.
   - authenticated current-user read
   - display-name update
   - server-side theme persistence
4. Implement exercise catalog foundation.
   - default exercise seed data
   - custom exercise creation
   - catalog list/filter/search
5. Implement workout plans and plan structure.
   - plan CRUD
   - student five-plan cap
   - plan exercises
   - plan sets
   - atomic reorder
6. Implement session lifecycle and PR logic.
   - start session
   - enforce one active session
   - append-only session sets
   - complete session
   - write-time PR calculation
7. Implement history and reporting reads.
   - paginated session list
   - exercise history
   - any approved dashboard/profile aggregate endpoints
8. Wire missing frontend services and hooks after backend contracts are stable.
   - route protection
   - auth bootstrap
   - workout-plan queries/mutations
   - session/history queries
   - theme sync between local store and server profile

### Final coverage check against current frontend flows

- `/` covered: no required runtime backend dependency, but auth destinations are acknowledged.
- `/login` covered: login plus missing registration flow called out.
- `/home` covered: dashboard aggregate dependencies called out.
- `/workout` covered: plan CRUD, detail data, and start-session dependencies called out.
- `/history` covered: sessions, exercise history, and missing filter/detail contracts called out.
- `/profile` covered: current user, theme persistence, logout, and missing stats contract called out.