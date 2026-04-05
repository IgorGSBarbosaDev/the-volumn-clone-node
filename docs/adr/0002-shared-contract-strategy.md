# ADR 0002: Shared Contract Strategy

## Status

Accepted

## Decision

`shared` is the single runtime source of truth for HTTP contracts.

It exports:

- Zod request and response schemas
- shared enums
- inferred TypeScript types

The frontend and backend both import these contracts directly.

## Rationale

- The previous repository promised shared contracts but did not actually implement them.
- The new stack is TypeScript end to end, so duplicate DTO layers are unnecessary by default.
- Contract drift risk is lowest when validation and inferred types come from the same runtime definition.
