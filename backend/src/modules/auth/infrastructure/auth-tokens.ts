import { randomUUID, createHash } from 'crypto'
import type { UserRole } from '@the-volumn/shared'
import jwt from 'jsonwebtoken'
import { env } from '../../../config/env.js'
import type { AuthContext } from '../../../shared/http/auth-context.js'
import { ApiError } from '../../../shared/http/api-error.js'

type TokenUser = {
  id: string
  role: UserRole
}

export type IssuedAuthTokens = {
  accessToken: string
  accessTokenExpiresAt: Date
  refreshToken: string
  refreshTokenExpiresAt: Date
  refreshTokenId: string
}

type AccessTokenPayload = {
  role: UserRole
  sub: string
  type: 'access'
}

type RefreshTokenPayload = {
  sid: string
  sub: string
  type: 'refresh'
}

export function hashRefreshToken(refreshToken: string) {
  return createHash('sha256').update(refreshToken).digest('hex')
}

export function issueAuthTokens(user: TokenUser, now = new Date()): IssuedAuthTokens {
  const accessTokenExpiresAt = new Date(now.getTime() + env.ACCESS_TOKEN_TTL_MINUTES * 60_000)
  const refreshTokenExpiresAt = new Date(now.getTime() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60_000)
  const refreshTokenId = randomUUID()

  const accessToken = jwt.sign(
    {
      role: user.role,
      type: 'access',
    },
    env.JWT_ACCESS_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: env.ACCESS_TOKEN_TTL_MINUTES * 60,
      subject: user.id,
    },
  )

  const refreshToken = jwt.sign(
    {
      sid: refreshTokenId,
      type: 'refresh',
    },
    env.JWT_REFRESH_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
      subject: user.id,
    },
  )

  return {
    accessToken,
    accessTokenExpiresAt,
    refreshToken,
    refreshTokenExpiresAt,
    refreshTokenId,
  }
}

export function verifyAccessToken(accessToken: string): AuthContext {
  try {
    const payload = jwt.verify(accessToken, env.JWT_ACCESS_SECRET)

    if (typeof payload !== 'object' || payload.type !== 'access' || typeof payload.sub !== 'string' || !isUserRole(payload.role)) {
      throw new ApiError(401, 'INVALID_ACCESS_TOKEN', 'Access token is invalid')
    }

    return {
      userId: payload.sub,
      role: payload.role,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (isTokenExpiredError(error) || isJsonWebTokenError(error)) {
      throw new ApiError(401, 'INVALID_ACCESS_TOKEN', 'Access token is invalid')
    }

    throw error
  }
}

export function verifyRefreshToken(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET)

    if (
      typeof payload !== 'object' ||
      payload.type !== 'refresh' ||
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string'
    ) {
      throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid')
    }

    return {
      userId: payload.sub,
      sessionId: payload.sid,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (isTokenExpiredError(error)) {
      throw new ApiError(401, 'REFRESH_TOKEN_EXPIRED', 'Refresh token has expired')
    }

    if (isJsonWebTokenError(error)) {
      throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid')
    }

    throw error
  }
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'STUDENT' || value === 'TRAINER'
}

function isTokenExpiredError(error: unknown) {
  return error instanceof Error && error.name === 'TokenExpiredError'
}

function isJsonWebTokenError(error: unknown) {
  return error instanceof Error && error.name === 'JsonWebTokenError'
}
