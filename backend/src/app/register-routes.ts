import type { Express } from 'express'
import { createAuthRouter } from '../modules/auth/http/auth.routes.js'
import { createExercisesRouter } from '../modules/exercises/http/exercises.routes.js'
import { createSessionsRouter } from '../modules/sessions/http/sessions.routes.js'
import { createUsersRouter } from '../modules/users/http/users.routes.js'
import {
  createPlanSetsRouter,
  createWorkoutPlansRouter,
} from '../modules/workout-plans/http/workout-plans.routes.js'

export function registerRoutes(app: Express) {
  app.get('/health', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      service: 'the-volumn-api',
      time: new Date().toISOString(),
    })
  })

  app.use('/auth', createAuthRouter())
  app.use('/users', createUsersRouter())
  app.use('/workout-plans', createWorkoutPlansRouter())
  app.use('/plan-sets', createPlanSetsRouter())
  app.use('/exercises', createExercisesRouter())
  app.use('/sessions', createSessionsRouter())
}
