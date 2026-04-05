# Frontend Store Agent Guide

## Purpose

This folder owns lightweight client-side state that should not live in server-state caches.

## Owns

- current theme preference,
- local UI state,
- transient auth/session UI state if needed,
- modal or open state shared globally.

## Must Not Own

- server source of truth,
- paginated API data,
- workout history records from the backend.

## Critical Invariants

- Prefer TanStack Query for server state.
- Keep Zustand small and intentional.
- Do not duplicate backend entities in local state unless a UX constraint requires it.

## Required Tests

- Add or update store tests before changing persisted UI state or shared global client state behavior.
- Preserve coverage for theme preference and any transient auth or modal state that affects global UX.

## Cross-Package Sync Points

- `frontend/src/app`
- `frontend/src/features`
- `frontend/src/styles`

## Common Failure Modes

- Duplicating server state in the store.
- Letting global UI state become a dumping ground.
- Persisting data that should remain server-owned.
