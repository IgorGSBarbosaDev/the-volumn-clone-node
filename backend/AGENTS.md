# Backend Package Agent Guide

## Purpose

This package owns the server-side enforcement of The Volumn business rules.

## Owns

- Express app bootstrap
- module-level business logic
- Prisma schema and seed data
- auth, ownership, rate limiting, logging, and health endpoints

## Rules

- Keep route handlers thin.
- Keep module ownership explicit.
- Do not bypass shared contracts.
- Do not move business rules into Prisma queries or generic helpers.
