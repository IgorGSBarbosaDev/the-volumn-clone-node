import type {
  CreateSessionSetRequest,
  PaginatedMeta,
  PaginationQuery,
  SessionPlanSnapshot,
  SessionSet,
  SessionsListResponse,
  WorkoutSessionDetail,
  WorkoutSessionSummary,
} from '@the-volumn/shared'
import { sessionPlanSnapshotSchema, type SessionStatus } from '@the-volumn/shared'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { db } from '../../../config/db.js'
import { SESSION_PR_ELIGIBLE_SET_TYPES } from '../domain/sessions.constants.js'
import { getPerformanceScore, isPrEligibleSetType } from '../domain/sessions-pr.js'

type SessionDbClient = typeof db | Prisma.TransactionClient
type NumberLike = number | Prisma.Decimal

type WorkoutSessionRecord = {
  id: string
  ownerUserId: string
  workoutPlanId: string
  status: SessionStatus
  startedAt: Date
  completedAt: Date | null
  durationSeconds: number | null
  planSnapshot: Prisma.JsonValue
}

type SessionSetRecord = {
  id: string
  workoutSessionId: string
  exerciseId: string
  setType: SessionSet['setType']
  weightKg: NumberLike
  reps: number
  notes: string | null
  isPR: boolean
  createdAt: Date
}

type AppendSessionSetResult =
  | { kind: 'created'; sessionSet: SessionSet }
  | { kind: 'not_active' }
  | { kind: 'not_found' }

type CompleteWorkoutSessionResult =
  | { kind: 'completed'; session: WorkoutSessionDetail }
  | { kind: 'not_active' }
  | { kind: 'not_found' }

export async function listOwnedWorkoutSessions(
  userId: string,
  pagination: PaginationQuery,
): Promise<SessionsListResponse> {
  const [total, sessions] = await Promise.all([
    db.workoutSession.count({
      where: {
        ownerUserId: userId,
      },
    }),
    db.workoutSession.findMany({
      where: {
        ownerUserId: userId,
      },
      orderBy: {
        startedAt: 'desc',
      },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
  ])

  const sessionIds = sessions.map((session) => session.id)
  const sessionSets =
    sessionIds.length > 0
      ? await db.sessionSet.findMany({
          where: {
            workoutSessionId: {
              in: sessionIds,
            },
          },
        })
      : []

  const totalSetsBySessionId = new Map<string, number>()

  for (const sessionSet of sessionSets) {
    totalSetsBySessionId.set(
      sessionSet.workoutSessionId,
      (totalSetsBySessionId.get(sessionSet.workoutSessionId) ?? 0) + 1,
    )
  }

  return {
    items: sessions.map((session) => mapWorkoutSessionSummary(session, totalSetsBySessionId.get(session.id) ?? 0)),
    meta: mapPaginatedMeta(total, pagination),
  }
}

export async function getOwnedWorkoutSessionDetail(sessionId: string, userId: string) {
  const session = await findOwnedWorkoutSession(sessionId, userId)

  if (!session) {
    return null
  }

  return mapWorkoutSessionDetail(session)
}

export async function getOwnedActiveWorkoutSessionDetail(userId: string) {
  const session = await db.workoutSession.findFirst({
    where: {
      ownerUserId: userId,
      status: 'ACTIVE',
    },
    orderBy: {
      startedAt: 'desc',
    },
  })

  if (!session) {
    return null
  }

  return mapWorkoutSessionDetail(session)
}

export async function createWorkoutSession(userId: string, planSnapshot: SessionPlanSnapshot) {
  const now = new Date()

  await db.workoutSession.create({
    data: {
      id: randomUUID(),
      ownerUserId: userId,
      workoutPlanId: planSnapshot.id,
      status: 'ACTIVE',
      startedAt: now,
      completedAt: null,
      durationSeconds: null,
      planSnapshot,
    },
  })

  const activeSession = await getOwnedActiveWorkoutSessionDetail(userId)

  if (!activeSession) {
    throw new Error(`Failed to load newly created active session for user ${userId}`)
  }

  return activeSession
}

export async function appendOwnedSessionSet(
  userId: string,
  sessionId: string,
  payload: CreateSessionSetRequest,
): Promise<AppendSessionSetResult> {
  return db.$transaction(async (tx) => {
    const session = await tx.workoutSession.findFirst({
      where: {
        id: sessionId,
        ownerUserId: userId,
      },
    })

    if (!session) {
      return { kind: 'not_found' } satisfies AppendSessionSetResult
    }

    if (session.status !== 'ACTIVE') {
      return { kind: 'not_active' } satisfies AppendSessionSetResult
    }

    const isPR = await resolvePrFlag(tx, userId, payload)
    const createdAt = new Date()

    const sessionSet = await tx.sessionSet.create({
      data: {
        id: randomUUID(),
        workoutSessionId: sessionId,
        exerciseId: payload.exerciseId,
        setType: payload.setType,
        weightKg: payload.weightKg,
        reps: payload.reps,
        notes: payload.notes ?? null,
        isPR,
        createdAt,
      },
    })

    return {
      kind: 'created',
      sessionSet: mapSessionSet(sessionSet),
    } satisfies AppendSessionSetResult
  })
}

export async function completeOwnedWorkoutSession(
  userId: string,
  sessionId: string,
  completedAt: Date,
  durationSeconds: number,
): Promise<CompleteWorkoutSessionResult> {
  return db.$transaction(async (tx) => {
    const session = await tx.workoutSession.findFirst({
      where: {
        id: sessionId,
        ownerUserId: userId,
      },
    })

    if (!session) {
      return { kind: 'not_found' } satisfies CompleteWorkoutSessionResult
    }

    if (session.status !== 'ACTIVE') {
      return { kind: 'not_active' } satisfies CompleteWorkoutSessionResult
    }

    const updatedSession = await tx.workoutSession.update({
      where: {
        id: sessionId,
      },
      data: {
        status: 'COMPLETED',
        completedAt,
        durationSeconds,
      },
    })

    const sets = await tx.sessionSet.findMany({
      where: {
        workoutSessionId: sessionId,
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    })

    return {
      kind: 'completed',
      session: mapWorkoutSessionDetailFromData(updatedSession, sets),
    } satisfies CompleteWorkoutSessionResult
  })
}

async function findOwnedWorkoutSession(sessionId: string, userId: string, client: SessionDbClient = db) {
  return client.workoutSession.findFirst({
    where: {
      id: sessionId,
      ownerUserId: userId,
    },
  })
}

async function mapWorkoutSessionDetail(session: WorkoutSessionRecord, client: SessionDbClient = db): Promise<WorkoutSessionDetail> {
  const sets = await client.sessionSet.findMany({
    where: {
      workoutSessionId: session.id,
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })

  return mapWorkoutSessionDetailFromData(session, sets)
}

function mapWorkoutSessionDetailFromData(session: WorkoutSessionRecord, sets: SessionSetRecord[]): WorkoutSessionDetail {
  const mappedSets = sets.map(mapSessionSet)

  return {
    ...mapWorkoutSessionSummary(session, mappedSets.length),
    planSnapshot: parsePlanSnapshot(session.planSnapshot),
    sets: mappedSets,
  }
}

function mapWorkoutSessionSummary(session: WorkoutSessionRecord, totalSets: number): WorkoutSessionSummary {
  const planSnapshot = parsePlanSnapshot(session.planSnapshot)

  return {
    id: session.id,
    workoutPlanId: session.workoutPlanId,
    workoutPlanName: planSnapshot.name,
    status: session.status,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    durationSeconds: session.durationSeconds,
    totalSets,
  }
}

function mapSessionSet(sessionSet: SessionSetRecord): SessionSet {
  return {
    id: sessionSet.id,
    exerciseId: sessionSet.exerciseId,
    setType: sessionSet.setType,
    weightKg: toNumber(sessionSet.weightKg),
    reps: sessionSet.reps,
    notes: sessionSet.notes,
    isPR: sessionSet.isPR,
    createdAt: sessionSet.createdAt.toISOString(),
  }
}

function mapPaginatedMeta(total: number, pagination: PaginationQuery): PaginatedMeta {
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
  }
}

function parsePlanSnapshot(value: Prisma.JsonValue): SessionPlanSnapshot {
  return sessionPlanSnapshotSchema.parse(value)
}

function toNumber(value: NumberLike) {
  return typeof value === 'number' ? value : value.toNumber()
}

async function resolvePrFlag(
  tx: Prisma.TransactionClient,
  userId: string,
  payload: CreateSessionSetRequest,
) {
  if (!isPrEligibleSetType(payload.setType)) {
    return false
  }

  const ownedSessions = await tx.workoutSession.findMany({
    where: {
      ownerUserId: userId,
    },
  })

  if (ownedSessions.length === 0) {
    return true
  }

  const priorQualifyingSets = await tx.sessionSet.findMany({
    where: {
      exerciseId: payload.exerciseId,
      workoutSessionId: {
        in: ownedSessions.map((session) => session.id),
      },
      setType: {
        in: [...SESSION_PR_ELIGIBLE_SET_TYPES],
      },
    },
  })

  if (priorQualifyingSets.length === 0) {
    return true
  }

  const priorBestScore = priorQualifyingSets.reduce((bestScore, sessionSet) => {
    const score = getPerformanceScore(toNumber(sessionSet.weightKg), sessionSet.reps)
    return Math.max(bestScore, score)
  }, Number.NEGATIVE_INFINITY)

  return getPerformanceScore(payload.weightKg, payload.reps) > priorBestScore
}
