# The Volumn PRD v2

## 1. Document Status

- Project name: The Volumn
- Version: v2
- Status: Approved baseline for V0.1
- Product shape: responsive web application optimized for mobile browsers
- Repository shape: monorepo with `frontend`, `backend`, `shared`, and `docs`

## 2. Product Summary

The Volumn helps self-managed trainees create workout plans, log performed sets, and review whether they are progressing.

The MVP exists to validate one core question:

**What did I do last time, and am I progressing?**

## 3. Product Goal

V0.1 is successful if a user can:

1. create workout plans,
2. attach exercises and planned sets,
3. start a workout session,
4. log performed sets quickly during training,
5. complete the session,
6. review personal history for the same exercise.

## 4. Users

### 4.1 Primary User

Self-managed trainee:

- trains regularly,
- wants clean progression tracking,
- values fast session logging,
- does not need social or billing features in V0.1.

### 4.2 Secondary User

Personal trainer using the app only for their own training.

In V0.1, a trainer is still a self-managed user. Trainer-to-student workflows are out of scope.

## 5. Scope

### 5.1 In Scope For V0.1

Authentication and account:

- register
- login
- logout
- refresh token flow
- role field: `STUDENT` or `TRAINER`
- update own display name
- update own theme preference

Workout plans:

- create
- edit
- delete
- list own workout plans
- view workout plan details

Exercises:

- browse default catalog
- filter by muscle group
- search by name
- create custom exercises owned by the logged user

Planned structure:

- add exercise to workout plan
- remove exercise from workout plan
- reorder exercises in workout plan
- add planned sets
- update planned sets
- delete planned sets

Workout sessions:

- start session from workout plan
- log performed sets
- complete session
- persist duration and completion timestamp

Progress history:

- list workout sessions
- view exercise history
- store PR flag on qualifying sets

UI and UX:

- responsive web experience
- three themes: `rose`, `green`, `black`
- mobile-first interaction for workout-time usage

Freemium logic:

- `STUDENT` users can create at most 5 workout plans
- `TRAINER` users are not limited by workout-plan count in V0.1

### 5.2 Explicitly Out Of Scope For V0.1

- public workout sharing
- trainer-to-student assignment
- invites
- billing and subscriptions
- advanced analytics and charts
- connected apps and device sync
- export center
- media upload
- offline mode
- installable PWA features
- native mobile apps

## 6. Core Business Rules

### 6.1 Ownership

- Every private V0.1 resource belongs to exactly one authenticated user.
- No user can access another user's workout plans, custom exercises, sessions, or history.
- Default exercise catalog entries are global read-only records.

### 6.2 Roles

- `STUDENT`
- `TRAINER`

In V0.1, both roles manage only their own data.

### 6.3 Planned Sets vs Performed Sets

- planned sets describe intended work inside workout plans,
- performed sets describe completed work inside workout sessions,
- history and progression are based only on performed sets.

### 6.4 Set Types

Supported values:

- `WARM_UP`
- `FEEDER`
- `NORMAL`
- `FAILURE`
- `DROP_SET`

Rules:

- `WARM_UP` and `FEEDER` do not count toward PR logic,
- `NORMAL`, `FAILURE`, and `DROP_SET` are PR-eligible,
- `DROP_SET` compares only the primary entered load in V0.1.

### 6.5 PR Logic

- PR is evaluated per user and per exercise.
- PR comparison metric is `weightKg * reps`.
- Only prior qualifying performed sets for the same user and exercise are compared.
- PR is stored when the performed set is created.
- PR is not recomputed on read.

### 6.6 Free Tier

- `STUDENT` users may create at most five workout plans.
- The backend must enforce this limit.
- The frontend may warn early, but cannot replace backend enforcement.

## 7. Required Interface Defaults

These defaults are part of the V0.1 implementation baseline.

### 7.1 Identity And Time

- Resource IDs use UUID strings.
- Timestamps are returned as ISO 8601 UTC strings.

### 7.2 Auth Defaults

- Access token TTL: 15 minutes
- Refresh token TTL: 30 days
- Refresh tokens rotate on refresh
- Logout invalidates the current refresh token session
- Refresh token transport uses `HttpOnly`, `Secure` in production, `SameSite=Lax`

### 7.3 Error Envelope

Validation and domain errors use:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### 7.4 Pagination

Endpoints that grow over time use `page` and `pageSize`.

Defaults:

- `page = 1`
- `pageSize = 20`
- max `pageSize = 100`

### 7.5 Session Defaults

- A user may have at most one active session at a time.
- Completed sessions are immutable in V0.1.
- Performed sets are append-only in V0.1 after creation.

### 7.6 Workout Plan Reorder

- Reorder requests send the full ordered list of `planExerciseId` values.
- Reorder is atomic at the plan level.

## 8. API Baseline

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Users

- `GET /users/me`
- `PATCH /users/me`

### Workout Plans

- `GET /workout-plans`
- `POST /workout-plans`
- `GET /workout-plans/:id`
- `PATCH /workout-plans/:id`
- `DELETE /workout-plans/:id`

### Plan Exercises

- `POST /workout-plans/:id/exercises`
- `DELETE /workout-plans/:planId/exercises/:planExerciseId`
- `PATCH /workout-plans/:planId/exercises/reorder`

### Plan Sets

- `POST /workout-plans/:planId/exercises/:planExerciseId/sets`
- `PATCH /plan-sets/:setId`
- `DELETE /plan-sets/:setId`

### Exercises

- `GET /exercises`
- `POST /exercises`
- `GET /exercises/:id/history`

### Sessions

- `POST /sessions`
- `POST /sessions/:id/sets`
- `PATCH /sessions/:id/complete`
- `GET /sessions`

### Utility

- `GET /health`

## 9. Conceptual Data Model

- `User`
- `RefreshToken`
- `Exercise`
- `WorkoutPlan`
- `PlanExercise`
- `PlanSet`
- `WorkoutSession`
- `SessionSet`

## 10. Acceptance Criteria

Product:

- a new user can register and log in,
- a `STUDENT` user can create at most 5 workout plans,
- a user can build workout plans with ordered exercises and planned sets,
- a user can start and complete a session,
- a user can log performed sets with type, load, and reps,
- a user can review session history and exercise history,
- ownership rules prevent cross-user access.

Engineering:

- monorepo structure is documented,
- API contracts are documented,
- shared contracts exist and are used consistently,
- critical tests exist for auth, ownership, student cap, PR logic, and session completion,
- local `AGENTS.md` files are accurate.
