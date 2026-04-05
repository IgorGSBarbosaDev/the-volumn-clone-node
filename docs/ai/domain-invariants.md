# The Volumn Domain Invariants

These rules are authoritative unless a later ADR explicitly supersedes them.

## Scope

- V0.1 is a responsive web app.
- V0.1 excludes public sharing, trainer-client workflows, billing, connected apps, advanced charts, media upload, offline mode, and native apps.

## Ownership

- Every private V0.1 resource belongs to exactly one authenticated user.
- No user can access another user's workout plans, custom exercises, sessions, or session history.
- Ownership checks must be enforced server-side.

## Auth And Security

- Refresh tokens must be stored in HttpOnly cookies.
- Refresh token rotation is required.
- Logout must invalidate refresh tokens server-side.
- Passwords must be hashed with bcrypt-compatible behavior.
- Auth routes must be rate limited.
- Refresh tokens must never move to `localStorage`.

## Workout Domain

- Planned sets and performed sets are separate concepts and must stay separate.
- Progress history is based on performed sets, not planned sets.
- Supported set types in V0.1 are `WARM_UP`, `FEEDER`, `NORMAL`, `FAILURE`, and `DROP_SET`.
- `WARM_UP` and `FEEDER` are not PR-eligible.
- `NORMAL`, `FAILURE`, and `DROP_SET` are PR-eligible.

## PR Logic

- PR is evaluated per user and per exercise.
- PR comparison uses `weightKg * reps`.
- PR is stored at write time.
- PR must not be lazily recomputed on reads without an explicit migration decision.

## Free Tier

- `STUDENT` users may create at most five workout plans.
- The API must enforce this server-side.
- The frontend may warn early, but never replaces server enforcement.

## Engineering Rules

- Keep business logic out of Express route handlers and React pages.
- Keep shared contracts synchronized across backend, shared, frontend, and docs.
- No behavior or contract change is complete without corresponding test coverage updates.
