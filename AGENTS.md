# The Volumn Root Agent Guide

## Purpose

This repository contains the full The Volumn application as a monorepo with a Vite frontend, a Node.js backend, a shared contract package, and durable product and architecture docs.

## Source Of Truth

Use these documents in this order:

1. `PRD_V2.md`
2. `docs/ai/domain-invariants.md`
3. `docs/ai/tdd-workflow.md`
4. `docs/api/openapi.yaml`
5. local folder `AGENTS.md` files
6. `docs/adr/` when an ADR explicitly supersedes an older rule

If code conflicts with `PRD_V2.md`, prefer the PRD unless a later ADR explicitly supersedes it.

## Non-Negotiable Rules

- Keep the monorepo boundaries clear.
- Do not add features outside V0.1.
- Do not silently change endpoint contracts.
- Do not move business logic into Express route handlers or React pages.
- Do not bypass ownership checks.
- Do not store refresh tokens in `localStorage`.
- Do not remove or ignore local `AGENTS.md` guidance.
- Do not implement behavior changes before creating or updating tests whenever possible.

## Architecture Summary

- `frontend`: React + Vite client
- `backend`: Node.js + TypeScript modular monolith
- `shared`: Zod HTTP contracts and inferred TypeScript types
- `docs`: product, API, ADR, and AI operating documentation

## Required Workflow

1. identify the owning folder,
2. read the relevant local `AGENTS.md`,
3. check `docs/ai/domain-invariants.md`,
4. identify and create or update the required tests first,
5. implement the smallest safe change,
6. sync contracts, docs, and affected local guides,
7. run the relevant tests.

## Mandatory Sync Points

When changing API contracts, update all affected places:

- backend HTTP validation and handlers,
- shared contracts,
- frontend services/hooks/types,
- `docs/api/openapi.yaml`,
- relevant local `AGENTS.md`.

## MVP Boundaries

Allowed in V0.1:

- self-managed workout logging
- role-based registration
- student free-tier workout-plan cap
- PR calculation and storage
- exercise history

Not allowed in V0.1:

- trainer invite flow
- public sharing
- billing
- media upload
- advanced charts
- offline/PWA features

## Definition Of Done

A change is not complete until:

- tests were created or updated for the changed behavior,
- type checks pass,
- relevant tests pass,
- contracts are aligned,
- local docs are updated.
