# Frontend Components Agent Guide

## Purpose

This folder owns reusable presentation components.

## Owns

- buttons,
- cards,
- inputs,
- modals,
- empty states,
- list rows,
- badges,
- reusable layout primitives.

## Must Not Own

- feature-domain orchestration,
- direct API calls,
- global theme policy beyond consuming tokens.

## Critical Invariants

- Prefer presentation-focused components.
- Reuse composition patterns instead of adding giant catch-all components.
- Components should consume theme tokens rather than invent their own palette rules.

## Required Tests

- Add or update component tests before changing shared UI behavior.
- Cover accessibility, variant behavior, and theme-sensitive rendering when those aspects change.

## Cross-Package Sync Points

- `frontend/src/features`
- `frontend/src/pages`
- `frontend/src/styles`

## Common Failure Modes

- Reusable components accumulating domain logic.
- UI primitives calling services directly.
- Token usage being replaced with ad hoc styling.
