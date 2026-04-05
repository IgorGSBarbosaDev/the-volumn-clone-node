import {
  completeSessionRequestSchema,
  createSessionSetRequestSchema,
  paginationQuerySchema,
  startSessionRequestSchema,
} from '@the-volumn/shared'
import { Router } from 'express'
import {
  completeOwnedWorkoutSession,
  createOwnedSessionSet,
  getOwnedActiveWorkoutSession,
  getOwnedWorkoutSession,
  listWorkoutSessions,
  startOwnedWorkoutSession,
} from '../application/sessions.service.js'
import { getAuthContext } from '../../../shared/http/auth-context.js'
import { parseBody, parseQuery } from '../../../shared/http/validate.js'

export function createSessionsRouter() {
  const router = Router()

  router.post('/', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, startSessionRequestSchema)
    const result = await startOwnedWorkoutSession(auth.userId, payload)
    return response.status(201).json(result)
  })

  router.get('/', async (request, response) => {
    const auth = getAuthContext(request)
    const query = parseQuery(request, paginationQuerySchema)
    const result = await listWorkoutSessions(auth.userId, query)
    return response.status(200).json(result)
  })

  router.get('/active', async (request, response) => {
    const auth = getAuthContext(request)
    const result = await getOwnedActiveWorkoutSession(auth.userId)
    return response.status(200).json(result)
  })

  router.get('/:id', async (request, response) => {
    const auth = getAuthContext(request)
    const result = await getOwnedWorkoutSession(auth.userId, request.params.id)
    return response.status(200).json(result)
  })

  router.post('/:id/sets', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, createSessionSetRequestSchema)
    const result = await createOwnedSessionSet(auth.userId, request.params.id, payload)
    return response.status(201).json(result)
  })

  router.patch('/:id/complete', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, completeSessionRequestSchema)
    const result = await completeOwnedWorkoutSession(auth.userId, request.params.id, payload)
    return response.status(200).json(result)
  })

  return router
}
