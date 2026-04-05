import {
  completeSessionRequestSchema,
  createSessionSetRequestSchema,
  paginationQuerySchema,
  startSessionRequestSchema,
} from '@the-volumn/shared'
import { Router } from 'express'
import { parseBody, parseQuery } from '../../../shared/http/validate.js'
import { notImplemented } from '../../../shared/lib/not-implemented.js'

export function createSessionsRouter() {
  const router = Router()

  router.post('/', (request, response) => {
    parseBody(request, startSessionRequestSchema)
    notImplemented('Sessions start')
    return response
  })

  router.get('/', (request, response) => {
    parseQuery(request, paginationQuerySchema)
    notImplemented('Sessions list')
    return response
  })

  router.post('/:id/sets', (request, response) => {
    parseBody(request, createSessionSetRequestSchema)
    notImplemented('Sessions create set')
    return response
  })

  router.patch('/:id/complete', (request, response) => {
    parseBody(request, completeSessionRequestSchema)
    notImplemented('Sessions complete')
    return response
  })

  return router
}
