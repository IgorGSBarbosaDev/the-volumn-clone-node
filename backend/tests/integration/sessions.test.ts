import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type StoredUser = {
  id: string
  email: string
  passwordHash: string
  displayName: string
  role: 'STUDENT' | 'TRAINER'
  theme: 'rose' | 'green' | 'black'
  createdAt: Date
  updatedAt: Date
}

type StoredRefreshToken = {
  id: string
  userId: string
  tokenHash: string
  createdAt: Date
  expiresAt: Date
  revokedAt: Date | null
}

type StoredExercise = {
  id: string
  ownerUserId: string | null
  name: string
  muscleGroup:
    | 'CHEST'
    | 'BACK'
    | 'SHOULDERS'
    | 'BICEPS'
    | 'TRICEPS'
    | 'QUADS'
    | 'HAMSTRINGS'
    | 'GLUTES'
    | 'CALVES'
    | 'CORE'
    | 'FULL_BODY'
    | 'OTHER'
  source: 'DEFAULT' | 'CUSTOM'
  createdAt: Date
  updatedAt: Date
}

type StoredWorkoutPlan = {
  id: string
  ownerUserId: string
  name: string
  accent: 'rose' | 'green' | 'black' | 'blue' | 'amber' | 'violet' | null
  focusLabel: string | null
  createdAt: Date
  updatedAt: Date
}

type StoredPlanExercise = {
  id: string
  workoutPlanId: string
  exerciseId: string
  order: number
}

type StoredPlanSet = {
  id: string
  planExerciseId: string
  order: number
  setType: 'WARM_UP' | 'FEEDER' | 'NORMAL' | 'FAILURE' | 'DROP_SET'
  targetReps: number | null
  targetLoadKg: number | null
  notes: string | null
}

type StoredWorkoutSession = {
  id: string
  ownerUserId: string
  workoutPlanId: string
  status: 'ACTIVE' | 'COMPLETED'
  startedAt: Date
  completedAt: Date | null
  durationSeconds: number | null
  planSnapshot: Record<string, unknown>
}

type StoredSessionSet = {
  id: string
  workoutSessionId: string
  exerciseId: string
  setType: 'WARM_UP' | 'FEEDER' | 'NORMAL' | 'FAILURE' | 'DROP_SET'
  weightKg: number
  reps: number
  notes: string | null
  isPR: boolean
  createdAt: Date
}

type MockState = {
  exercises: StoredExercise[]
  planExercises: StoredPlanExercise[]
  planSets: StoredPlanSet[]
  refreshTokens: StoredRefreshToken[]
  sessionSets: StoredSessionSet[]
  users: StoredUser[]
  workoutPlans: StoredWorkoutPlan[]
  workoutSessions: StoredWorkoutSession[]
}

function createState(): MockState {
  return {
    exercises: [
      {
        id: '550e8400-e29b-41d4-a716-446655440100',
        ownerUserId: null,
        name: 'Barbell Bench Press',
        muscleGroup: 'CHEST',
        source: 'DEFAULT',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        ownerUserId: null,
        name: 'Incline Dumbbell Press',
        muscleGroup: 'CHEST',
        source: 'DEFAULT',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        ownerUserId: null,
        name: 'Barbell Row',
        muscleGroup: 'BACK',
        source: 'DEFAULT',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ],
    planExercises: [],
    planSets: [],
    refreshTokens: [],
    sessionSets: [],
    users: [],
    workoutPlans: [],
    workoutSessions: [],
  }
}

let state = createState()

function matchesWhere(record: Record<string, unknown>, where: Record<string, unknown>) {
  return Object.entries(where).every(([key, value]) => {
    const recordValue = record[key]

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>

      if ('in' in nested && Array.isArray(nested.in)) {
        return nested.in.includes(recordValue)
      }

      if ('equals' in nested) {
        return recordValue === nested.equals
      }
    }

    return recordValue === value
  })
}

function sortRecords<T extends Record<string, unknown>>(
  records: T[],
  orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>,
) {
  if (!orderBy) {
    return [...records]
  }

  const orderEntries = Array.isArray(orderBy) ? orderBy : [orderBy]

  return [...records].sort((left, right) => {
    for (const entry of orderEntries) {
      const [field, direction] = Object.entries(entry)[0]!
      const leftValue = left[field]
      const rightValue = right[field]

      if (leftValue instanceof Date && rightValue instanceof Date) {
        const diff =
          direction === 'asc'
            ? leftValue.getTime() - rightValue.getTime()
            : rightValue.getTime() - leftValue.getTime()

        if (diff !== 0) {
          return diff
        }

        continue
      }

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        const diff = direction === 'asc' ? leftValue - rightValue : rightValue - leftValue

        if (diff !== 0) {
          return diff
        }

        continue
      }

      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        const diff = direction === 'asc' ? leftValue.localeCompare(rightValue) : rightValue.localeCompare(leftValue)

        if (diff !== 0) {
          return diff
        }
      }
    }

    return 0
  })
}

const mockDb = {
  user: {
    async create({
      data,
    }: {
      data: Omit<StoredUser, 'createdAt' | 'updatedAt'> & Partial<Pick<StoredUser, 'createdAt' | 'updatedAt'>>
    }) {
      const user: StoredUser = {
        ...data,
        createdAt: data.createdAt ?? new Date(),
        updatedAt: data.updatedAt ?? new Date(),
      }

      state.users.push(user)
      return user
    },
    async findUnique({ where }: { where: { email?: string; id?: string } }) {
      if (where.email) {
        return state.users.find((user) => user.email === where.email) ?? null
      }

      if (where.id) {
        return state.users.find((user) => user.id === where.id) ?? null
      }

      return null
    },
  },
  refreshToken: {
    async create({ data }: { data: StoredRefreshToken }) {
      state.refreshTokens.push(data)
      return data
    },
    async findUnique({ where }: { where: { tokenHash?: string } }) {
      if (where.tokenHash) {
        return state.refreshTokens.find((token) => token.tokenHash === where.tokenHash) ?? null
      }

      return null
    },
    async updateMany({
      where,
      data,
    }: {
      where: { id?: string; revokedAt?: Date | null }
      data: Partial<Pick<StoredRefreshToken, 'revokedAt' | 'expiresAt'>>
    }) {
      const matching = state.refreshTokens.filter((token) => {
        if (where.id && token.id !== where.id) {
          return false
        }

        if (typeof where.revokedAt !== 'undefined' && token.revokedAt !== where.revokedAt) {
          return false
        }

        return true
      })

      for (const token of matching) {
        Object.assign(token, data)
      }

      return { count: matching.length }
    },
  },
  exercise: {
    async findFirst({ where }: { where: Record<string, unknown> }) {
      return state.exercises.find((exercise) => matchesWhere(exercise as Record<string, unknown>, where)) ?? null
    },
  },
  workoutPlan: {
    async findFirst({ where }: { where: Record<string, unknown> }) {
      return state.workoutPlans.find((plan) => matchesWhere(plan as Record<string, unknown>, where)) ?? null
    },
  },
  planExercise: {
    async findMany({
      where,
      orderBy,
    }: {
      where: Record<string, unknown>
      orderBy?: Record<string, 'asc' | 'desc'>
    }) {
      return sortRecords(
        state.planExercises.filter((planExercise) => matchesWhere(planExercise as Record<string, unknown>, where)),
        orderBy,
      )
    },
  },
  planSet: {
    async findMany({
      where,
      orderBy,
    }: {
      where: Record<string, unknown>
      orderBy?: Record<string, 'asc' | 'desc'>
    }) {
      return sortRecords(
        state.planSets.filter((planSet) => matchesWhere(planSet as Record<string, unknown>, where)),
        orderBy,
      )
    },
  },
  workoutSession: {
    async count({ where }: { where: Record<string, unknown> }) {
      return state.workoutSessions.filter((session) => matchesWhere(session as Record<string, unknown>, where)).length
    },
    async findFirst({
      where,
      orderBy,
    }: {
      where: Record<string, unknown>
      orderBy?: Record<string, 'asc' | 'desc'>
    }) {
      const matching = sortRecords(
        state.workoutSessions.filter((session) => matchesWhere(session as Record<string, unknown>, where)),
        orderBy,
      )

      return matching[0] ?? null
    },
    async findMany({
      where,
      orderBy,
      skip = 0,
      take,
    }: {
      where: Record<string, unknown>
      orderBy?: Record<string, 'asc' | 'desc'>
      skip?: number
      take?: number
    }) {
      const filtered = sortRecords(
        state.workoutSessions.filter((session) => matchesWhere(session as Record<string, unknown>, where)),
        orderBy,
      )

      return typeof take === 'number' ? filtered.slice(skip, skip + take) : filtered.slice(skip)
    },
    async create({
      data,
    }: {
      data: StoredWorkoutSession
    }) {
      state.workoutSessions.push(data)
      return data
    },
    async update({
      where,
      data,
    }: {
      where: { id: string }
      data: Partial<Pick<StoredWorkoutSession, 'status' | 'completedAt' | 'durationSeconds'>>
    }) {
      const session = state.workoutSessions.find((entry) => entry.id === where.id)

      if (!session) {
        throw new Error('Workout session not found')
      }

      Object.assign(session, data)
      return session
    },
  },
  sessionSet: {
    async findMany({
      where,
      orderBy,
    }: {
      where: Record<string, unknown>
      orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>
    }) {
      return sortRecords(
        state.sessionSets.filter((sessionSet) => matchesWhere(sessionSet as Record<string, unknown>, where)),
        orderBy,
      )
    },
    async create({
      data,
    }: {
      data: StoredSessionSet
    }) {
      state.sessionSets.push(data)
      return data
    },
  },
  async $transaction<T>(callback: (tx: typeof mockDb) => Promise<T>) {
    return callback(mockDb)
  },
}

vi.mock('../../src/config/db.js', () => ({
  db: mockDb,
}))

const { createTestApp } = await import('../helpers/create-test-app.js')

function getAccessToken(response: request.Response) {
  return response.body.accessToken as string
}

async function registerUser({
  app,
  displayName,
  email,
  role,
}: {
  app: ReturnType<typeof createTestApp>
  displayName: string
  email: string
  role: 'STUDENT' | 'TRAINER'
}) {
  const response = await request(app).post('/auth/register').send({
    email,
    password: 'password123',
    displayName,
    role,
    theme: 'rose',
  })

  return {
    accessToken: getAccessToken(response),
    userId: response.body.user.id as string,
  }
}

async function createPlan({
  name = 'Push Day',
  ownerUserId,
}: {
  name?: string
  ownerUserId: string
}) {
  const index = state.workoutPlans.length + 1
  const workoutPlan: StoredWorkoutPlan = {
    id: `550e8400-e29b-41d4-a716-${(900000000000 + index).toString()}`,
    ownerUserId,
    name,
    accent: 'rose',
    focusLabel: 'Chest Focus',
    createdAt: new Date('2026-04-01T10:00:00.000Z'),
    updatedAt: new Date('2026-04-01T10:00:00.000Z'),
  }

  state.workoutPlans.push(workoutPlan)
  return workoutPlan
}

function addPlanExercise({
  exerciseId,
  order,
  workoutPlanId,
}: {
  exerciseId: string
  order: number
  workoutPlanId: string
}) {
  const planExercise: StoredPlanExercise = {
    id: `550e8400-e29b-41d4-a716-${(700000000000 + order).toString()}`,
    workoutPlanId,
    exerciseId,
    order,
  }

  state.planExercises.push(planExercise)
  return planExercise
}

function addPlanSet({
  notes = null,
  order,
  planExerciseId,
  setType,
  targetLoadKg,
  targetReps,
}: {
  notes?: string | null
  order: number
  planExerciseId: string
  setType: StoredPlanSet['setType']
  targetLoadKg: number | null
  targetReps: number | null
}) {
  state.planSets.push({
    id: `550e8400-e29b-41d4-a716-${(800000000000 + order).toString()}`,
    planExerciseId,
    order,
    setType,
    targetReps,
    targetLoadKg,
    notes,
  })
}

describe('workout sessions and performed sets', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-01T10:00:00.000Z'))
    state = createState()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts a session from an owned plan, snapshots structure, and exposes it as the active session', async () => {
    const app = createTestApp()
    const alex = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })
    const plan = await createPlan({ ownerUserId: alex.userId })
    const firstExercise = addPlanExercise({
      workoutPlanId: plan.id,
      exerciseId: '550e8400-e29b-41d4-a716-446655440100',
      order: 0,
    })
    addPlanSet({
      planExerciseId: firstExercise.id,
      order: 0,
      setType: 'WARM_UP',
      targetReps: 12,
      targetLoadKg: 60,
    })

    const startResponse = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({ workoutPlanId: plan.id })

    expect(startResponse.status).toBe(201)
    expect(startResponse.body).toMatchObject({
      workoutPlanId: plan.id,
      workoutPlanName: 'Push Day',
      status: 'ACTIVE',
      totalSets: 0,
      sets: [],
      planSnapshot: {
        id: plan.id,
        name: 'Push Day',
        exerciseCount: 1,
        exercises: [
          {
            exerciseId: '550e8400-e29b-41d4-a716-446655440100',
            exerciseName: 'Barbell Bench Press',
            order: 0,
            sets: [
              {
                setType: 'WARM_UP',
                targetReps: 12,
                targetLoadKg: 60,
              },
            ],
          },
        ],
      },
    })

    const activeResponse = await request(app)
      .get('/sessions/active')
      .set('Authorization', `Bearer ${alex.accessToken}`)

    expect(activeResponse.status).toBe(200)
    expect(activeResponse.body.id).toBe(startResponse.body.id)
  })

  it('blocks starting a second active session for the same user and isolates active-session reads by owner', async () => {
    const app = createTestApp()
    const alex = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })
    const bella = await registerUser({
      app,
      displayName: 'Bella',
      email: 'bella@example.com',
      role: 'STUDENT',
    })
    const alexPlan = await createPlan({ ownerUserId: alex.userId })
    addPlanExercise({
      workoutPlanId: alexPlan.id,
      exerciseId: '550e8400-e29b-41d4-a716-446655440100',
      order: 0,
    })

    const firstStart = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({ workoutPlanId: alexPlan.id })

    expect(firstStart.status).toBe(201)

    const blocked = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({ workoutPlanId: alexPlan.id })

    expect(blocked.status).toBe(409)
    expect(blocked.body.error.code).toBe('ACTIVE_SESSION_EXISTS')

    const bellaActive = await request(app)
      .get('/sessions/active')
      .set('Authorization', `Bearer ${bella.accessToken}`)

    expect(bellaActive.status).toBe(200)
    expect(bellaActive.body).toBeNull()
  })

  it('appends performed sets with write-time PR logic and rejects exercises outside the session plan snapshot', async () => {
    const app = createTestApp()
    const alex = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })
    const plan = await createPlan({ ownerUserId: alex.userId })
    addPlanExercise({
      workoutPlanId: plan.id,
      exerciseId: '550e8400-e29b-41d4-a716-446655440100',
      order: 0,
    })

    const started = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({ workoutPlanId: plan.id })

    const sessionId = started.body.id as string

    const first = await request(app)
      .post(`/sessions/${sessionId}/sets`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({
        exerciseId: '550e8400-e29b-41d4-a716-446655440100',
        setType: 'NORMAL',
        weightKg: 100,
        reps: 5,
      })

    const warmUp = await request(app)
      .post(`/sessions/${sessionId}/sets`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({
        exerciseId: '550e8400-e29b-41d4-a716-446655440100',
        setType: 'WARM_UP',
        weightKg: 60,
        reps: 12,
      })

    const tie = await request(app)
      .post(`/sessions/${sessionId}/sets`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({
        exerciseId: '550e8400-e29b-41d4-a716-446655440100',
        setType: 'FAILURE',
        weightKg: 125,
        reps: 4,
      })

    const better = await request(app)
      .post(`/sessions/${sessionId}/sets`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({
        exerciseId: '550e8400-e29b-41d4-a716-446655440100',
        setType: 'DROP_SET',
        weightKg: 102.5,
        reps: 6,
        notes: 'Top set',
      })

    const invalidExercise = await request(app)
      .post(`/sessions/${sessionId}/sets`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({
        exerciseId: '550e8400-e29b-41d4-a716-446655440102',
        setType: 'NORMAL',
        weightKg: 80,
        reps: 8,
      })

    expect(first.status).toBe(201)
    expect(first.body.isPR).toBe(true)
    expect(warmUp.status).toBe(201)
    expect(warmUp.body.isPR).toBe(false)
    expect(tie.status).toBe(201)
    expect(tie.body.isPR).toBe(false)
    expect(better.status).toBe(201)
    expect(better.body.isPR).toBe(true)
    expect(better.body.notes).toBe('Top set')
    expect(invalidExercise.status).toBe(400)
    expect(invalidExercise.body.error.code).toBe('EXERCISE_NOT_IN_SESSION_PLAN')
  })

  it('lists and reads only owned sessions with total set counts and detail hydration', async () => {
    const app = createTestApp()
    const alex = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })
    const bella = await registerUser({
      app,
      displayName: 'Bella',
      email: 'bella@example.com',
      role: 'STUDENT',
    })
    const alexPlan = await createPlan({ ownerUserId: alex.userId, name: 'Alex Push' })
    const bellaPlan = await createPlan({ ownerUserId: bella.userId, name: 'Bella Pull' })

    addPlanExercise({
      workoutPlanId: alexPlan.id,
      exerciseId: '550e8400-e29b-41d4-a716-446655440100',
      order: 0,
    })
    addPlanExercise({
      workoutPlanId: bellaPlan.id,
      exerciseId: '550e8400-e29b-41d4-a716-446655440102',
      order: 0,
    })

    const alexStarted = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({ workoutPlanId: alexPlan.id })

    await request(app)
      .post(`/sessions/${alexStarted.body.id as string}/sets`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({
        exerciseId: '550e8400-e29b-41d4-a716-446655440100',
        setType: 'NORMAL',
        weightKg: 100,
        reps: 5,
      })

    await request(app)
      .patch(`/sessions/${alexStarted.body.id as string}/complete`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({
        completedAt: '2026-04-02T11:00:00.000Z',
      })

    await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${bella.accessToken}`)
      .send({ workoutPlanId: bellaPlan.id })

    const listResponse = await request(app)
      .get('/sessions?page=1&pageSize=20')
      .set('Authorization', `Bearer ${alex.accessToken}`)

    expect(listResponse.status).toBe(200)
    expect(listResponse.body.meta).toMatchObject({ page: 1, pageSize: 20, total: 1 })
    expect(listResponse.body.items).toEqual([
      expect.objectContaining({
        id: alexStarted.body.id,
        workoutPlanName: 'Alex Push',
        status: 'COMPLETED',
        totalSets: 1,
      }),
    ])

    const detailResponse = await request(app)
      .get(`/sessions/${alexStarted.body.id as string}`)
      .set('Authorization', `Bearer ${alex.accessToken}`)

    expect(detailResponse.status).toBe(200)
    expect(detailResponse.body.id).toBe(alexStarted.body.id)
    expect(detailResponse.body.sets).toHaveLength(1)

    const foreignDetail = await request(app)
      .get(`/sessions/${alexStarted.body.id as string}`)
      .set('Authorization', `Bearer ${bella.accessToken}`)

    expect(foreignDetail.status).toBe(404)
    expect(foreignDetail.body.error.code).toBe('WORKOUT_SESSION_NOT_FOUND')
  })

  it('completes an active session, computes duration, clears the active lookup, and makes the session immutable', async () => {
    const app = createTestApp()
    const alex = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })
    const plan = await createPlan({ ownerUserId: alex.userId })
    addPlanExercise({
      workoutPlanId: plan.id,
      exerciseId: '550e8400-e29b-41d4-a716-446655440100',
      order: 0,
    })

    const started = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({ workoutPlanId: plan.id })

    const sessionId = started.body.id as string

    const completed = await request(app)
      .patch(`/sessions/${sessionId}/complete`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({
        completedAt: '2026-04-01T11:30:00.000Z',
      })

    expect(completed.status).toBe(200)
    expect(completed.body.status).toBe('COMPLETED')
    expect(completed.body.completedAt).toBe('2026-04-01T11:30:00.000Z')
    expect(completed.body.durationSeconds).toBe(5400)

    const activeAfterComplete = await request(app)
      .get('/sessions/active')
      .set('Authorization', `Bearer ${alex.accessToken}`)

    expect(activeAfterComplete.status).toBe(200)
    expect(activeAfterComplete.body).toBeNull()

    const addSetAfterComplete = await request(app)
      .post(`/sessions/${sessionId}/sets`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({
        exerciseId: '550e8400-e29b-41d4-a716-446655440100',
        setType: 'NORMAL',
        weightKg: 100,
        reps: 5,
      })

    expect(addSetAfterComplete.status).toBe(409)
    expect(addSetAfterComplete.body.error.code).toBe('SESSION_NOT_ACTIVE')
  })

  it('returns 401 for protected session endpoints without a bearer token', async () => {
    const response = await request(createTestApp()).get('/sessions')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })
})
