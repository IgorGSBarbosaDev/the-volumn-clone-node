import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

type StoredWorkoutSession = {
  id: string
  ownerUserId: string
  workoutPlanId: string
  status: 'ACTIVE' | 'COMPLETED'
  startedAt: Date
  completedAt: Date | null
  durationSeconds: number | null
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
  refreshTokens: StoredRefreshToken[]
  sessionSets: StoredSessionSet[]
  users: StoredUser[]
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
        name: 'Barbell Row',
        muscleGroup: 'BACK',
        source: 'DEFAULT',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        ownerUserId: null,
        name: 'Leg Press',
        muscleGroup: 'QUADS',
        source: 'DEFAULT',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ],
    refreshTokens: [],
    sessionSets: [],
    users: [],
    workoutSessions: [],
  }
}

let state = createState()

function matchesWhere(record: Record<string, unknown>, where: Record<string, unknown>) {
  return Object.entries(where).every(([key, value]) => {
    if (key === 'OR' && Array.isArray(value)) {
      return value.some((entry) => matchesWhere(record, entry as Record<string, unknown>))
    }

    const recordValue = record[key]

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>

      if ('in' in nested && Array.isArray(nested.in)) {
        return nested.in.includes(recordValue)
      }

      if ('contains' in nested && typeof nested.contains === 'string') {
        if (typeof recordValue !== 'string') {
          return false
        }

        const haystack = nested.mode === 'insensitive' ? recordValue.toLowerCase() : recordValue
        const needle = nested.mode === 'insensitive' ? nested.contains.toLowerCase() : nested.contains
        return haystack.includes(needle)
      }

      if ('equals' in nested) {
        return recordValue === nested.equals
      }
    }

    return recordValue === value
  })
}

function sortRecords<T extends Record<string, unknown>>(records: T[], orderBy?: Record<string, 'asc' | 'desc'>) {
  if (!orderBy) {
    return [...records]
  }

  const [field, direction] = Object.entries(orderBy)[0]!
  return [...records].sort((left, right) => {
    const leftValue = left[field]
    const rightValue = right[field]

    if (typeof leftValue === 'string' && typeof rightValue === 'string') {
      return direction === 'asc' ? leftValue.localeCompare(rightValue) : rightValue.localeCompare(leftValue)
    }

    if (leftValue instanceof Date && rightValue instanceof Date) {
      return direction === 'asc'
        ? leftValue.getTime() - rightValue.getTime()
        : rightValue.getTime() - leftValue.getTime()
    }

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return direction === 'asc' ? leftValue - rightValue : rightValue - leftValue
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
      const matchingTokens = state.refreshTokens.filter((token) => {
        if (where.id && token.id !== where.id) {
          return false
        }

        if (typeof where.revokedAt !== 'undefined' && token.revokedAt !== where.revokedAt) {
          return false
        }

        return true
      })

      for (const token of matchingTokens) {
        Object.assign(token, data)
      }

      return { count: matchingTokens.length }
    },
  },
  exercise: {
    async count({ where }: { where: Record<string, unknown> }) {
      return state.exercises.filter((exercise) => matchesWhere(exercise as Record<string, unknown>, where)).length
    },
    async create({
      data,
    }: {
      data: Omit<StoredExercise, 'createdAt' | 'updatedAt'> & Partial<Pick<StoredExercise, 'createdAt' | 'updatedAt'>>
    }) {
      const exercise: StoredExercise = {
        ...data,
        createdAt: data.createdAt ?? new Date(),
        updatedAt: data.updatedAt ?? new Date(),
      }

      state.exercises.push(exercise)
      return exercise
    },
    async findFirst({ where }: { where: Record<string, unknown> }) {
      return state.exercises.find((exercise) => matchesWhere(exercise as Record<string, unknown>, where)) ?? null
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
        state.exercises.filter((exercise) => matchesWhere(exercise as Record<string, unknown>, where)),
        orderBy,
      )

      return typeof take === 'number' ? filtered.slice(skip, skip + take) : filtered.slice(skip)
    },
  },
  workoutSession: {
    async findMany({
      where,
    }: {
      where: Record<string, unknown>
    }) {
      return state.workoutSessions.filter((session) => matchesWhere(session as Record<string, unknown>, where))
    },
  },
  sessionSet: {
    async findMany({
      where,
    }: {
      where: Record<string, unknown>
    }) {
      return state.sessionSets.filter((sessionSet) => matchesWhere(sessionSet as Record<string, unknown>, where))
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

describe('exercise catalog and history', () => {
  beforeEach(() => {
    state = createState()
  })

  it('lists default exercises plus owned custom exercises and hides foreign custom exercises', async () => {
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

    state.exercises.push(
      {
        id: '550e8400-e29b-41d4-a716-446655440200',
        ownerUserId: alex.userId,
        name: 'Cable Fly',
        muscleGroup: 'CHEST',
        source: 'CUSTOM',
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440201',
        ownerUserId: bella.userId,
        name: 'Bella Curl',
        muscleGroup: 'BICEPS',
        source: 'CUSTOM',
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
      },
    )

    const response = await request(app)
      .get('/exercises?page=1&pageSize=10')
      .set('Authorization', `Bearer ${alex.accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body.meta).toMatchObject({ page: 1, pageSize: 10, total: 4 })
    expect(response.body.items.map((item: { name: string }) => item.name)).toEqual([
      'Barbell Bench Press',
      'Barbell Row',
      'Cable Fly',
      'Leg Press',
    ])
    expect(response.body.items.map((item: { source: string }) => item.source)).toEqual([
      'DEFAULT',
      'DEFAULT',
      'CUSTOM',
      'DEFAULT',
    ])
  })

  it('filters accessible exercises by search, muscle group, source, and pagination', async () => {
    const app = createTestApp()
    const alex = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })

    state.exercises.push(
      {
        id: '550e8400-e29b-41d4-a716-446655440202',
        ownerUserId: alex.userId,
        name: 'Incline Press',
        muscleGroup: 'CHEST',
        source: 'CUSTOM',
        createdAt: new Date('2026-02-02T00:00:00.000Z'),
        updatedAt: new Date('2026-02-02T00:00:00.000Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440203',
        ownerUserId: alex.userId,
        name: 'Arnold Press',
        muscleGroup: 'SHOULDERS',
        source: 'CUSTOM',
        createdAt: new Date('2026-02-02T00:00:00.000Z'),
        updatedAt: new Date('2026-02-02T00:00:00.000Z'),
      },
    )

    const firstPage = await request(app)
      .get('/exercises?search=press&muscleGroup=CHEST&page=1&pageSize=1')
      .set('Authorization', `Bearer ${alex.accessToken}`)

    expect(firstPage.status).toBe(200)
    expect(firstPage.body.meta).toMatchObject({ page: 1, pageSize: 1, total: 2 })
    expect(firstPage.body.items.map((item: { name: string }) => item.name)).toEqual(['Barbell Bench Press'])

    const secondPage = await request(app)
      .get('/exercises?search=press&muscleGroup=CHEST&page=2&pageSize=1')
      .set('Authorization', `Bearer ${alex.accessToken}`)

    expect(secondPage.status).toBe(200)
    expect(secondPage.body.items.map((item: { name: string }) => item.name)).toEqual(['Incline Press'])

    const customOnly = await request(app)
      .get('/exercises?source=CUSTOM&page=1&pageSize=10')
      .set('Authorization', `Bearer ${alex.accessToken}`)

    expect(customOnly.status).toBe(200)
    expect(customOnly.body.items.map((item: { name: string }) => item.name)).toEqual(['Arnold Press', 'Incline Press'])
  })

  it('creates a trimmed custom exercise for the authenticated user', async () => {
    const app = createTestApp()
    const alex = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })

    const response = await request(app)
      .post('/exercises')
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({
        name: '  Cable Fly  ',
        muscleGroup: 'CHEST',
      })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      name: 'Cable Fly',
      muscleGroup: 'CHEST',
      ownerUserId: alex.userId,
      source: 'CUSTOM',
    })
    expect(state.exercises).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Cable Fly',
          ownerUserId: alex.userId,
          source: 'CUSTOM',
        }),
      ]),
    )
  })

  it('returns only completed qualifying performed sets in exercise history ordered by completion time then set time', async () => {
    const app = createTestApp()
    const alex = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })

    state.workoutSessions.push(
      {
        id: '550e8400-e29b-41d4-a716-446655440300',
        ownerUserId: alex.userId,
        workoutPlanId: '550e8400-e29b-41d4-a716-446655440400',
        status: 'COMPLETED',
        startedAt: new Date('2026-04-01T16:00:00.000Z'),
        completedAt: new Date('2026-04-01T17:00:00.000Z'),
        durationSeconds: 3600,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440301',
        ownerUserId: alex.userId,
        workoutPlanId: '550e8400-e29b-41d4-a716-446655440401',
        status: 'COMPLETED',
        startedAt: new Date('2026-04-02T16:00:00.000Z'),
        completedAt: new Date('2026-04-02T17:00:00.000Z'),
        durationSeconds: 3600,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440302',
        ownerUserId: alex.userId,
        workoutPlanId: '550e8400-e29b-41d4-a716-446655440402',
        status: 'ACTIVE',
        startedAt: new Date('2026-04-03T16:00:00.000Z'),
        completedAt: null,
        durationSeconds: null,
      },
    )

    state.sessionSets.push(
      {
        id: '550e8400-e29b-41d4-a716-446655440500',
        workoutSessionId: '550e8400-e29b-41d4-a716-446655440300',
        exerciseId: '550e8400-e29b-41d4-a716-446655440100',
        setType: 'DROP_SET',
        weightKg: 95,
        reps: 10,
        notes: 'Last burner',
        isPR: false,
        createdAt: new Date('2026-04-01T16:30:00.000Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440501',
        workoutSessionId: '550e8400-e29b-41d4-a716-446655440301',
        exerciseId: '550e8400-e29b-41d4-a716-446655440100',
        setType: 'NORMAL',
        weightKg: 110,
        reps: 5,
        notes: null,
        isPR: true,
        createdAt: new Date('2026-04-02T16:30:00.000Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440502',
        workoutSessionId: '550e8400-e29b-41d4-a716-446655440301',
        exerciseId: '550e8400-e29b-41d4-a716-446655440100',
        setType: 'FAILURE',
        weightKg: 112.5,
        reps: 4,
        notes: 'Almost there',
        isPR: false,
        createdAt: new Date('2026-04-02T16:40:00.000Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440503',
        workoutSessionId: '550e8400-e29b-41d4-a716-446655440301',
        exerciseId: '550e8400-e29b-41d4-a716-446655440100',
        setType: 'WARM_UP',
        weightKg: 60,
        reps: 12,
        notes: null,
        isPR: false,
        createdAt: new Date('2026-04-02T16:10:00.000Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440504',
        workoutSessionId: '550e8400-e29b-41d4-a716-446655440302',
        exerciseId: '550e8400-e29b-41d4-a716-446655440100',
        setType: 'NORMAL',
        weightKg: 115,
        reps: 3,
        notes: 'Active session should not show',
        isPR: true,
        createdAt: new Date('2026-04-03T16:20:00.000Z'),
      },
    )

    const response = await request(app)
      .get('/exercises/550e8400-e29b-41d4-a716-446655440100/history?page=1&pageSize=10')
      .set('Authorization', `Bearer ${alex.accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body.exercise).toMatchObject({
      id: '550e8400-e29b-41d4-a716-446655440100',
      name: 'Barbell Bench Press',
      source: 'DEFAULT',
    })
    expect(response.body.meta).toMatchObject({ page: 1, pageSize: 10, total: 3 })
    expect(response.body.items).toEqual([
      expect.objectContaining({
        setId: '550e8400-e29b-41d4-a716-446655440502',
        setType: 'FAILURE',
        weightKg: 112.5,
        reps: 4,
        volume: 450,
        notes: 'Almost there',
        isPR: false,
        sessionCompletedAt: '2026-04-02T17:00:00.000Z',
      }),
      expect.objectContaining({
        setId: '550e8400-e29b-41d4-a716-446655440501',
        setType: 'NORMAL',
        weightKg: 110,
        reps: 5,
        volume: 550,
        notes: null,
        isPR: true,
        sessionCompletedAt: '2026-04-02T17:00:00.000Z',
      }),
      expect.objectContaining({
        setId: '550e8400-e29b-41d4-a716-446655440500',
        setType: 'DROP_SET',
        weightKg: 95,
        reps: 10,
        volume: 950,
        notes: 'Last burner',
        isPR: false,
        sessionCompletedAt: '2026-04-01T17:00:00.000Z',
      }),
    ])
  })

  it('returns 404 when reading another user custom exercise history', async () => {
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

    state.exercises.push({
      id: '550e8400-e29b-41d4-a716-446655440204',
      ownerUserId: bella.userId,
      name: 'Bella Curl',
      muscleGroup: 'BICEPS',
      source: 'CUSTOM',
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
      updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    })

    const response = await request(app)
      .get('/exercises/550e8400-e29b-41d4-a716-446655440204/history?page=1&pageSize=20')
      .set('Authorization', `Bearer ${alex.accessToken}`)

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('EXERCISE_NOT_FOUND')
  })

  it('returns 401 for exercise routes without a bearer token', async () => {
    const response = await request(createTestApp()).get('/exercises')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })
})
