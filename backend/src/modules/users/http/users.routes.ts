import { updateCurrentUserRequestSchema } from '@the-volumn/shared'
import { Router } from 'express'
import { getCurrentUser, updateCurrentUser } from '../application/current-user.service.js'
import { getAuthContext } from '../../../shared/http/auth-context.js'
import { parseBody } from '../../../shared/http/validate.js'

export function createUsersRouter() {
  const router = Router()

  router.get('/me', async (request, response) => {
    const auth = getAuthContext(request)
    const user = await getCurrentUser(auth.userId)
    return response.status(200).json(user)
  })

  router.patch('/me', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, updateCurrentUserRequestSchema)
    const user = await updateCurrentUser(auth.userId, payload)
    return response.status(200).json(user)
  })

  return router
}
