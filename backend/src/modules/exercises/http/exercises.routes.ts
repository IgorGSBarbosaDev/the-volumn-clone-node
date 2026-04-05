import { createExerciseRequestSchema, exercisesQuerySchema, paginationQuerySchema } from '@the-volumn/shared'
import { Router } from 'express'
import {
  createOwnedExercise,
  getAccessibleExerciseHistory,
  listAccessibleExercises,
} from '../application/exercises.service.js'
import { getAuthContext } from '../../../shared/http/auth-context.js'
import { parseBody, parseQuery } from '../../../shared/http/validate.js'

export function createExercisesRouter() {
  const router = Router()

  router.get('/', async (request, response) => {
    const auth = getAuthContext(request)
    const query = parseQuery(request, exercisesQuerySchema)
    const result = await listAccessibleExercises(auth.userId, query)
    return response.status(200).json(result)
  })

  router.post('/', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, createExerciseRequestSchema)
    const result = await createOwnedExercise(auth.userId, payload)
    return response.status(201).json(result)
  })

  router.get('/:id/history', async (request, response) => {
    const auth = getAuthContext(request)
    const query = parseQuery(request, paginationQuerySchema)
    const result = await getAccessibleExerciseHistory(auth.userId, request.params.id, query)
    return response.status(200).json(result)
  })

  return router
}
