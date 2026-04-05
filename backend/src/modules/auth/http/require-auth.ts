import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../infrastructure/auth-tokens.js'
import { ApiError } from '../../../shared/http/api-error.js'

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    const authorization = request.get('authorization')

    if (!authorization) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required')
    }

    const [scheme, token] = authorization.split(' ')

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required')
    }

    request.auth = verifyAccessToken(token)
    next()
  } catch (error) {
    next(error)
  }
}
