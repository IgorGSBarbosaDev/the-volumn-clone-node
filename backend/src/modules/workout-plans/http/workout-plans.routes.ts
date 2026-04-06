import {
  addPlanExerciseRequestSchema,
  createPlanSetRequestSchema,
  createWorkoutPlanRequestSchema,
  paginationQuerySchema,
  reorderPlanExercisesRequestSchema,
  updatePlanSetRequestSchema,
  updateWorkoutPlanRequestSchema,
} from '@the-volumn/shared'
import { Router } from 'express'
import {
  addOwnedPlanExercise,
  createOwnedPlanSet,
  createOwnedWorkoutPlan,
  deleteOwnedPlanSet,
  deleteOwnedWorkoutPlan,
  getOwnedWorkoutPlanDetail,
  listWorkoutPlans,
  removeOwnedPlanExercise,
  reorderOwnedPlanExercises,
  updateOwnedPlanSet,
  updateOwnedWorkoutPlan,
} from '../application/workout-plans.service.js'
import { getAuthContext } from '../../../shared/http/auth-context.js'
import { parseBody, parseQuery } from '../../../shared/http/validate.js'

export function createWorkoutPlansRouter() {
  const router = Router()

  router.get('/', async (request, response) => {
    const auth = getAuthContext(request)
    const query = parseQuery(request, paginationQuerySchema)
    const result = await listWorkoutPlans(auth.userId, query)
    return response.status(200).json(result)
  })

  router.post('/', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, createWorkoutPlanRequestSchema)
    const result = await createOwnedWorkoutPlan(auth.userId, payload)
    return response.status(201).json(result)
  })

  router.get('/:id', async (request, response) => {
    const auth = getAuthContext(request)
    const result = await getOwnedWorkoutPlanDetail(auth.userId, request.params.id)
    return response.status(200).json(result)
  })

  router.patch('/:id', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, updateWorkoutPlanRequestSchema)
    const result = await updateOwnedWorkoutPlan(auth.userId, request.params.id, payload)
    return response.status(200).json(result)
  })

  router.delete('/:id', async (request, response) => {
    const auth = getAuthContext(request)
    await deleteOwnedWorkoutPlan(auth.userId, request.params.id)
    return response.status(204).send()
  })

  router.post('/:id/exercises', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, addPlanExerciseRequestSchema)
    const result = await addOwnedPlanExercise(auth.userId, request.params.id, payload)
    return response.status(201).json(result)
  })

  router.delete('/:planId/exercises/:planExerciseId', async (request, response) => {
    const auth = getAuthContext(request)
    await removeOwnedPlanExercise(auth.userId, request.params.planId, request.params.planExerciseId)
    return response.status(204).send()
  })

  router.patch('/:planId/exercises/reorder', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, reorderPlanExercisesRequestSchema)
    const result = await reorderOwnedPlanExercises(auth.userId, request.params.planId, payload.orderedPlanExerciseIds)
    return response.status(200).json(result)
  })

  router.post('/:planId/exercises/:planExerciseId/sets', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, createPlanSetRequestSchema)
    const result = await createOwnedPlanSet(auth.userId, request.params.planId, request.params.planExerciseId, payload)
    return response.status(201).json(result)
  })

  return router
}

export function createPlanSetsRouter() {
  const router = Router()

  router.patch('/:setId', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, updatePlanSetRequestSchema)
    const result = await updateOwnedPlanSet(auth.userId, request.params.setId, payload)
    return response.status(200).json(result)
  })

  router.delete('/:setId', async (request, response) => {
    const auth = getAuthContext(request)
    await deleteOwnedPlanSet(auth.userId, request.params.setId)
    return response.status(204).send()
  })

  return router
}
