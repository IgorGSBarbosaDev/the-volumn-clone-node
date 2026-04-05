# Frontend Package Agent Guide

## Purpose

This package owns the The Volumn browser client.

## Owns

- `src/app`: bootstrap, providers, router
- `src/pages`: route-level screens
- `src/features`: domain-oriented client hooks and view logic
- `src/services`: API access
- `src/components`: reusable UI
- `src/store`: narrow client state
- `src/styles`: theme tokens and global styles

## Rules

- Do not persist refresh tokens in browser storage.
- Keep route composition in `src/app`.
- Keep API calls in `src/services`.
- Keep feature workflows out of pages where a feature hook or service exists.
