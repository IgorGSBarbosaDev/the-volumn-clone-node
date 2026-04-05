# The Volumn System Overview

## Package Boundaries

- `frontend`
  - React client, route composition, features, services, components, styles
- `backend`
  - Node.js modular monolith, Prisma persistence, integration tests
- `shared`
  - Zod contracts and inferred types
- `docs`
  - product, API, ADR, architecture, and AI docs

## Core Domains

- `auth`
- `users`
- `workout-plans`
- `exercises`
- `sessions`

## Backend Shape

- `src/app`
- `src/config`
- `src/shared`
- `src/modules`
- `prisma`
- `tests`
