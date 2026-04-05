# Frontend Styles Agent Guide

## Purpose

This folder owns global styling conventions and theme tokens.

## Owns

- theme tokens,
- CSS variables,
- global styles,
- color mode definitions,
- spacing and typography tokens if centralized.

## Must Not Own

- feature-domain logic,
- component-specific API behavior,
- ad hoc palette rules scattered through pages.

## Critical Invariants

- Keep theme switching based on stable tokens rather than scattered inline values.
- Optimize readability for workout-time usage on mobile.
- Prefer semantic tokens over raw color use in feature code.
- V0.1 themes are Rose, Green, and Black.

## Required Tests

- Add or update style or theme tests before changing token behavior or theme switching logic.
- Preserve coverage or manual verification steps for the Rose, Green, and Black themes when tokens change.

## Cross-Package Sync Points

- `frontend/src/components`
- `frontend/src/pages`
- `frontend/src/store`
- `backend/src/modules/users` if theme preference payload changes

## Common Failure Modes

- Token changes made in only one theme.
- Readability regressions on mobile workout screens.
- Semantic tokens replaced with hard-coded colors.
