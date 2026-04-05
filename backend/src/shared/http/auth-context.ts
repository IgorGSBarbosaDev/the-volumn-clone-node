import type { UserRole } from '@the-volumn/shared'
import type { Request } from 'express'
import { ApiError } from './api-error.js'

export type AuthContext = {
  role: UserRole
  userId: string
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext
    }
  }
}

export function getAuthContext(request: Request): AuthContext {
  if (!request.auth) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required')
  }

  return request.auth
}
