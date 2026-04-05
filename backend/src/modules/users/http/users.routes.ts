import { updateCurrentUserRequestSchema } from '@the-volumn/shared'
import { Router } from 'express'
import { parseBody } from '../../../shared/http/validate.js'
import { notImplemented } from '../../../shared/lib/not-implemented.js'

export function createUsersRouter() {
  const router = Router()

  router.get('/me', (_request, response) => {
    notImplemented('Users me')
    return response
  })

  router.patch('/me', (request, response) => {
    parseBody(request, updateCurrentUserRequestSchema)
    notImplemented('Users update me')
    return response
  })

  return router
}
