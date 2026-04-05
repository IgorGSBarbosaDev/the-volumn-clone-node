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

  return response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected server error',
    },
  })
}
