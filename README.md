# The Volumn

The Volumn is a responsive workout logging MVP delivered as a monorepo.

## Packages

- `frontend`: React + Vite browser client
- `backend`: Node.js + TypeScript + Express backend
- `shared`: Zod contracts and inferred TypeScript types
- `docs`: PRD, ADRs, architecture notes, and OpenAPI

## Getting Started

1. Copy `.env.example` to `backend/.env`.
2. Run `npm install`.
3. Run `npm run db:up`.
4. Run `npm run db:migrate`.
5. Run `npm run db:seed`.
6. Run `npm run dev`.

## Workspace Commands

- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run typecheck`

## Source Of Truth

- `PRD_V2.md`
- `docs/ai/domain-invariants.md`
- `docs/ai/tdd-workflow.md`
- `docs/api/openapi.yaml`
- local `AGENTS.md` files
- `docs/adr/`
