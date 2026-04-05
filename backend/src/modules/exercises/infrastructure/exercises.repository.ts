import type {
  CreateExerciseRequest,
  Exercise,
  ExerciseHistoryEntry,
  ExercisesListResponse,
  ExercisesQuery,
  PaginatedMeta,
  PaginationQuery,
  SetType,
} from '@the-volumn/shared'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { db } from '../../../config/db.js'
import { EXERCISE_HISTORY_SET_TYPES } from '../domain/exercises.constants.js'

type ExerciseRecord = {
  id: string
  ownerUserId: string | null
  name: string
  muscleGroup: Exercise['muscleGroup']
  source: Exercise['source']
  createdAt: Date
  updatedAt: Date
}

type WorkoutSessionRecord = {
  id: string
  completedAt: Date | null
}

type NumberLike = number | Prisma.Decimal

type SessionSetRecord = {
  id: string
  workoutSessionId: string
  setType: SetType
  weightKg: NumberLike
  reps: number
  notes: string | null
  isPR: boolean
  createdAt: Date
}

export async function findExerciseById(exerciseId: string) {
  const exercise = await db.exercise.findFirst({
    where: {
      id: exerciseId,
    },
  })

  return exercise ? mapExercise(exercise) : null
}

export async function listAccessibleExercises(userId: string, query: ExercisesQuery): Promise<ExercisesListResponse> {
  const where = buildAccessibleExerciseWhere(userId, query)

  const [total, items] = await Promise.all([
    db.exercise.count({ where }),
    db.exercise.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ])

  return {
    items: items.map(mapExercise),
    meta: mapPaginatedMeta(total, query),
  }
}

export async function createCustomExercise(userId: string, payload: CreateExerciseRequest) {
  const now = new Date()

  const exercise = await db.exercise.create({
    data: {
      id: randomUUID(),
      ownerUserId: userId,
      name: payload.name,
      muscleGroup: payload.muscleGroup,
      source: 'CUSTOM',
      createdAt: now,
      updatedAt: now,
    },
  })

  return mapExercise(exercise)
}

export async function listExerciseHistoryEntries(userId: string, exerciseId: string, pagination: PaginationQuery) {
  const completedSessions = await db.workoutSession.findMany({
    where: {
      ownerUserId: userId,
      status: 'COMPLETED',
    },
  })

  if (completedSessions.length === 0) {
    return {
      items: [] satisfies ExerciseHistoryEntry[],
      meta: mapPaginatedMeta(0, pagination),
    }
  }

  const sessionsById = new Map<string, WorkoutSessionRecord>()

  for (const session of completedSessions) {
    sessionsById.set(session.id, session)
  }

  const sessionSets = await db.sessionSet.findMany({
    where: {
      exerciseId,
      workoutSessionId: {
        in: completedSessions.map((session) => session.id),
      },
      setType: {
        in: [...EXERCISE_HISTORY_SET_TYPES],
      },
    },
  })

  const items = sessionSets
    .map((sessionSet) => mapExerciseHistoryEntry(sessionSet, sessionsById))
    .filter((entry): entry is { createdAt: Date; item: ExerciseHistoryEntry } => entry !== null)
    .sort((left, right) => {
      const completedAtDifference =
        new Date(right.item.sessionCompletedAt).getTime() - new Date(left.item.sessionCompletedAt).getTime()

      if (completedAtDifference !== 0) {
        return completedAtDifference
      }

      return right.createdAt.getTime() - left.createdAt.getTime()
    })
    .map((entry) => entry.item)

  const start = (pagination.page - 1) * pagination.pageSize

  return {
    items: items.slice(start, start + pagination.pageSize),
    meta: mapPaginatedMeta(items.length, pagination),
  }
}

function buildAccessibleExerciseWhere(userId: string, query: ExercisesQuery): Prisma.ExerciseWhereInput {
  const where: Prisma.ExerciseWhereInput =
    query.source === 'DEFAULT'
      ? {
          source: 'DEFAULT',
        }
      : query.source === 'CUSTOM'
        ? {
            source: 'CUSTOM',
            ownerUserId: userId,
          }
        : {
            OR: [
              {
                source: 'DEFAULT',
              },
              {
                source: 'CUSTOM',
                ownerUserId: userId,
              },
            ],
          }

  if (query.muscleGroup) {
    where.muscleGroup = query.muscleGroup
  }

  if (query.search) {
    where.name = {
      contains: query.search,
      mode: 'insensitive',
    }
  }

  return where
}

function mapExercise(exercise: ExerciseRecord): Exercise {
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

function mapExerciseHistoryEntry(
  sessionSet: SessionSetRecord,
  sessionsById: Map<string, WorkoutSessionRecord>,
): { createdAt: Date; item: ExerciseHistoryEntry } | null {
  const session = sessionsById.get(sessionSet.workoutSessionId)

  if (!session?.completedAt) {
    return null
  }

  if (!EXERCISE_HISTORY_SET_TYPES.includes(sessionSet.setType as (typeof EXERCISE_HISTORY_SET_TYPES)[number])) {
    return null
  }

  const weightKg = toNumber(sessionSet.weightKg)
  const setType = sessionSet.setType as ExerciseHistoryEntry['setType']

  return {
    createdAt: sessionSet.createdAt,
    item: {
      sessionId: sessionSet.workoutSessionId,
      sessionCompletedAt: session.completedAt.toISOString(),
      setId: sessionSet.id,
      setType,
      weightKg,
      reps: sessionSet.reps,
      volume: Number((weightKg * sessionSet.reps).toFixed(2)),
      isPR: sessionSet.isPR,
      notes: sessionSet.notes,
    },
  }
}

function mapPaginatedMeta(total: number, pagination: PaginationQuery): PaginatedMeta {
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
  }
}

function toNumber(value: NumberLike) {
  return typeof value === 'number' ? value : value.toNumber()
}
