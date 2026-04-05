import { loginRequestSchema, registerRequestSchema } from '@the-volumn/shared'
import { Router } from 'express'
import { register, login, logout, refresh } from '../application/auth.service.js'
import { parseBody } from '../../../shared/http/validate.js'
import { createAuthRateLimit } from './auth-rate-limit.js'
import { clearRefreshTokenCookie, setRefreshTokenCookie } from './refresh-token-cookie.js'
import { REFRESH_TOKEN_COOKIE_NAME } from '../domain/auth.constants.js'

export function createAuthRouter() {
  const router = Router()
  router.use(createAuthRateLimit())

  router.post('/register', async (request, response) => {
    const payload = parseBody(request, registerRequestSchema)
    const result = await register(payload)
    setRefreshTokenCookie(response, result.refreshToken, result.refreshTokenExpiresAt)
    return response.status(201).json(result.authSession)
  })

  router.post('/login', async (request, response) => {
    const payload = parseBody(request, loginRequestSchema)
    const result = await login(payload)
    setRefreshTokenCookie(response, result.refreshToken, result.refreshTokenExpiresAt)
    return response.status(200).json(result.authSession)
  })

  router.post('/refresh', async (request, response) => {
    const result = await refresh(request.cookies[REFRESH_TOKEN_COOKIE_NAME] as string | undefined)
    setRefreshTokenCookie(response, result.refreshToken, result.refreshTokenExpiresAt)
    return response.status(200).json(result.authSession)
  })

  router.post('/logout', async (request, response) => {
    await logout(request.cookies[REFRESH_TOKEN_COOKIE_NAME] as string | undefined)
    clearRefreshTokenCookie(response)
    return response.status(204).send()
  })

  return router
}
