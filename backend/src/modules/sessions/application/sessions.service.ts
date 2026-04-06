import type {
  CompleteSessionRequest,
  CreateSessionSetRequest,
  PaginationQuery,
  StartSessionRequest,
} from '@the-volumn/shared'
import { Prisma } from '@prisma/client'
import { ApiError } from '../../../shared/http/api-error.js'
import { getAccessibleExerciseById } from '../../exercises/application/exercise-access.service.js'
import { getOwnedWorkoutPlanDetail } from '../../workout-plans/application/workout-plans.service.js'
import { SESSION_ERRORS } from '../domain/sessions.constants.js'
import {
  appendOwnedSessionSet,
  completeOwnedWorkoutSession as completeOwnedWorkoutSessionRecord,
  createWorkoutSession,
  getOwnedActiveWorkoutSessionDetail,
  getOwnedWorkoutSessionDetail,
  listOwnedWorkoutSessions,
} from '../infrastructure/sessions.repository.js'

export async function startOwnedWorkoutSession(userId: string, payload: StartSessionRequest) {
  const activeSession = await getOwnedActiveWorkoutSessionDetail(userId)

  if (activeSession) {
    throw new ApiError(
      409,
      SESSION_ERRORS.activeSessionExists.code,
      SESSION_ERRORS.activeSessionExists.message,
    )
  }

  const workoutPlan = await getOwnedWorkoutPlanDetail(userId, payload.workoutPlanId)

  try {
    return await createWorkoutSession(userId, workoutPlan)
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ApiError(
        409,
        SESSION_ERRORS.activeSessionExists.code,
        SESSION_ERRORS.activeSessionExists.message,
      )
    }

    throw error
  }
}

export async function listWorkoutSessions(userId: string, pagination: PaginationQuery) {
  return listOwnedWorkoutSessions(userId, pagination)
}

export async function getOwnedActiveWorkoutSession(userId: string) {
  return getOwnedActiveWorkoutSessionDetail(userId)
}

export async function getOwnedWorkoutSession(userId: string, sessionId: string) {
  const session = await getOwnedWorkoutSessionDetail(sessionId, userId)

  if (!session) {
    throw new ApiError(404, SESSION_ERRORS.sessionNotFound.code, SESSION_ERRORS.sessionNotFound.message)
  }

  return session
}

export async function createOwnedSessionSet(
  userId: string,
  sessionId: string,
  payload: CreateSessionSetRequest,
) {
  const session = await getOwnedWorkoutSessionDetail(sessionId, userId)

  if (!session) {
    throw new ApiError(404, SESSION_ERRORS.sessionNotFound.code, SESSION_ERRORS.sessionNotFound.message)
  }

  if (session.status !== 'ACTIVE') {
    throw new ApiError(409, SESSION_ERRORS.sessionNotActive.code, SESSION_ERRORS.sessionNotActive.message)
  }

  await getAccessibleExerciseById(userId, payload.exerciseId)

  const exerciseExistsInPlan = session.planSnapshot.exercises.some(
    (exercise) => exercise.exerciseId === payload.exerciseId,
  )

  if (!exerciseExistsInPlan) {
    throw new ApiError(
      400,
      SESSION_ERRORS.exerciseNotInSessionPlan.code,
      SESSION_ERRORS.exerciseNotInSessionPlan.message,
    )
  }

  const result = await appendOwnedSessionSet(userId, sessionId, payload)

  if (result.kind === 'not_found') {
    throw new ApiError(404, SESSION_ERRORS.sessionNotFound.code, SESSION_ERRORS.sessionNotFound.message)
  }

  if (result.kind === 'not_active') {
    throw new ApiError(409, SESSION_ERRORS.sessionNotActive.code, SESSION_ERRORS.sessionNotActive.message)
  }

  return result.sessionSet
}

export async function completeOwnedWorkoutSession(
  userId: string,
  sessionId: string,
  payload: CompleteSessionRequest,
) {
  const session = await getOwnedWorkoutSessionDetail(sessionId, userId)

  if (!session) {
    throw new ApiError(404, SESSION_ERRORS.sessionNotFound.code, SESSION_ERRORS.sessionNotFound.message)
  }

  if (session.status !== 'ACTIVE') {
    throw new ApiError(409, SESSION_ERRORS.sessionNotActive.code, SESSION_ERRORS.sessionNotActive.message)
  }

  const startedAt = new Date(session.startedAt)
  const completedAt = payload.completedAt ? new Date(payload.completedAt) : new Date()

  if (completedAt.getTime() < startedAt.getTime()) {
    throw new ApiError(
      400,
      SESSION_ERRORS.invalidCompletionTime.code,
      SESSION_ERRORS.invalidCompletionTime.message,
    )
  }

  const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000)
  const result = await completeOwnedWorkoutSessionRecord(userId, sessionId, completedAt, durationSeconds)

  if (result.kind === 'not_found') {
    throw new ApiError(404, SESSION_ERRORS.sessionNotFound.code, SESSION_ERRORS.sessionNotFound.message)
  }

  if (result.kind === 'not_active') {
    throw new ApiError(409, SESSION_ERRORS.sessionNotActive.code, SESSION_ERRORS.sessionNotActive.message)
  }

  return result.session
}
