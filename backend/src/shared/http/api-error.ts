import { Prisma } from '@prisma/client'
import type { Response } from 'express'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
  }
}

export function sendApiError(response: Response, error: unknown) {
  if (error instanceof ApiError) {
    return response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    })
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          issues: error.issues,
        },
      },
    })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2021' || error.code === 'P2022') {
      return response.status(503).json({
        error: {
          code: 'DATABASE_SCHEMA_NOT_READY',
          message: 'Database schema is not initialized. Run the Prisma migration before using the API.',
        },
      })
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return response.status(503).json({
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database connection failed. Start PostgreSQL and try again.',
      },
    })
  }

  return response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected server error',
    },
  })
}
