import type { NextFunction, Request, Response } from 'express'
import { ApiError, sendApiError } from './api-error.js'

export function notFoundMiddleware(_request: Request, _response: Response, next: NextFunction) {
  next(new ApiError(404, 'NOT_FOUND', 'Route not found'))
}

export function errorMiddleware(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  return sendApiError(response, error)
}
