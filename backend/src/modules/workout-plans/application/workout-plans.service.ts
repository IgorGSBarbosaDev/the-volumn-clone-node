import type {
  AddPlanExerciseRequest,
  CreatePlanSetRequest,
  CreateWorkoutPlanRequest,
  PaginationQuery,
  PlanExercise,
  PlanSet,
  ReorderPlanExercisesRequest,
  UpdatePlanSetRequest,
  UpdateWorkoutPlanRequest,
  WorkoutPlanDetail,
  WorkoutPlanListResponse,
} from '@the-volumn/shared'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { db } from '../../../config/db.js'
import { ApiError } from '../../../shared/http/api-error.js'
import { assertExerciseAccessible } from '../../exercises/application/exercises.service.js'

type TransactionDb = Prisma.TransactionClient

type WorkoutPlanRecord = {
  accent: string | null
  createdAt: Date
  exercises: WorkoutPlanExerciseRecord[]
  focusLabel: string | null
  id: string
  name: string
  updatedAt: Date
}

type WorkoutPlanExerciseRecord = {
  exercise: {
    id: string
    muscleGroup: PlanExercise['muscleGroup']
    name: string
  }
  exerciseId: string
  id: string
  order: number
  sets: WorkoutPlanSetRecord[]
}

type WorkoutPlanSetRecord = {
  id: string
  notes: string | null
  order: number
  setType: PlanSet['setType']
  targetLoadKg: Prisma.Decimal | number | null
  targetReps: number | null
}

const planDetailInclude = {
  exercises: {
    include: {
      exercise: true,
      sets: {
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  },
} satisfies Prisma.WorkoutPlanInclude

export async function listWorkoutPlans(
  userId: string,
  pagination: PaginationQuery,
): Promise<WorkoutPlanListResponse> {
  const where = { ownerUserId: userId }
  const [items, total] = await Promise.all([
    db.workoutPlan.findMany({
      where,
      include: planDetailInclude,
      orderBy: [{ updatedAt: 'desc' }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    db.workoutPlan.count({ where }),
  ])

  return {
    items: items.map(mapWorkoutPlanSummary),
    meta: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
    },
  }
}

export async function createWorkoutPlan(userId: string, payload: CreateWorkoutPlanRequest): Promise<WorkoutPlanDetail> {
  await enforceWorkoutPlanCreationLimit(userId)

  const plan = await db.workoutPlan.create({
    data: {
      id: randomUUID(),
      ownerUserId: userId,
      name: payload.name,
      accent: payload.accent ?? null,
      focusLabel: payload.focusLabel ?? null,
    },
    include: planDetailInclude,
  })

  return mapWorkoutPlanDetail(plan)
}

export async function getWorkoutPlanDetail(userId: string, planId: string): Promise<WorkoutPlanDetail> {
  const plan = await findOwnedWorkoutPlan(userId, planId)
  return mapWorkoutPlanDetail(plan)
}

export async function updateWorkoutPlan(
  userId: string,
  planId: string,
  payload: UpdateWorkoutPlanRequest,
): Promise<WorkoutPlanDetail> {
  await ensurePlanOwnedAndMutable(userId, planId)

  const plan = await db.workoutPlan.update({
    where: { id: planId },
    data: {
      name: payload.name,
      accent: typeof payload.accent === 'undefined' ? undefined : payload.accent,
      focusLabel: typeof payload.focusLabel === 'undefined' ? undefined : payload.focusLabel,
    },
    include: planDetailInclude,
  })

  return mapWorkoutPlanDetail(plan)
}

export async function deleteWorkoutPlan(userId: string, planId: string) {
  await ensurePlanOwnedAndMutable(userId, planId)
  await db.workoutPlan.delete({
    where: { id: planId },
  })
}

export async function addPlanExercise(
  userId: string,
  planId: string,
  payload: AddPlanExerciseRequest,
): Promise<WorkoutPlanDetail> {
  await ensurePlanOwnedAndMutable(userId, planId)
  await assertExerciseAccessible(userId, payload.exerciseId)

  await db.$transaction(async (tx) => {
    const lastEntry = await tx.planExercise.findFirst({
      where: { workoutPlanId: planId },
      orderBy: { order: 'desc' },
    })

    await tx.planExercise.create({
      data: {
        id: randomUUID(),
        workoutPlanId: planId,
        exerciseId: payload.exerciseId,
        order: (lastEntry?.order ?? -1) + 1,
      },
    })
  })

  return getWorkoutPlanDetail(userId, planId)
}

export async function removePlanExercise(userId: string, planId: string, planExerciseId: string) {
  await ensurePlanOwnedAndMutable(userId, planId)

  const planExercise = await db.planExercise.findFirst({
    where: {
      id: planExerciseId,
      workoutPlanId: planId,
      workoutPlan: {
        ownerUserId: userId,
      },
    },
  })

  if (!planExercise) {
    throw new ApiError(404, 'PLAN_EXERCISE_NOT_FOUND', 'Plan exercise not found')
  }

  await db.$transaction(async (tx) => {
    await tx.planExercise.delete({
      where: { id: planExerciseId },
    })

    const remainingEntries = await tx.planExercise.findMany({
      where: { workoutPlanId: planId },
      orderBy: { order: 'asc' },
    })

    await resetPlanExerciseOrders(tx, remainingEntries.map((entry) => entry.id))
  })
}

export async function reorderPlanExercises(
  userId: string,
  planId: string,
  payload: ReorderPlanExercisesRequest,
): Promise<WorkoutPlanDetail> {
  await ensurePlanOwnedAndMutable(userId, planId)

  const existingEntries = await db.planExercise.findMany({
    where: {
      workoutPlanId: planId,
      workoutPlan: {
        ownerUserId: userId,
      },
    },
    orderBy: { order: 'asc' },
  })

  const existingIds = existingEntries.map((entry) => entry.id)
  const orderedIds = payload.orderedPlanExerciseIds

  if (
    existingIds.length !== orderedIds.length ||
    existingIds.some((id) => !orderedIds.includes(id)) ||
    new Set(orderedIds).size !== orderedIds.length
  ) {
    throw new ApiError(400, 'INVALID_PLAN_EXERCISE_ORDER', 'Plan exercise order must match the current plan exercises')
  }

  await db.$transaction(async (tx) => {
    await resetPlanExerciseOrders(tx, orderedIds)
  })

  return getWorkoutPlanDetail(userId, planId)
}

export async function createPlanSet(
  userId: string,
  planId: string,
  planExerciseId: string,
  payload: CreatePlanSetRequest,
): Promise<PlanSet> {
  await ensurePlanOwnedAndMutable(userId, planId)

  const planExercise = await db.planExercise.findFirst({
    where: {
      id: planExerciseId,
      workoutPlanId: planId,
      workoutPlan: {
        ownerUserId: userId,
      },
    },
    include: {
      sets: {
        orderBy: {
          order: 'desc',
        },
        take: 1,
      },
    },
  })

  if (!planExercise) {
    throw new ApiError(404, 'PLAN_EXERCISE_NOT_FOUND', 'Plan exercise not found')
  }

  const planSet = await db.planSet.create({
    data: {
      id: randomUUID(),
      planExerciseId,
      order: (planExercise.sets[0]?.order ?? -1) + 1,
      setType: payload.setType,
      targetReps: payload.targetReps ?? null,
      targetLoadKg: typeof payload.targetLoadKg === 'undefined' ? null : payload.targetLoadKg,
      notes: payload.notes ?? null,
    },
  })

  return mapPlanSet(planSet)
}

export async function updatePlanSet(userId: string, setId: string, payload: UpdatePlanSetRequest): Promise<PlanSet> {
  const planSet = await db.planSet.findFirst({
    where: {
      id: setId,
      planExercise: {
        workoutPlan: {
          ownerUserId: userId,
        },
      },
    },
    include: {
      planExercise: {
        select: {
          workoutPlanId: true,
        },
      },
    },
  })

  if (!planSet) {
    throw new ApiError(404, 'PLAN_SET_NOT_FOUND', 'Plan set not found')
  }

  await ensurePlanOwnedAndMutable(userId, planSet.planExercise.workoutPlanId)

  const updatedPlanSet = await db.planSet.update({
    where: { id: setId },
    data: {
      setType: payload.setType,
      targetReps: typeof payload.targetReps === 'undefined' ? undefined : payload.targetReps,
      targetLoadKg: typeof payload.targetLoadKg === 'undefined' ? undefined : payload.targetLoadKg,
      notes: typeof payload.notes === 'undefined' ? undefined : payload.notes,
    },
  })

  return mapPlanSet(updatedPlanSet)
}

export async function deletePlanSet(userId: string, setId: string) {
  const planSet = await db.planSet.findFirst({
    where: {
      id: setId,
      planExercise: {
        workoutPlan: {
          ownerUserId: userId,
        },
      },
    },
    include: {
      planExercise: {
        select: {
          id: true,
          workoutPlanId: true,
        },
      },
    },
  })

  if (!planSet) {
    throw new ApiError(404, 'PLAN_SET_NOT_FOUND', 'Plan set not found')
  }

  await ensurePlanOwnedAndMutable(userId, planSet.planExercise.workoutPlanId)

  await db.$transaction(async (tx) => {
    await tx.planSet.delete({
      where: { id: setId },
    })

    const remainingSets = await tx.planSet.findMany({
      where: { planExerciseId: planSet.planExercise.id },
      orderBy: { order: 'asc' },
    })

    await resetPlanSetOrders(tx, remainingSets.map((entry) => entry.id))
  })
}

async function enforceWorkoutPlanCreationLimit(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
    },
  })

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  if (user.role !== 'STUDENT') {
    return
  }

  const planCount = await db.workoutPlan.count({
    where: { ownerUserId: userId },
  })

  if (planCount >= 5) {
    throw new ApiError(409, 'WORKOUT_PLAN_LIMIT_REACHED', 'Student workout plan limit reached')
  }
}

async function findOwnedWorkoutPlan(userId: string, planId: string) {
  const plan = await db.workoutPlan.findFirst({
    where: {
      id: planId,
      ownerUserId: userId,
    },
    include: planDetailInclude,
  })

  if (!plan) {
    throw new ApiError(404, 'WORKOUT_PLAN_NOT_FOUND', 'Workout plan not found')
  }

  return plan
}

async function ensurePlanOwnedAndMutable(userId: string, planId: string) {
  await findOwnedWorkoutPlan(userId, planId)

  const activeSession = await db.workoutSession.findFirst({
    where: {
      ownerUserId: userId,
      workoutPlanId: planId,
      status: 'ACTIVE',
    },
  })

  if (activeSession) {
    throw new ApiError(409, 'WORKOUT_PLAN_LOCKED', 'Workout plan cannot change while a session is active')
  }
}

async function resetPlanExerciseOrders(tx: TransactionDb, orderedIds: string[]) {
  for (let index = 0; index < orderedIds.length; index += 1) {
    await tx.planExercise.update({
      where: { id: orderedIds[index]! },
      data: {
        order: index + orderedIds.length + 100,
      },
    })
  }

  for (let index = 0; index < orderedIds.length; index += 1) {
    await tx.planExercise.update({
      where: { id: orderedIds[index]! },
      data: {
        order: index,
      },
    })
  }
}

async function resetPlanSetOrders(tx: TransactionDb, orderedIds: string[]) {
  for (let index = 0; index < orderedIds.length; index += 1) {
    await tx.planSet.update({
      where: { id: orderedIds[index]! },
      data: {
        order: index + orderedIds.length + 100,
      },
    })
  }

  for (let index = 0; index < orderedIds.length; index += 1) {
    await tx.planSet.update({
      where: { id: orderedIds[index]! },
      data: {
        order: index,
      },
    })
  }
}

function mapWorkoutPlanSummary(plan: WorkoutPlanRecord) {
  const muscleGroups = [...new Set(plan.exercises.map((exercise) => exercise.exercise.muscleGroup))]
  const totalPlannedSets = plan.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)

  return {
    id: plan.id,
    name: plan.name,
    accent: normalizeAccent(plan.accent),
    focusLabel: plan.focusLabel,
    exerciseCount: plan.exercises.length,
    muscleGroups,
    totalPlannedSets,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  }
}

function mapWorkoutPlanDetail(plan: WorkoutPlanRecord): WorkoutPlanDetail {
  return {
    ...mapWorkoutPlanSummary(plan),
    exercises: plan.exercises.map(mapPlanExercise),
  }
}

function mapPlanExercise(planExercise: WorkoutPlanExerciseRecord): PlanExercise {
  return {
    id: planExercise.id,
    order: planExercise.order,
    exerciseId: planExercise.exerciseId,
    exerciseName: planExercise.exercise.name,
    muscleGroup: planExercise.exercise.muscleGroup,
    sets: planExercise.sets.map(mapPlanSet),
  }
}

function mapPlanSet(planSet: WorkoutPlanSetRecord): PlanSet {
  return {
    id: planSet.id,
    order: planSet.order,
    setType: planSet.setType,
    targetReps: planSet.targetReps,
    targetLoadKg: planSet.targetLoadKg === null ? null : Number(planSet.targetLoadKg),
    notes: planSet.notes,
  }
}

function normalizeAccent(accent: string | null) {
  if (!accent) {
    return null
  }

  switch (accent) {
    case 'rose':
    case 'green':
    case 'black':
    case 'blue':
    case 'amber':
    case 'violet':
      return accent
    default:
      return null
  }
}
