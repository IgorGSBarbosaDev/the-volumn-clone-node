import type {
  PaginatedMeta,
  PaginationQuery,
  PlanSet,
  WorkoutPlanDetail,
  WorkoutPlanSummary,
} from '@the-volumn/shared'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { db } from '../../../config/db.js'

type WorkoutPlanRecord = {
  id: string
  ownerUserId: string
  name: string
  accent: string | null
  focusLabel: string | null
  createdAt: Date
  updatedAt: Date
}

type PlanExerciseRecord = {
  id: string
  workoutPlanId: string
  exerciseId: string
  order: number
}

type PlanSetRecord = {
  id: string
  planExerciseId: string
  order: number
  setType: PlanSet['setType']
  targetReps: number | null
  targetLoadKg: NumberLike | null
  notes: string | null
}

type ExerciseRecord = {
  id: string
  name: string
  muscleGroup: WorkoutPlanDetail['exercises'][number]['muscleGroup']
}

type NumberLike = number | { toNumber(): number }
type TransactionClient = Prisma.TransactionClient

export async function findWorkoutPlanOwnerById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
  })
}

export async function countOwnedWorkoutPlans(userId: string) {
  return db.workoutPlan.count({
    where: {
      ownerUserId: userId,
    },
  })
}

export async function listOwnedWorkoutPlans(userId: string, pagination: PaginationQuery) {
  const [total, plans] = await Promise.all([
    db.workoutPlan.count({
      where: {
        ownerUserId: userId,
      },
    }),
    db.workoutPlan.findMany({
      where: {
        ownerUserId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
  ])

  const planIds = plans.map((plan) => plan.id)
  const planExercises =
    planIds.length > 0
      ? await db.planExercise.findMany({
          where: {
            workoutPlanId: {
              in: planIds,
            },
          },
        })
      : []

  const exerciseCountByPlanId = new Map<string, number>()

  for (const planExercise of planExercises) {
    exerciseCountByPlanId.set(
      planExercise.workoutPlanId,
      (exerciseCountByPlanId.get(planExercise.workoutPlanId) ?? 0) + 1,
    )
  }

  return {
    items: plans.map((plan) => mapWorkoutPlanSummary(plan, exerciseCountByPlanId.get(plan.id) ?? 0)),
    meta: mapPaginatedMeta(total, pagination),
  }
}

export async function createWorkoutPlan(userId: string, data: { accent?: string | null; focusLabel?: string | null; name: string }) {
  const now = new Date()

  return db.workoutPlan.create({
    data: {
      id: randomUUID(),
      ownerUserId: userId,
      name: data.name,
      accent: data.accent ?? null,
      focusLabel: data.focusLabel ?? null,
      createdAt: now,
      updatedAt: now,
    },
  })
}

export async function findOwnedWorkoutPlan(planId: string, ownerUserId: string) {
  return db.workoutPlan.findFirst({
    where: {
      id: planId,
      ownerUserId,
    },
  })
}

export async function updateWorkoutPlan(
  planId: string,
  data: { accent?: string | null; focusLabel?: string | null; name?: string },
) {
  return db.workoutPlan.update({
    where: {
      id: planId,
    },
    data,
  })
}

export async function deleteWorkoutPlan(planId: string) {
  return db.workoutPlan.delete({
    where: {
      id: planId,
    },
  })
}

export async function getWorkoutPlanDetail(planId: string, ownerUserId: string): Promise<WorkoutPlanDetail | null> {
  const workoutPlan = await findOwnedWorkoutPlan(planId, ownerUserId)

  if (!workoutPlan) {
    return null
  }

  return mapWorkoutPlanDetail(workoutPlan)
}

export async function addPlanExercise(planId: string, exerciseId: string) {
  const now = new Date()
  const order = await db.planExercise.count({
    where: {
      workoutPlanId: planId,
    },
  })

  return db.$transaction(async (tx) => {
    const planExercise = await tx.planExercise.create({
      data: {
        id: randomUUID(),
        workoutPlanId: planId,
        exerciseId,
        order,
      },
    })

    await touchWorkoutPlan(planId, tx, now)

    return planExercise
  })
}

export async function findOwnedPlanExercise(planExerciseId: string, planId: string, ownerUserId: string) {
  const workoutPlan = await findOwnedWorkoutPlan(planId, ownerUserId)

  if (!workoutPlan) {
    return { plan: null, planExercise: null }
  }

  const planExercise = await db.planExercise.findFirst({
    where: {
      id: planExerciseId,
      workoutPlanId: planId,
    },
  })

  return {
    plan: workoutPlan,
    planExercise,
  }
}

export async function listPlanExercises(planId: string) {
  return db.planExercise.findMany({
    where: {
      workoutPlanId: planId,
    },
    orderBy: {
      order: 'asc',
    },
  })
}

export async function removePlanExercise(planExerciseId: string, planId: string) {
  const now = new Date()

  return db.$transaction(async (tx) => {
    await tx.planExercise.delete({
      where: {
        id: planExerciseId,
      },
    })

    await compactPlanExerciseOrder(planId, tx)
    await touchWorkoutPlan(planId, tx, now)
  })
}

export async function reorderPlanExercises(planId: string, orderedPlanExerciseIds: string[]) {
  const now = new Date()

  await db.$transaction(async (tx) => {
    for (const [order, planExerciseId] of orderedPlanExerciseIds.entries()) {
      await tx.planExercise.update({
        where: {
          id: planExerciseId,
        },
        data: {
          order,
        },
      })
    }

    await touchWorkoutPlan(planId, tx, now)
  })
}

export async function createPlanSet(
  planExerciseId: string,
  data: { notes?: string | null; setType: PlanSet['setType']; targetLoadKg?: number | null; targetReps?: number | null },
  planId: string,
) {
  const now = new Date()
  const order = await db.planSet.count({
    where: {
      planExerciseId,
    },
  })

  return db.$transaction(async (tx) => {
    const planSet = await tx.planSet.create({
      data: {
        id: randomUUID(),
        planExerciseId,
        order,
        setType: data.setType,
        targetReps: data.targetReps ?? null,
        targetLoadKg: data.targetLoadKg ?? null,
        notes: data.notes ?? null,
      },
    })

    await touchWorkoutPlan(planId, tx, now)

    return mapPlanSet(planSet)
  })
}

export async function findOwnedPlanSet(setId: string, ownerUserId: string) {
  const planSet = await db.planSet.findFirst({
    where: {
      id: setId,
    },
  })

  if (!planSet) {
    return null
  }

  const planExercise = await db.planExercise.findFirst({
    where: {
      id: planSet.planExerciseId,
    },
  })

  if (!planExercise) {
    return null
  }

  const workoutPlan = await findOwnedWorkoutPlan(planExercise.workoutPlanId, ownerUserId)

  if (!workoutPlan) {
    return null
  }

  return {
    planExercise,
    planSet,
    workoutPlan,
  }
}

export async function updatePlanSet(
  setId: string,
  data: { notes?: string | null; setType?: PlanSet['setType']; targetLoadKg?: number | null; targetReps?: number | null },
  planId: string,
) {
  const now = new Date()

  return db.$transaction(async (tx) => {
    const updatedPlanSet = await tx.planSet.update({
      where: {
        id: setId,
      },
      data,
    })

    await touchWorkoutPlan(planId, tx, now)

    return mapPlanSet(updatedPlanSet)
  })
}

export async function deletePlanSet(setId: string, planExerciseId: string, planId: string) {
  const now = new Date()

  await db.$transaction(async (tx) => {
    await tx.planSet.delete({
      where: {
        id: setId,
      },
    })

    await compactPlanSetOrder(planExerciseId, tx)
    await touchWorkoutPlan(planId, tx, now)
  })
}

async function mapWorkoutPlanDetail(workoutPlan: WorkoutPlanRecord): Promise<WorkoutPlanDetail> {
  const planExercises = await db.planExercise.findMany({
    where: {
      workoutPlanId: workoutPlan.id,
    },
    orderBy: {
      order: 'asc',
    },
  })

  const setsByPlanExerciseId = await getPlanSetsByExerciseId(planExercises.map((planExercise) => planExercise.id))
  const exercisesById = await getExercisesById(planExercises.map((planExercise) => planExercise.exerciseId))

  return {
    ...mapWorkoutPlanSummary(workoutPlan, planExercises.length),
    exercises: planExercises.map((planExercise) => {
      const exercise = exercisesById.get(planExercise.exerciseId)

      if (!exercise) {
        throw new Error(`Exercise ${planExercise.exerciseId} not found for plan exercise ${planExercise.id}`)
      }

      return {
        id: planExercise.id,
        order: planExercise.order,
        exerciseId: planExercise.exerciseId,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
        sets: setsByPlanExerciseId.get(planExercise.id) ?? [],
      }
    }),
  }
}

async function getPlanSetsByExerciseId(planExerciseIds: string[]) {
  if (planExerciseIds.length === 0) {
    return new Map<string, PlanSet[]>()
  }

  const planSets = await db.planSet.findMany({
    where: {
      planExerciseId: {
        in: planExerciseIds,
      },
    },
    orderBy: {
      order: 'asc',
    },
  })

  const setsByPlanExerciseId = new Map<string, PlanSet[]>()

  for (const planSet of planSets) {
    const mappedPlanSet = mapPlanSet(planSet)
    const existingPlanSets = setsByPlanExerciseId.get(planSet.planExerciseId) ?? []
    existingPlanSets.push(mappedPlanSet)
    setsByPlanExerciseId.set(planSet.planExerciseId, existingPlanSets)
  }

  return setsByPlanExerciseId
}

async function getExercisesById(exerciseIds: string[]) {
  const exercisesById = new Map<string, ExerciseRecord>()

  for (const exerciseId of exerciseIds) {
    if (exercisesById.has(exerciseId)) {
      continue
    }

    const exercise = await db.exercise.findFirst({
      where: {
        id: exerciseId,
      },
    })

    if (exercise) {
      exercisesById.set(exercise.id, exercise)
    }
  }

  return exercisesById
}

function mapWorkoutPlanSummary(workoutPlan: WorkoutPlanRecord, exerciseCount: number): WorkoutPlanSummary {
  return {
    id: workoutPlan.id,
    name: workoutPlan.name,
    accent: workoutPlan.accent as WorkoutPlanSummary['accent'],
    focusLabel: workoutPlan.focusLabel,
    exerciseCount,
    createdAt: workoutPlan.createdAt.toISOString(),
    updatedAt: workoutPlan.updatedAt.toISOString(),
  }
}

function mapPlanSet(planSet: PlanSetRecord): PlanSet {
  return {
    id: planSet.id,
    order: planSet.order,
    setType: planSet.setType,
    targetReps: planSet.targetReps,
    targetLoadKg: toNumber(planSet.targetLoadKg),
    notes: planSet.notes,
  }
}

function mapPaginatedMeta(total: number, pagination: PaginationQuery): PaginatedMeta {
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
  }
}

function toNumber(value: NumberLike | null) {
  if (value === null) {
    return null
  }

  return typeof value === 'number' ? value : value.toNumber()
}

async function compactPlanExerciseOrder(planId: string, tx: TransactionClient) {
  const remainingPlanExercises = await tx.planExercise.findMany({
    where: {
      workoutPlanId: planId,
    },
    orderBy: {
      order: 'asc',
    },
  })

  for (const [order, planExercise] of remainingPlanExercises.entries()) {
    if (planExercise.order !== order) {
      await tx.planExercise.update({
        where: {
          id: planExercise.id,
        },
        data: {
          order,
        },
      })
    }
  }
}

async function compactPlanSetOrder(planExerciseId: string, tx: TransactionClient) {
  const remainingPlanSets = await tx.planSet.findMany({
    where: {
      planExerciseId,
    },
    orderBy: {
      order: 'asc',
    },
  })

  for (const [order, planSet] of remainingPlanSets.entries()) {
    if (planSet.order !== order) {
      await tx.planSet.update({
        where: {
          id: planSet.id,
        },
        data: {
          order,
        },
      })
    }
  }
}

async function touchWorkoutPlan(planId: string, tx: TransactionClient, updatedAt: Date) {
  await tx.workoutPlan.update({
    where: {
      id: planId,
    },
    data: {
      updatedAt,
    },
  })
}
