import { loginRequestSchema, registerRequestSchema } from '@the-volumn/shared'
import { Router } from 'express'
import { parseBody } from '../../../shared/http/validate.js'
import { notImplemented } from '../../../shared/lib/not-implemented.js'

export function createAuthRouter() {
  const router = Router()

  router.post('/register', (request, response) => {
    parseBody(request, registerRequestSchema)
    notImplemented('Auth register')
    return response
  })

  router.post('/login', (request, response) => {
    parseBody(request, loginRequestSchema)
    notImplemented('Auth login')
    return response
  })

  router.post('/refresh', (_request, response) => {
    notImplemented('Auth refresh')
    return response
  })

  router.post('/logout', (_request, response) => {
    notImplemented('Auth logout')
    return response
  })

  return router
}
