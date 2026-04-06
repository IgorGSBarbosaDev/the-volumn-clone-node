import { createExerciseRequestSchema, exercisesQuerySchema, paginationQuerySchema } from '@the-volumn/shared'
import { Router } from 'express'
import { getAuthContext } from '../../../shared/http/auth-context.js'
import { parseBody, parseQuery } from '../../../shared/http/validate.js'
import { createExercise, getExerciseHistory, listExercises } from '../application/exercises.service.js'

export function createExercisesRouter() {
  const router = Router()

  router.get('/', async (request, response) => {
    const auth = getAuthContext(request)
    const query = parseQuery(request, exercisesQuerySchema)
    const result = await listExercises(auth.userId, query)
    return response.status(200).json(result)
  })

  router.post('/', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, createExerciseRequestSchema)
    const result = await createExercise(auth.userId, payload)
    return response.status(201).json(result)
  })

  router.get('/:id/history', async (request, response) => {
    const auth = getAuthContext(request)
    const pagination = parseQuery(request, paginationQuerySchema)
    const result = await getExerciseHistory(
      auth.userId,
      request.params.id as string,
      pagination.page,
      pagination.pageSize,
    )
    return response.status(200).json(result)
  })

  return router
}
