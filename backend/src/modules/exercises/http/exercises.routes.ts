import { createExerciseRequestSchema, exercisesQuerySchema, paginationQuerySchema } from '@the-volumn/shared'
import { Router } from 'express'
import { parseBody, parseQuery } from '../../../shared/http/validate.js'
import { notImplemented } from '../../../shared/lib/not-implemented.js'

export function createExercisesRouter() {
  const router = Router()

  router.get('/', (request, response) => {
    parseQuery(request, exercisesQuerySchema)
    notImplemented('Exercises list')
    return response
  })

  router.post('/', (request, response) => {
    parseBody(request, createExerciseRequestSchema)
    notImplemented('Exercises create')
    return response
  })

  router.get('/:id/history', (request, response) => {
    parseQuery(request, paginationQuerySchema)
    notImplemented('Exercises history')
    return response
  })

  return router
}
