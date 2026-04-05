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

type MockState = {
  exercises: StoredExercise[]
  planExercises: StoredPlanExercise[]
  planSets: StoredPlanSet[]
  refreshTokens: StoredRefreshToken[]
  workoutSessions: StoredWorkoutSession[]
  users: StoredUser[]
  workoutPlans: StoredWorkoutPlan[]
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
        name: 'Overhead Press',
        muscleGroup: 'SHOULDERS',
        source: 'DEFAULT',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        ownerUserId: null,
        name: 'Tricep Pushdown',
        muscleGroup: 'TRICEPS',
        source: 'DEFAULT',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ],
    planExercises: [],
    planSets: [],
    refreshTokens: [],
    workoutSessions: [],
    users: [],
    workoutPlans: [],
  }
}

let state = createState()

function matchesWhere<T extends object>(record: T, where: Record<string, unknown>) {
  return Object.entries(where).every(([key, value]) => {
    const recordValue = (record as Record<string, unknown>)[key]

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>

      if ('in' in nested && Array.isArray(nested.in)) {
        return nested.in.includes(recordValue)
      }

      if ('equals' in nested) {
        return recordValue === nested.equals
      }

      return matchesWhere(record as Record<string, unknown>, nested)
    }

    return recordValue === value
  })
}

function sortByUpdatedDesc(plans: StoredWorkoutPlan[]) {
  return [...plans].sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
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
    async create({ data }: { data: StoredExercise }) {
      state.exercises.push(data)
      return data
    },
    async findFirst({ where }: { where: Record<string, unknown> }) {
      return state.exercises.find((exercise) => matchesWhere(exercise, where)) ?? null
    },
  },
  workoutPlan: {
    async count({ where }: { where: Record<string, unknown> }) {
      return state.workoutPlans.filter((plan) => matchesWhere(plan, where)).length
    },
    async create({ data }: { data: Omit<StoredWorkoutPlan, 'createdAt' | 'updatedAt'> & Partial<Pick<StoredWorkoutPlan, 'createdAt' | 'updatedAt'>> }) {
      const workoutPlan: StoredWorkoutPlan = {
        ...data,
        createdAt: data.createdAt ?? new Date(),
        updatedAt: data.updatedAt ?? new Date(),
      }

      state.workoutPlans.push(workoutPlan)
      return workoutPlan
    },
    async findFirst({ where }: { where: Record<string, unknown> }) {
      return state.workoutPlans.find((plan) => matchesWhere(plan, where)) ?? null
    },
    async findMany({
      where,
      skip = 0,
      take,
    }: {
      where: Record<string, unknown>
      skip?: number
      take?: number
    }) {
      const filtered = sortByUpdatedDesc(state.workoutPlans.filter((plan) => matchesWhere(plan, where)))
      return typeof take === 'number' ? filtered.slice(skip, skip + take) : filtered.slice(skip)
    },
    async update({
      where,
      data,
    }: {
      where: { id: string }
      data: Partial<Pick<StoredWorkoutPlan, 'name' | 'accent' | 'focusLabel' | 'updatedAt'>>
    }) {
      const workoutPlan = state.workoutPlans.find((plan) => plan.id === where.id)

      if (!workoutPlan) {
        throw new Error('Workout plan not found')
      }

      Object.assign(workoutPlan, data, { updatedAt: data.updatedAt ?? new Date() })
      return workoutPlan
    },
    async delete({ where }: { where: { id: string } }) {
      const workoutPlan = state.workoutPlans.find((plan) => plan.id === where.id)

      if (!workoutPlan) {
        throw new Error('Workout plan not found')
      }

      state.workoutPlans = state.workoutPlans.filter((plan) => plan.id !== where.id)
      const removedExerciseIds = state.planExercises
        .filter((planExercise) => planExercise.workoutPlanId === where.id)
        .map((planExercise) => planExercise.id)
      state.planExercises = state.planExercises.filter((planExercise) => planExercise.workoutPlanId !== where.id)
      state.planSets = state.planSets.filter((planSet) => !removedExerciseIds.includes(planSet.planExerciseId))

      return workoutPlan
    },
  },
  workoutSession: {
    async findFirst({ where }: { where: Record<string, unknown> }) {
      return state.workoutSessions.find((session) => matchesWhere(session, where)) ?? null
    },
  },
  planExercise: {
    async count({ where }: { where: Record<string, unknown> }) {
      return state.planExercises.filter((planExercise) => matchesWhere(planExercise, where)).length
    },
    async create({ data }: { data: StoredPlanExercise }) {
      state.planExercises.push(data)
      return data
    },
    async findFirst({ where }: { where: Record<string, unknown> }) {
      return state.planExercises.find((planExercise) => matchesWhere(planExercise, where)) ?? null
    },
    async findMany({
      where,
      orderBy,
    }: {
      where: Record<string, unknown>
      orderBy?: { order: 'asc' | 'desc' }
    }) {
      const filtered = state.planExercises.filter((planExercise) => matchesWhere(planExercise, where))

      if (!orderBy) {
        return [...filtered]
      }

      return [...filtered].sort((left, right) =>
        orderBy.order === 'asc' ? left.order - right.order : right.order - left.order,
      )
    },
    async delete({ where }: { where: { id: string } }) {
      const planExercise = state.planExercises.find((entry) => entry.id === where.id)

      if (!planExercise) {
        throw new Error('Plan exercise not found')
      }

      state.planExercises = state.planExercises.filter((entry) => entry.id !== where.id)
      state.planSets = state.planSets.filter((planSet) => planSet.planExerciseId !== where.id)

      return planExercise
    },
    async updateMany({
      where,
      data,
    }: {
      where: Record<string, unknown>
      data: Partial<Pick<StoredPlanExercise, 'order'>>
    }) {
      const matching = state.planExercises.filter((entry) => matchesWhere(entry, where))

      for (const planExercise of matching) {
        Object.assign(planExercise, data)
      }

      return { count: matching.length }
    },
    async update({
      where,
      data,
    }: {
      where: { id: string }
      data: Partial<Pick<StoredPlanExercise, 'order'>>
    }) {
      const planExercise = state.planExercises.find((entry) => entry.id === where.id)

      if (!planExercise) {
        throw new Error('Plan exercise not found')
      }

      Object.assign(planExercise, data)
      return planExercise
    },
  },
  planSet: {
    async count({ where }: { where: Record<string, unknown> }) {
      return state.planSets.filter((planSet) => matchesWhere(planSet, where)).length
    },
    async create({ data }: { data: StoredPlanSet }) {
      state.planSets.push(data)
      return data
    },
    async findFirst({ where }: { where: Record<string, unknown> }) {
      return state.planSets.find((planSet) => matchesWhere(planSet, where)) ?? null
    },
    async findMany({
      where,
      orderBy,
    }: {
      where: Record<string, unknown>
      orderBy?: { order: 'asc' | 'desc' }
    }) {
      const filtered = state.planSets.filter((planSet) => matchesWhere(planSet, where))

      if (!orderBy) {
        return [...filtered]
      }

      return [...filtered].sort((left, right) =>
        orderBy.order === 'asc' ? left.order - right.order : right.order - left.order,
      )
    },
    async update({
      where,
      data,
    }: {
      where: { id: string }
      data: Partial<Pick<StoredPlanSet, 'order' | 'setType' | 'targetReps' | 'targetLoadKg' | 'notes'>>
    }) {
      const planSet = state.planSets.find((entry) => entry.id === where.id)

      if (!planSet) {
        throw new Error('Plan set not found')
      }

      Object.assign(planSet, data)
      return planSet
    },
    async updateMany({
      where,
      data,
    }: {
      where: Record<string, unknown>
      data: Partial<Pick<StoredPlanSet, 'order'>>
    }) {
      const matching = state.planSets.filter((entry) => matchesWhere(entry, where))

      for (const planSet of matching) {
        Object.assign(planSet, data)
      }

      return { count: matching.length }
    },
    async delete({ where }: { where: { id: string } }) {
      const planSet = state.planSets.find((entry) => entry.id === where.id)

      if (!planSet) {
        throw new Error('Plan set not found')
      }

      state.planSets = state.planSets.filter((entry) => entry.id !== where.id)
      return planSet
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
  accessToken,
  app,
  body,
}: {
  accessToken: string
  app: ReturnType<typeof createTestApp>
  body?: Record<string, unknown>
}) {
  return request(app)
    .post('/workout-plans')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(
      body ?? {
        name: 'Push Day',
        accent: 'rose',
        focusLabel: 'Chest + Triceps',
      },
    )
}

describe('workout plans and planned structure', () => {
  beforeEach(() => {
    state = createState()
  })

  it('creates an empty workout plan and returns workout plan detail', async () => {
    const app = createTestApp()
    const { accessToken } = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })

    const response = await request(app)
      .post('/workout-plans')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Push Day',
        accent: 'rose',
        focusLabel: 'Chest + Triceps',
      })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      name: 'Push Day',
      accent: 'rose',
      focusLabel: 'Chest + Triceps',
      exerciseCount: 0,
      exercises: [],
    })
    expect(typeof response.body.id).toBe('string')
    expect(state.workoutPlans).toHaveLength(1)
  })

  it('lists only owned plans sorted by most recently updated first', async () => {
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

    await createPlan({ accessToken: alex.accessToken, app, body: { name: 'Push', accent: 'rose' } })
    await createPlan({ accessToken: bella.accessToken, app, body: { name: 'Foreign', accent: 'green' } })
    await createPlan({ accessToken: alex.accessToken, app, body: { name: 'Pull', accent: 'black' } })

    const response = await request(app)
      .get('/workout-plans?page=1&pageSize=20')
      .set('Authorization', `Bearer ${alex.accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body.meta).toMatchObject({ page: 1, pageSize: 20, total: 2 })
    expect(response.body.items.map((item: { name: string }) => item.name)).toEqual(['Pull', 'Push'])
  })

  it('enforces the five-plan cap for students but not for trainers', async () => {
    const app = createTestApp()
    const student = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })
    const trainer = await registerUser({
      app,
      displayName: 'Taylor',
      email: 'taylor@example.com',
      role: 'TRAINER',
    })

    for (let index = 0; index < 5; index += 1) {
      const response = await createPlan({
        accessToken: student.accessToken,
        app,
        body: { name: `Student ${index + 1}` },
      })
      expect(response.status).toBe(201)
    }

    const blocked = await createPlan({
      accessToken: student.accessToken,
      app,
      body: { name: 'Student 6' },
    })

    expect(blocked.status).toBe(403)
    expect(blocked.body.error.code).toBe('WORKOUT_PLAN_LIMIT_REACHED')

    for (let index = 0; index < 6; index += 1) {
      const response = await createPlan({
        accessToken: trainer.accessToken,
        app,
        body: { name: `Trainer ${index + 1}` },
      })
      expect(response.status).toBe(201)
    }
  })

  it('updates owned workout plan metadata and returns detail', async () => {
    const app = createTestApp()
    const { accessToken } = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })

    const created = await createPlan({ accessToken, app })

    const response = await request(app)
      .patch(`/workout-plans/${created.body.id as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Push Prime',
        accent: 'black',
        focusLabel: 'Chest Focus',
      })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: created.body.id,
      name: 'Push Prime',
      accent: 'black',
      focusLabel: 'Chest Focus',
    })
  })

  it('returns 404 when reading a foreign workout plan', async () => {
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
    const created = await createPlan({ accessToken: alex.accessToken, app })

    const response = await request(app)
      .get(`/workout-plans/${created.body.id as string}`)
      .set('Authorization', `Bearer ${bella.accessToken}`)

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('WORKOUT_PLAN_NOT_FOUND')
  })

  it('adds default and owned custom exercises to a plan and rejects another user custom exercise', async () => {
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
    const created = await createPlan({ accessToken: alex.accessToken, app })

    const customExerciseId = '550e8400-e29b-41d4-a716-446655440200'
    state.exercises.push({
      id: customExerciseId,
      ownerUserId: alex.userId,
      name: 'Alex Fly',
      muscleGroup: 'CHEST',
      source: 'CUSTOM',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    })
    state.exercises.push({
      id: '550e8400-e29b-41d4-a716-446655440201',
      ownerUserId: bella.userId,
      name: 'Bella Curl',
      muscleGroup: 'BICEPS',
      source: 'CUSTOM',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    })

    const addDefault = await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({ exerciseId: '550e8400-e29b-41d4-a716-446655440100' })

    expect(addDefault.status).toBe(201)
    expect(addDefault.body.exercises).toHaveLength(1)
    expect(addDefault.body.exercises[0]).toMatchObject({
      exerciseId: '550e8400-e29b-41d4-a716-446655440100',
      exerciseName: 'Barbell Bench Press',
      order: 0,
    })

    const addCustom = await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({ exerciseId: customExerciseId })

    expect(addCustom.status).toBe(201)
    expect(addCustom.body.exercises).toHaveLength(2)
    expect(addCustom.body.exercises[1]).toMatchObject({
      exerciseId: customExerciseId,
      exerciseName: 'Alex Fly',
      order: 1,
    })

    const blocked = await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises`)
      .set('Authorization', `Bearer ${alex.accessToken}`)
      .send({ exerciseId: '550e8400-e29b-41d4-a716-446655440201' })

    expect(blocked.status).toBe(404)
    expect(blocked.body.error.code).toBe('EXERCISE_NOT_FOUND')
  })

  it('reorders plan exercises atomically and rejects incomplete reorder payloads', async () => {
    const app = createTestApp()
    const { accessToken } = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })
    const created = await createPlan({ accessToken, app })

    const first = await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ exerciseId: '550e8400-e29b-41d4-a716-446655440100' })
    const second = await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ exerciseId: '550e8400-e29b-41d4-a716-446655440101' })

    const reorder = await request(app)
      .patch(`/workout-plans/${created.body.id as string}/exercises/reorder`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        orderedPlanExerciseIds: [second.body.exercises[1].id, first.body.exercises[0].id],
      })

    expect(reorder.status).toBe(200)
    expect(reorder.body.exercises.map((exercise: { exerciseName: string; order: number }) => [exercise.exerciseName, exercise.order])).toEqual([
      ['Overhead Press', 0],
      ['Barbell Bench Press', 1],
    ])

    const invalid = await request(app)
      .patch(`/workout-plans/${created.body.id as string}/exercises/reorder`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        orderedPlanExerciseIds: [second.body.exercises[1].id],
      })

    expect(invalid.status).toBe(400)
    expect(invalid.body.error.code).toBe('INVALID_PLAN_EXERCISE_ORDER')
  })

  it('removes a plan exercise, compacts order, and cascades nested plan sets', async () => {
    const app = createTestApp()
    const { accessToken } = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })
    const created = await createPlan({ accessToken, app })
    const withFirst = await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ exerciseId: '550e8400-e29b-41d4-a716-446655440100' })
    const withSecond = await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ exerciseId: '550e8400-e29b-41d4-a716-446655440101' })

    await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises/${withFirst.body.exercises[0].id as string}/sets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ setType: 'NORMAL', targetReps: 8, targetLoadKg: 100, notes: 'Top set' })

    const response = await request(app)
      .delete(`/workout-plans/${created.body.id as string}/exercises/${withFirst.body.exercises[0].id as string}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(204)
    expect(state.planSets).toHaveLength(0)
    expect(state.planExercises).toHaveLength(1)
    expect(state.planExercises[0]).toMatchObject({
      id: withSecond.body.exercises[1].id,
      order: 0,
    })
  })

  it('creates, updates, and deletes plan sets while preserving compact sibling order', async () => {
    const app = createTestApp()
    const { accessToken } = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })
    const created = await createPlan({ accessToken, app })
    const withExercise = await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ exerciseId: '550e8400-e29b-41d4-a716-446655440100' })

    const firstSet = await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises/${withExercise.body.exercises[0].id as string}/sets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ setType: 'WARM_UP', targetReps: 12, targetLoadKg: 60 })
    const secondSet = await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises/${withExercise.body.exercises[0].id as string}/sets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ setType: 'NORMAL', targetReps: 8, targetLoadKg: 100, notes: 'Main set' })

    expect(firstSet.status).toBe(201)
    expect(secondSet.status).toBe(201)
    expect(secondSet.body.exercises[0].sets.map((set: { order: number }) => set.order)).toEqual([0, 1])

    const updated = await request(app)
      .patch(`/plan-sets/${secondSet.body.exercises[0].sets[1].id as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        setType: 'FAILURE',
        targetReps: 7,
        targetLoadKg: 102.5,
        notes: 'Hard set',
      })

    expect(updated.status).toBe(200)
    expect(updated.body).toMatchObject({
      order: 1,
      setType: 'FAILURE',
      targetReps: 7,
      targetLoadKg: 102.5,
      notes: 'Hard set',
    })

    const deleted = await request(app)
      .delete(`/plan-sets/${firstSet.body.exercises[0].sets[0].id as string}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(deleted.status).toBe(204)
    expect(state.planSets).toHaveLength(1)
    expect(state.planSets[0]).toMatchObject({
      id: secondSet.body.exercises[0].sets[1].id,
      order: 0,
    })
  })

  it('deletes a workout plan and cascades all nested planned structure', async () => {
    const app = createTestApp()
    const { accessToken } = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })
    const created = await createPlan({ accessToken, app })
    const withExercise = await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ exerciseId: '550e8400-e29b-41d4-a716-446655440100' })

    await request(app)
      .post(`/workout-plans/${created.body.id as string}/exercises/${withExercise.body.exercises[0].id as string}/sets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ setType: 'NORMAL', targetReps: 8 })

    const response = await request(app)
      .delete(`/workout-plans/${created.body.id as string}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(204)
    expect(state.workoutPlans).toHaveLength(0)
    expect(state.planExercises).toHaveLength(0)
    expect(state.planSets).toHaveLength(0)
  })

  it('blocks deleting a workout plan that already has recorded workout sessions', async () => {
    const app = createTestApp()
    const { accessToken, userId } = await registerUser({
      app,
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
    })
    const created = await createPlan({ accessToken, app })

    state.workoutSessions.push({
      id: '550e8400-e29b-41d4-a716-446655440900',
      ownerUserId: userId,
      workoutPlanId: created.body.id as string,
      status: 'COMPLETED',
      startedAt: new Date('2026-04-01T16:00:00.000Z'),
      completedAt: new Date('2026-04-01T17:00:00.000Z'),
      durationSeconds: 3600,
      planSnapshot: {},
    })

    const response = await request(app)
      .delete(`/workout-plans/${created.body.id as string}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('WORKOUT_PLAN_HAS_SESSIONS')
    expect(state.workoutPlans).toHaveLength(1)
  })

  it('returns 401 for protected workout-plan endpoints without a bearer token', async () => {
    const response = await request(createTestApp()).get('/workout-plans')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })
})
