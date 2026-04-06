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
import { getAuthContext } from '../../../shared/http/auth-context.js'
import { parseBody, parseQuery } from '../../../shared/http/validate.js'
import {
  addPlanExercise,
  createPlanSet,
  createWorkoutPlan,
  deletePlanSet,
  deleteWorkoutPlan,
  getWorkoutPlanDetail,
  listWorkoutPlans,
  removePlanExercise,
  reorderPlanExercises,
  updatePlanSet,
  updateWorkoutPlan,
} from '../application/workout-plans.service.js'

export function createWorkoutPlansRouter() {
  const router = Router()

  router.get('/', async (request, response) => {
    const auth = getAuthContext(request)
    const pagination = parseQuery(request, paginationQuerySchema)
    const result = await listWorkoutPlans(auth.userId, pagination)
    return response.status(200).json(result)
  })

  router.post('/', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, createWorkoutPlanRequestSchema)
    const result = await createWorkoutPlan(auth.userId, payload)
    return response.status(201).json(result)
  })

  router.get('/:id', async (request, response) => {
    const auth = getAuthContext(request)
    const result = await getWorkoutPlanDetail(auth.userId, request.params.id as string)
    return response.status(200).json(result)
  })

  router.patch('/:id', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, updateWorkoutPlanRequestSchema)
    const result = await updateWorkoutPlan(auth.userId, request.params.id as string, payload)
    return response.status(200).json(result)
  })

  router.delete('/:id', async (request, response) => {
    const auth = getAuthContext(request)
    await deleteWorkoutPlan(auth.userId, request.params.id as string)
    return response.status(204).send()
  })

  router.post('/:id/exercises', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, addPlanExerciseRequestSchema)
    const result = await addPlanExercise(auth.userId, request.params.id as string, payload)
    return response.status(201).json(result)
  })

  router.delete('/:planId/exercises/:planExerciseId', async (request, response) => {
    const auth = getAuthContext(request)
    await removePlanExercise(auth.userId, request.params.planId as string, request.params.planExerciseId as string)
    return response.status(204).send()
  })

  router.patch('/:planId/exercises/reorder', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, reorderPlanExercisesRequestSchema)
    const result = await reorderPlanExercises(auth.userId, request.params.planId as string, payload)
    return response.status(200).json(result)
  })

  router.post('/:planId/exercises/:planExerciseId/sets', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, createPlanSetRequestSchema)
    const result = await createPlanSet(
      auth.userId,
      request.params.planId as string,
      request.params.planExerciseId as string,
      payload,
    )
    return response.status(201).json(result)
  })

  return router
}

export function createPlanSetsRouter() {
  const router = Router()

  router.patch('/:setId', async (request, response) => {
    const auth = getAuthContext(request)
    const payload = parseBody(request, updatePlanSetRequestSchema)
    const result = await updatePlanSet(auth.userId, request.params.setId as string, payload)
    return response.status(200).json(result)
  })

  router.delete('/:setId', async (request, response) => {
    const auth = getAuthContext(request)
    await deletePlanSet(auth.userId, request.params.setId as string)
    return response.status(204).send()
  })

  return router
}
