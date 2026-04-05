import rateLimit from 'express-rate-limit'
import { AUTH_RATE_LIMIT_MAX_REQUESTS, AUTH_RATE_LIMIT_WINDOW_MS } from '../domain/auth.constants.js'

export function createAuthRateLimit() {
  return rateLimit({
    limit: AUTH_RATE_LIMIT_MAX_REQUESTS,
    legacyHeaders: false,
    standardHeaders: true,
    windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
    handler: (_request, response) => {
      response.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many auth requests. Please try again later.',
        },
      })
    },
  })
}
