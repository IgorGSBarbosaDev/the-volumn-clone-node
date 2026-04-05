# Frontend App Layer Agent Guide

## Purpose

This folder owns app bootstrap concerns.

## Owns

- router setup,
- route protection,
- providers,
- global layout shells,
- query client setup,
- auth bootstrapping,
- error boundaries if added.

## Must Not Own

- feature-specific business rules,
- page-specific data transformations,
- hard-coded endpoint logic that belongs in services.

## Critical Invariants

- Distinguish public and protected routes explicitly.
- Initialize theme from stable persisted preference rules.
- Keep access-token refresh integration centralized instead of scattering it across pages.

## Required Tests

- Add or update app/bootstrap tests before changing route protection or auth bootstrap behavior.
- Preserve regression coverage for protected-route access, refresh handling, and startup state initialization.

## Cross-Package Sync Points

- `frontend/src/services`
- `frontend/src/store`
- `backend/src/modules/auth`
- `shared`

## Common Failure Modes

- Feature-specific rendering logic drifting into bootstrap.
- Startup data fetching expanding without clear ownership.
- Route guards becoming implicit or fragile.
