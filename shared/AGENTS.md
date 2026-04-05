# Shared Package Agent Guide

## Purpose

This package owns cross-package HTTP contracts and shared enums.

## Owns

- Zod request and response schemas
- inferred TypeScript types
- public API enums
- pagination and error-envelope schemas

## Rules

- Keep contracts runtime-validated.
- Do not move ownership or business policies into schema validation.
- If a contract changes, update backend consumers, frontend consumers, and `docs/api/openapi.yaml`.
