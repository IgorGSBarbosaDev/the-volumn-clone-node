import type { Response } from 'express'
import { env } from '../../../config/env.js'
import { REFRESH_TOKEN_COOKIE_NAME } from '../domain/auth.constants.js'

function getRefreshCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.NODE_ENV === 'production',
    path: '/auth',
    maxAge,
  }
}

export function setRefreshTokenCookie(response: Response, refreshToken: string, refreshTokenExpiresAt: Date) {
  response.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    getRefreshCookieOptions(Math.max(0, refreshTokenExpiresAt.getTime() - Date.now())),
  )
}

export function clearRefreshTokenCookie(response: Response) {
  response.cookie(REFRESH_TOKEN_COOKIE_NAME, '', getRefreshCookieOptions(0))
}
