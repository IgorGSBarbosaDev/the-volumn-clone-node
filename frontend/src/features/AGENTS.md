# Frontend Features Agent Guide

## Purpose

This folder groups client logic by domain.

## Owns

- `auth`
- `profile`
- `workout-plans`
- `exercises`
- `sessions`
- `history`
- domain-specific hooks,
- feature-level components,
- view models,
- transformations from API data to UI-ready data.

## Must Not Own

- raw endpoint definitions that belong in `services`,
- route shell composition that belongs in `pages` or `app`,
- cross-package contracts that belong in `shared`.

## Critical Invariants

- Organize by business capability, not by generic technical layer.
- Keep feature boundaries aligned with backend modules.
- When an endpoint changes, inspect the matching feature folder first.

## Required Tests

- Add or update feature tests before changing domain behavior in the client.
- Cover interactions between feature hooks, feature components, and services when the workflow changes.

## Cross-Package Sync Points

- matching backend module
- `frontend/src/services`
- `frontend/src/pages`
- `shared`
- `docs/api` when public contract meaning changes

## Common Failure Modes

- Feature logic split across pages and services with no clear owner.
- Client transformations drifting from shared contract meaning.
- Domain behavior changing without updating the matching backend/frontend pair.
