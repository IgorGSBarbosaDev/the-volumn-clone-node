# Backend Architecture

## Summary

The backend is a module-first modular monolith implemented with Node.js, TypeScript, Express, Zod, Prisma, and PostgreSQL.

## Structure

- `src/app`
  - Express app creation, middleware, route mounting
- `src/config`
  - environment parsing, Prisma client, logger
- `src/shared`
  - HTTP helpers, error helpers, cross-module utilities
- `src/modules/*`
  - feature-owned application, domain, infrastructure, and HTTP code
- `prisma`
  - database schema, migrations, seed data
- `tests`
  - integration and contract-level backend verification

## Rules

- Route handlers stay thin.
- Module business rules do not live in generic helpers.
- Ownership is enforced server-side.
- planned sets and performed sets stay separate.
- PR logic is write-time only.
