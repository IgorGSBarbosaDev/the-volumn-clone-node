import type { ExerciseHistoryResponse, ExercisesListResponse, ExercisesQuery, CreateExerciseRequest } from '@the-volumn/shared'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { db } from '../../../config/db.js'
import { ApiError } from '../../../shared/http/api-error.js'

type ExerciseRecord = {
  createdAt: Date
  id: string
  muscleGroup: ExerciseHistoryResponse['exercise']['muscleGroup']
  name: string
  ownerUserId: string | null
  source: ExerciseHistoryResponse['exercise']['source']
  updatedAt: Date
}

type ExerciseHistoryRecord = {
  createdAt: Date
  exercise: {
    muscleGroup: ExerciseHistoryResponse['exercise']['muscleGroup']
    name: string
  }
  exerciseId: string
  id: string
  isPR: boolean
  notes: string | null
  reps: number
  setType: 'NORMAL' | 'FAILURE' | 'DROP_SET'
  weightKg: Prisma.Decimal | number
  workoutSessionId: string
  workoutSession: {
    completedAt: Date | null
  }
}

export async function listExercises(userId: string, query: ExercisesQuery): Promise<ExercisesListResponse> {
  const where: Prisma.ExerciseWhereInput = {
    AND: [
      {
        OR: [{ source: 'DEFAULT' }, { ownerUserId: userId }],
      },
      query.search
        ? {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          }
        : {},
      query.muscleGroup ? { muscleGroup: query.muscleGroup } : {},
      query.source ? { source: query.source } : {},
    ],
  }

  const [items, total] = await Promise.all([
    db.exercise.findMany({
      where,
      orderBy: [{ source: 'asc' }, { name: 'asc' }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    db.exercise.count({ where }),
  ])

  return {
    items: items.map(mapExercise),
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
    },
  }
}

export async function createExercise(userId: string, payload: CreateExerciseRequest) {
  const exercise = await db.exercise.create({
    data: {
      id: randomUUID(),
      ownerUserId: userId,
      name: payload.name,
      muscleGroup: payload.muscleGroup,
      source: 'CUSTOM',
    },
  })

  return mapExercise(exercise)
}

export async function getExerciseHistory(
  userId: string,
  exerciseId: string,
  page: number,
  pageSize: number,
): Promise<ExerciseHistoryResponse> {
  const exercise = await db.exercise.findFirst({
    where: {
      id: exerciseId,
      OR: [{ source: 'DEFAULT' }, { ownerUserId: userId }],
    },
  })

  if (!exercise) {
    throw new ApiError(404, 'EXERCISE_NOT_FOUND', 'Exercise not found')
  }

  const where: Prisma.SessionSetWhereInput = {
    exerciseId,
    setType: {
      in: ['NORMAL', 'FAILURE', 'DROP_SET'],
    },
    workoutSession: {
      ownerUserId: userId,
      status: 'COMPLETED',
    },
  }

  const [items, total] = await Promise.all([
    db.sessionSet.findMany({
      where,
      include: {
        exercise: {
          select: {
            muscleGroup: true,
            name: true,
          },
        },
        workoutSession: {
          select: {
            completedAt: true,
          },
        },
      },
      orderBy: [{ workoutSession: { completedAt: 'desc' } }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.sessionSet.count({ where }),
  ])

  return {
    exercise: mapExercise(exercise),
    items: items.map((entry) => mapExerciseHistoryEntry(entry as ExerciseHistoryRecord)),
    meta: {
      page,
      pageSize,
      total,
    },
  }
}

export async function assertExerciseAccessible(userId: string, exerciseId: string) {
  const exercise = await db.exercise.findFirst({
    where: {
      id: exerciseId,
      OR: [{ source: 'DEFAULT' }, { ownerUserId: userId }],
    },
  })

  if (!exercise) {
    throw new ApiError(404, 'EXERCISE_NOT_FOUND', 'Exercise not found')
  }

  return exercise
}

function mapExercise(exercise: ExerciseRecord) {
  return {
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    source: exercise.source,
    ownerUserId: exercise.ownerUserId,
    createdAt: exercise.createdAt.toISOString(),
    updatedAt: exercise.updatedAt.toISOString(),
  }
}

function mapExerciseHistoryEntry(entry: ExerciseHistoryRecord) {
  const completedAt = entry.workoutSession.completedAt

  if (!completedAt) {
    throw new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Completed session history is invalid')
  }

  const weightKg = Number(entry.weightKg)

  return {
    sessionId: entry.workoutSessionId,
    sessionCompletedAt: completedAt.toISOString(),
    setId: entry.id,
    setType: entry.setType,
    weightKg,
    reps: entry.reps,
    volume: Number((weightKg * entry.reps).toFixed(2)),
    isPR: entry.isPR,
    notes: entry.notes,
  }
}
