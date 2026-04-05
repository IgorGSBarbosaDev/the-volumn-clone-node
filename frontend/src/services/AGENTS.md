# Frontend Services Agent Guide

## Purpose

This folder owns communication with the backend API.

## Owns

- Axios instance setup,
- request helpers,
- endpoint wrappers,
- auth refresh integration,
- request/response adaptation if needed.

## Must Not Own

- route-level rendering logic,
- backend business rules,
- unstable local DTO definitions that diverge from `shared`.

## Critical Invariants

- Keep endpoint paths centralized.
- Use shared contracts for payloads and responses.
- Handle refresh and auth failures consistently.
- Avoid UI-specific assumptions in raw service functions.

## Required Tests

- Add or update service tests before changing request shaping, auth handling, or response adaptation.
- Preserve regression coverage for auth refresh behavior and any service used by critical user flows.

## Cross-Package Sync Points

- `backend/src/modules`
- `shared`
- `frontend/src/features`
- `frontend/src/app`
- `docs/api`

## Common Failure Modes

- Services drifting from shared contracts.
- Endpoint paths spreading into pages.
- Auth refresh behavior becoming inconsistent across requests.
