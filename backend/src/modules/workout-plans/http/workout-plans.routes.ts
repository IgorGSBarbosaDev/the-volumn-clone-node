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
import { parseBody, parseQuery } from '../../../shared/http/validate.js'
import { notImplemented } from '../../../shared/lib/not-implemented.js'

export function createWorkoutPlansRouter() {
  const router = Router()

  router.get('/', (request, response) => {
    parseQuery(request, paginationQuerySchema)
    notImplemented('Workout plans list')
    return response
  })

  router.post('/', (request, response) => {
    parseBody(request, createWorkoutPlanRequestSchema)
    notImplemented('Workout plans create')
    return response
  })

  router.get('/:id', (_request, response) => {
    notImplemented('Workout plans detail')
    return response
  })

  router.patch('/:id', (request, response) => {
    parseBody(request, updateWorkoutPlanRequestSchema)
    notImplemented('Workout plans update')
    return response
  })

  router.delete('/:id', (_request, response) => {
    notImplemented('Workout plans delete')
    return response
  })

  router.post('/:id/exercises', (request, response) => {
    parseBody(request, addPlanExerciseRequestSchema)
    notImplemented('Workout plans add exercise')
    return response
  })

  router.delete('/:planId/exercises/:planExerciseId', (_request, response) => {
    notImplemented('Workout plans remove exercise')
    return response
  })

  router.patch('/:planId/exercises/reorder', (request, response) => {
    parseBody(request, reorderPlanExercisesRequestSchema)
    notImplemented('Workout plans reorder exercises')
    return response
  })

  router.post('/:planId/exercises/:planExerciseId/sets', (request, response) => {
    parseBody(request, createPlanSetRequestSchema)
    notImplemented('Workout plans create plan set')
    return response
  })

  return router
}

export function createPlanSetsRouter() {
  const router = Router()

  router.patch('/:setId', (request, response) => {
    parseBody(request, updatePlanSetRequestSchema)
    notImplemented('Plan sets update')
    return response
  })

  router.delete('/:setId', (_request, response) => {
    notImplemented('Plan sets delete')
    return response
  })

  return router
}
