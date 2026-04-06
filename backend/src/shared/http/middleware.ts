import type { NextFunction, Request, Response } from 'express'
import { logger } from '../../config/logger.js'
import { ApiError, sendApiError } from './api-error.js'

export function notFoundMiddleware(_request: Request, _response: Response, next: NextFunction) {
  next(new ApiError(404, 'NOT_FOUND', 'Route not found'))
}

export function errorMiddleware(error: unknown, request: Request, response: Response, _next: NextFunction) {
  logger.error(
    {
      error,
      method: request.method,
      path: request.path,
    },
    'request failed',
  )

  return sendApiError(response, error)
}
