import type {
  CompleteSessionRequest,
  CreateSessionSetRequest,
  PaginationQuery,
  SessionSet,
  WorkoutSessionDetail,
  WorkoutSessionSummary,
  SessionsListResponse,
  StartSessionRequest,
} from '@the-volumn/shared'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { db } from '../../../config/db.js'
import { ApiError } from '../../../shared/http/api-error.js'

type SessionSetRecord = {
  createdAt: Date
  exercise: {
    muscleGroup: SessionSet['muscleGroup']
    name: string
  }
  exerciseId: string
  id: string
  isPR: boolean
  notes: string | null
  reps: number
  setType: SessionSet['setType']
  weightKg: Prisma.Decimal | number
}

type WorkoutSessionRecord = {
  completedAt: Date | null
  durationSeconds: number | null
  id: string
  sets: SessionSetRecord[]
  startedAt: Date
  status: WorkoutSessionSummary['status']
  workoutPlan: {
    id: string
    name: string
  }
}

const eligiblePrSetTypes = ['NORMAL', 'FAILURE', 'DROP_SET'] as const

const sessionInclude = {
  sets: {
    include: {
      exercise: {
        select: {
          muscleGroup: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
  workoutPlan: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.WorkoutSessionInclude

export async function startSession(userId: string, payload: StartSessionRequest): Promise<WorkoutSessionDetail> {
  const plan = await db.workoutPlan.findFirst({
    where: {
      id: payload.workoutPlanId,
      ownerUserId: userId,
    },
  })

  if (!plan) {
    throw new ApiError(404, 'WORKOUT_PLAN_NOT_FOUND', 'Workout plan not found')
  }

  const activeSession = await db.workoutSession.findFirst({
    where: {
      ownerUserId: userId,
      status: 'ACTIVE',
    },
  })

  if (activeSession) {
    throw new ApiError(409, 'ACTIVE_SESSION_EXISTS', 'An active session already exists')
  }

  const session = await db.workoutSession.create({
    data: {
      id: randomUUID(),
      ownerUserId: userId,
      workoutPlanId: payload.workoutPlanId,
      status: 'ACTIVE',
    },
    include: sessionInclude,
  })

  return mapWorkoutSessionDetail(session)
}

export async function listSessions(userId: string, pagination: PaginationQuery): Promise<SessionsListResponse> {
  const where = {
    ownerUserId: userId,
  }

  const [sessions, total] = await Promise.all([
    db.workoutSession.findMany({
      where,
      include: sessionInclude,
      orderBy: [{ startedAt: 'desc' }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    db.workoutSession.count({ where }),
  ])

  return {
    items: sessions.map(mapWorkoutSessionSummary),
    meta: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
    },
  }
}

export async function getSessionDetail(userId: string, sessionId: string): Promise<WorkoutSessionDetail> {
  const session = await findOwnedSession(userId, sessionId)
  return mapWorkoutSessionDetail(session)
}

export async function getActiveSession(userId: string): Promise<WorkoutSessionDetail> {
  const session = await db.workoutSession.findFirst({
    where: {
      ownerUserId: userId,
      status: 'ACTIVE',
    },
    include: sessionInclude,
  })

  if (!session) {
    throw new ApiError(404, 'ACTIVE_SESSION_NOT_FOUND', 'No active session found')
  }

  return mapWorkoutSessionDetail(session)
}

export async function createSessionSet(
  userId: string,
  sessionId: string,
  payload: CreateSessionSetRequest,
): Promise<SessionSet> {
  const session = await db.workoutSession.findFirst({
    where: {
      id: sessionId,
      ownerUserId: userId,
    },
    include: {
      workoutPlan: {
        include: {
          exercises: {
            select: {
              exerciseId: true,
            },
          },
        },
      },
    },
  })

  if (!session) {
    throw new ApiError(404, 'SESSION_NOT_FOUND', 'Workout session not found')
  }

  if (session.status !== 'ACTIVE') {
    throw new ApiError(409, 'SESSION_ALREADY_COMPLETED', 'Completed sessions are immutable')
  }

  const allowedExerciseIds = new Set(session.workoutPlan.exercises.map((exercise) => exercise.exerciseId))

  if (!allowedExerciseIds.has(payload.exerciseId)) {
    throw new ApiError(400, 'EXERCISE_NOT_IN_WORKOUT_PLAN', 'Exercise is not part of the workout plan')
  }

  const exercise = await db.exercise.findFirst({
    where: {
      id: payload.exerciseId,
      OR: [{ source: 'DEFAULT' }, { ownerUserId: userId }],
    },
    select: {
      muscleGroup: true,
      name: true,
    },
  })

  if (!exercise) {
    throw new ApiError(404, 'EXERCISE_NOT_FOUND', 'Exercise not found')
  }

  const weightKg = Number(payload.weightKg)
  const volume = weightKg * payload.reps
  let isPR = false

  if (isPrEligibleSetType(payload.setType)) {
    const previousSets = await db.sessionSet.findMany({
      where: {
        exerciseId: payload.exerciseId,
        setType: {
          in: [...eligiblePrSetTypes],
        },
        workoutSession: {
          ownerUserId: userId,
        },
      },
      select: {
        reps: true,
        weightKg: true,
      },
    })

    const bestPreviousVolume = previousSets.reduce((best, entry) => {
      const currentVolume = Number(entry.weightKg) * entry.reps
      return currentVolume > best ? currentVolume : best
    }, 0)

    isPR = volume > bestPreviousVolume
  }

  const createdSet = await db.sessionSet.create({
    data: {
      id: randomUUID(),
      workoutSessionId: sessionId,
      exerciseId: payload.exerciseId,
      setType: payload.setType,
      weightKg,
      reps: payload.reps,
      notes: payload.notes ?? null,
      isPR,
    },
    include: {
      exercise: {
        select: {
          muscleGroup: true,
          name: true,
        },
      },
    },
  })

  return mapSessionSet(createdSet)
}

export async function completeSession(
  userId: string,
  sessionId: string,
  payload: CompleteSessionRequest,
): Promise<WorkoutSessionDetail> {
  const session = await findOwnedSession(userId, sessionId)

  if (session.status !== 'ACTIVE') {
    throw new ApiError(409, 'SESSION_ALREADY_COMPLETED', 'Completed sessions are immutable')
  }

  const completedAt = payload.completedAt ? new Date(payload.completedAt) : new Date()

  if (completedAt.getTime() < session.startedAt.getTime()) {
    throw new ApiError(400, 'INVALID_COMPLETION_TIME', 'Completion time must be after session start')
  }

  const updatedSession = await db.workoutSession.update({
    where: { id: sessionId },
    data: {
      status: 'COMPLETED',
      completedAt,
      durationSeconds: Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000),
    },
    include: sessionInclude,
  })

  return mapWorkoutSessionDetail(updatedSession)
}

export async function getCurrentUserStats(userId: string) {
  const [totalSessions, prCount] = await Promise.all([
    db.workoutSession.count({
      where: {
        ownerUserId: userId,
        status: 'COMPLETED',
      },
    }),
    db.sessionSet.count({
      where: {
        isPR: true,
        workoutSession: {
          ownerUserId: userId,
        },
      },
    }),
  ])

  return {
    totalSessions,
    prCount,
  }
}

async function findOwnedSession(userId: string, sessionId: string) {
  const session = await db.workoutSession.findFirst({
    where: {
      id: sessionId,
      ownerUserId: userId,
    },
    include: sessionInclude,
  })

  if (!session) {
    throw new ApiError(404, 'SESSION_NOT_FOUND', 'Workout session not found')
  }

  return session
}

function mapWorkoutSessionSummary(session: WorkoutSessionRecord): WorkoutSessionSummary {
  const totalVolumeKg = Number(
    session.sets.reduce((total, set) => total + Number(set.weightKg) * set.reps, 0).toFixed(2),
  )

  return {
    id: session.id,
    workoutPlanId: session.workoutPlan.id,
    workoutPlanName: session.workoutPlan.name,
    status: session.status,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    durationSeconds: session.durationSeconds,
    totalSets: session.sets.length,
    exerciseCount: new Set(session.sets.map((set) => set.exerciseId)).size,
    totalVolumeKg,
  }
}

function mapWorkoutSessionDetail(session: WorkoutSessionRecord): WorkoutSessionDetail {
  return {
    ...mapWorkoutSessionSummary(session),
    sets: session.sets.map(mapSessionSet),
  }
}

function mapSessionSet(set: SessionSetRecord): SessionSet {
  return {
    id: set.id,
    exerciseId: set.exerciseId,
    exerciseName: set.exercise.name,
    muscleGroup: set.exercise.muscleGroup,
    setType: set.setType,
    weightKg: Number(set.weightKg),
    reps: set.reps,
    notes: set.notes,
    isPR: set.isPR,
    createdAt: set.createdAt.toISOString(),
  }
}

function isPrEligibleSetType(setType: CreateSessionSetRequest['setType']): setType is (typeof eligiblePrSetTypes)[number] {
  return eligiblePrSetTypes.includes(setType as (typeof eligiblePrSetTypes)[number])
}
