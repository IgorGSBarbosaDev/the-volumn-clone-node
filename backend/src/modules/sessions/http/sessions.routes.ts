import {
  completeSessionRequestSchema,
  createSessionSetRequestSchema,
  paginationQuerySchema,
  startSessionRequestSchema,
} from '@the-volumn/shared'
import { Router } from 'express'
import { getAuthContext } from '../../../shared/http/auth-context.js'
import { parseBody, parseQuery } from '../../../shared/http/validate.js'
import {
  completeSession,
  createSessionSet,
  getActiveSession,
  getSessionDetail,
  listSessions,
  startSession,
} from '../application/sessions.service.js'

export function createSessionsRouter() {
  const router = Router()

  router.post('/', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, startSessionRequestSchema)
    const result = await startSession(auth.userId, payload)
    return response.status(201).json(result)
  })

  router.get('/active', async (request, response) => {
    const auth = getAuthContext(request)
    const result = await getActiveSession(auth.userId)
    return response.status(200).json(result)
  })

  router.get('/:id', async (request, response) => {
    const auth = getAuthContext(request)
    const result = await getSessionDetail(auth.userId, request.params.id as string)
    return response.status(200).json(result)
  })

  router.get('/', async (request, response) => {
    const auth = getAuthContext(request)
    const pagination = parseQuery(request, paginationQuerySchema)
    const result = await listSessions(auth.userId, pagination)
    return response.status(200).json(result)
  })

  router.post('/:id/sets', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, createSessionSetRequestSchema)
    const result = await createSessionSet(auth.userId, request.params.id as string, payload)
    return response.status(201).json(result)
  })

  router.patch('/:id/complete', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, completeSessionRequestSchema)
    const result = await completeSession(auth.userId, request.params.id as string, payload)
    return response.status(200).json(result)
  })

  return router
}
