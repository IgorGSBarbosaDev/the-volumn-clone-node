# Frontend Pages Agent Guide

## Purpose

This folder contains route-level screens.

## Owns

- page composition,
- page-level layout,
- route params reading,
- orchestration of features/components.

## Must Not Own

- heavy business logic,
- raw endpoint calls when a service exists,
- shared component primitives.

## Critical Invariants

- Pages should orchestrate one user workflow each.
- Keep heavy logic in `features`, hooks, or services.
- Reuse components instead of embedding repeated UI and domain logic in screens.

## Required Tests

- Add or update page-level tests before changing route orchestration or critical workflow behavior.
- Preserve coverage for login, dashboard, plan editor, active session, history, and profile journeys when those flows change.

## Cross-Package Sync Points

- `frontend/src/features`
- `frontend/src/services`
- `frontend/src/components`
- `frontend/src/app`

## Common Failure Modes

- Pages implementing business rules directly.
- Screen logic bypassing feature modules.
- Workflow changes landing without route-level coverage.
