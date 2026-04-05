import type {
  AddPlanExerciseRequest,
  CreatePlanSetRequest,
  CreateWorkoutPlanRequest,
  PaginationQuery,
  UpdatePlanSetRequest,
  UpdateWorkoutPlanRequest,
} from '@the-volumn/shared'
import { ApiError } from '../../../shared/http/api-error.js'
import { getAccessibleExerciseById } from '../../exercises/application/exercise-access.service.js'
import { STUDENT_WORKOUT_PLAN_LIMIT, WORKOUT_PLAN_ERRORS } from '../domain/workout-plans.constants.js'
import { hasExactIdSet } from '../domain/workout-plans-order.js'
import {
  addPlanExercise,
  countOwnedWorkoutPlans,
  createPlanSet,
  createWorkoutPlan,
  deletePlanSet,
  deleteWorkoutPlan,
  findOwnedPlanExercise,
  findOwnedPlanSet,
  findOwnedWorkoutPlan,
  findWorkoutPlanOwnerById,
  getWorkoutPlanDetail,
  hasWorkoutSessions,
  listOwnedWorkoutPlans,
  listPlanExercises,
  removePlanExercise,
  reorderPlanExercises as reorderPlanExerciseRecords,
  updatePlanSet,
  updateWorkoutPlan,
} from '../infrastructure/workout-plans.repository.js'

export async function listWorkoutPlans(userId: string, pagination: PaginationQuery) {
  return listOwnedWorkoutPlans(userId, pagination)
}

export async function createOwnedWorkoutPlan(userId: string, payload: CreateWorkoutPlanRequest) {
  const owner = await findWorkoutPlanOwnerById(userId)

  if (!owner) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.userNotFound.code, WORKOUT_PLAN_ERRORS.userNotFound.message)
  }

  if (owner.role === 'STUDENT') {
    const totalPlans = await countOwnedWorkoutPlans(userId)

    if (totalPlans >= STUDENT_WORKOUT_PLAN_LIMIT) {
      throw new ApiError(403, WORKOUT_PLAN_ERRORS.limitReached.code, WORKOUT_PLAN_ERRORS.limitReached.message)
    }
  }

  const workoutPlan = await createWorkoutPlan(userId, payload)
  const detail = await getWorkoutPlanDetail(workoutPlan.id, userId)

  if (!detail) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  return detail
}

export async function getOwnedWorkoutPlanDetail(userId: string, planId: string) {
  const workoutPlan = await getWorkoutPlanDetail(planId, userId)

  if (!workoutPlan) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  return workoutPlan
}

export async function updateOwnedWorkoutPlan(userId: string, planId: string, payload: UpdateWorkoutPlanRequest) {
  const workoutPlan = await findOwnedWorkoutPlan(planId, userId)

  if (!workoutPlan) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  await updateWorkoutPlan(planId, payload)

  const detail = await getWorkoutPlanDetail(planId, userId)

  if (!detail) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  return detail
}

export async function deleteOwnedWorkoutPlan(userId: string, planId: string) {
  const workoutPlan = await findOwnedWorkoutPlan(planId, userId)

  if (!workoutPlan) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  if (await hasWorkoutSessions(planId)) {
    throw new ApiError(
      409,
      WORKOUT_PLAN_ERRORS.planReferencedBySessions.code,
      WORKOUT_PLAN_ERRORS.planReferencedBySessions.message,
    )
  }

  await deleteWorkoutPlan(planId)
}

export async function addOwnedPlanExercise(userId: string, planId: string, payload: AddPlanExerciseRequest) {
  const workoutPlan = await findOwnedWorkoutPlan(planId, userId)

  if (!workoutPlan) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  const exercise = await getAccessibleExerciseById(userId, payload.exerciseId)
  await addPlanExercise(planId, exercise.id)

  const detail = await getWorkoutPlanDetail(planId, userId)

  if (!detail) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  return detail
}

export async function removeOwnedPlanExercise(userId: string, planId: string, planExerciseId: string) {
  const { plan, planExercise } = await findOwnedPlanExercise(planExerciseId, planId, userId)

  if (!plan) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  if (!planExercise) {
    throw new ApiError(
      404,
      WORKOUT_PLAN_ERRORS.planExerciseNotFound.code,
      WORKOUT_PLAN_ERRORS.planExerciseNotFound.message,
    )
  }

  await removePlanExercise(planExerciseId, planId)
}

export async function reorderOwnedPlanExercises(userId: string, planId: string, orderedPlanExerciseIds: string[]) {
  const workoutPlan = await findOwnedWorkoutPlan(planId, userId)

  if (!workoutPlan) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  const planExercises = await listPlanExercises(planId)

  if (!hasExactIdSet(planExercises.map((planExercise) => planExercise.id), orderedPlanExerciseIds)) {
    throw new ApiError(
      400,
      WORKOUT_PLAN_ERRORS.invalidExerciseOrder.code,
      WORKOUT_PLAN_ERRORS.invalidExerciseOrder.message,
    )
  }

  await reorderPlanExerciseRecords(planId, orderedPlanExerciseIds)

  const detail = await getWorkoutPlanDetail(planId, userId)

  if (!detail) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  return detail
}

export async function createOwnedPlanSet(
  userId: string,
  planId: string,
  planExerciseId: string,
  payload: CreatePlanSetRequest,
) {
  const { plan, planExercise } = await findOwnedPlanExercise(planExerciseId, planId, userId)

  if (!plan) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  if (!planExercise) {
    throw new ApiError(
      404,
      WORKOUT_PLAN_ERRORS.planExerciseNotFound.code,
      WORKOUT_PLAN_ERRORS.planExerciseNotFound.message,
    )
  }

  await createPlanSet(planExerciseId, payload, planId)

  const detail = await getWorkoutPlanDetail(planId, userId)

  if (!detail) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planNotFound.code, WORKOUT_PLAN_ERRORS.planNotFound.message)
  }

  return detail
}

export async function updateOwnedPlanSet(userId: string, setId: string, payload: UpdatePlanSetRequest) {
  const ownedPlanSet = await findOwnedPlanSet(setId, userId)

  if (!ownedPlanSet) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planSetNotFound.code, WORKOUT_PLAN_ERRORS.planSetNotFound.message)
  }

  return updatePlanSet(setId, payload, ownedPlanSet.workoutPlan.id)
}

export async function deleteOwnedPlanSet(userId: string, setId: string) {
  const ownedPlanSet = await findOwnedPlanSet(setId, userId)

  if (!ownedPlanSet) {
    throw new ApiError(404, WORKOUT_PLAN_ERRORS.planSetNotFound.code, WORKOUT_PLAN_ERRORS.planSetNotFound.message)
  }

  await deletePlanSet(setId, ownedPlanSet.planExercise.id, ownedPlanSet.workoutPlan.id)
}
