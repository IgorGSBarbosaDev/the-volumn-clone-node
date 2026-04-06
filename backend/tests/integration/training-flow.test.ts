import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type StoredUser = {
  createdAt: Date
  displayName: string
  email: string
  id: string
  role: 'STUDENT' | 'TRAINER'
  theme: 'rose' | 'green' | 'black'
  updatedAt: Date
}

type StoredExercise = {
  createdAt: Date
  id: string
  muscleGroup: 'CHEST' | 'BACK' | 'SHOULDERS' | 'BICEPS' | 'TRICEPS' | 'QUADS' | 'HAMSTRINGS' | 'GLUTES' | 'CALVES' | 'CORE' | 'FULL_BODY' | 'OTHER'
  name: string
  ownerUserId: string | null
  source: 'DEFAULT' | 'CUSTOM'
  updatedAt: Date
}

type StoredWorkoutPlan = {
  accent: string | null
  createdAt: Date
  focusLabel: string | null
  id: string
  name: string
  ownerUserId: string
  updatedAt: Date
}

type StoredPlanExercise = {
  exerciseId: string
  id: string
  order: number
  workoutPlanId: string
}

type StoredPlanSet = {
  id: string
  notes: string | null
  order: number
  planExerciseId: string
  setType: 'WARM_UP' | 'FEEDER' | 'NORMAL' | 'FAILURE' | 'DROP_SET'
  targetLoadKg: number | null
  targetReps: number | null
}

type StoredSession = {
  completedAt: Date | null
  durationSeconds: number | null
  id: string
  ownerUserId: string
  startedAt: Date
  status: 'ACTIVE' | 'COMPLETED'
  workoutPlanId: string
}

type StoredSessionSet = {
  createdAt: Date
  exerciseId: string
  id: string
  isPR: boolean
  notes: string | null
  reps: number
  setType: 'WARM_UP' | 'FEEDER' | 'NORMAL' | 'FAILURE' | 'DROP_SET'
  weightKg: number
  workoutSessionId: string
}

type MockState = {
  exercises: StoredExercise[]
  planExercises: StoredPlanExercise[]
  planSets: StoredPlanSet[]
  sessions: StoredSession[]
  sessionSets: StoredSessionSet[]
  users: StoredUser[]
  workoutPlans: StoredWorkoutPlan[]
}

function createState(): MockState {
  const now = new Date('2026-04-06T12:00:00.000Z')

  return {
    exercises: [
      {
        createdAt: now,
        id: '550e8400-e29b-41d4-a716-446655440001',
        muscleGroup: 'CHEST',
        name: 'Barbell Bench Press',
        ownerUserId: null,
        source: 'DEFAULT',
        updatedAt: now,
      },
      {
        createdAt: now,
        id: '550e8400-e29b-41d4-a716-446655440002',
        muscleGroup: 'BACK',
        name: 'Barbell Row',
        ownerUserId: 'user-1',
        source: 'CUSTOM',
        updatedAt: now,
      },
      {
        createdAt: now,
        id: '550e8400-e29b-41d4-a716-446655440003',
        muscleGroup: 'QUADS',
        name: 'Hack Squat',
        ownerUserId: 'user-2',
        source: 'CUSTOM',
        updatedAt: now,
      },
    ],
    planExercises: [
      {
        exerciseId: '550e8400-e29b-41d4-a716-446655440001',
        id: '550e8400-e29b-41d4-a716-446655440020',
        order: 0,
        workoutPlanId: '550e8400-e29b-41d4-a716-446655440010',
      },
    ],
    planSets: [
      {
        id: '550e8400-e29b-41d4-a716-446655440030',
        notes: null,
        order: 0,
        planExerciseId: '550e8400-e29b-41d4-a716-446655440020',
        setType: 'NORMAL',
        targetLoadKg: 100,
        targetReps: 8,
      },
    ],
    sessions: [],
    sessionSets: [],
    users: [
      {
        createdAt: now,
        displayName: 'Alex',
        email: 'alex@example.com',
        id: 'user-1',
        role: 'STUDENT',
        theme: 'rose',
        updatedAt: now,
      },
      {
        createdAt: now,
        displayName: 'Morgan',
        email: 'morgan@example.com',
        id: 'user-2',
        role: 'TRAINER',
        theme: 'green',
        updatedAt: now,
      },
    ],
    workoutPlans: [
      {
        accent: 'rose',
        createdAt: now,
        focusLabel: 'Chest',
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Push',
        ownerUserId: 'user-1',
        updatedAt: now,
      },
    ],
  }
}

let state = createState()

function applySelect<T extends Record<string, unknown>>(value: T, select?: Record<string, boolean>) {
  if (!select) {
    return value
  }

  return Object.fromEntries(Object.entries(value).filter(([key]) => select[key])) as Partial<T>
}

function buildWorkoutPlan(plan: StoredWorkoutPlan) {
  return {
    ...plan,
    exercises: state.planExercises
      .filter((entry) => entry.workoutPlanId === plan.id)
      .sort((left, right) => left.order - right.order)
      .map((entry) => ({
        ...entry,
        exercise: state.exercises.find((exercise) => exercise.id === entry.exerciseId)!,
        sets: state.planSets
          .filter((set) => set.planExerciseId === entry.id)
          .sort((left, right) => left.order - right.order),
      })),
  }
}

function buildSession(session: StoredSession) {
  return {
    ...session,
    sets: state.sessionSets
      .filter((set) => set.workoutSessionId === session.id)
      .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
      .map((set) => ({
        ...set,
        exercise: state.exercises.find((exercise) => exercise.id === set.exerciseId)!,
      })),
    workoutPlan: {
      id: session.workoutPlanId,
      name: state.workoutPlans.find((plan) => plan.id === session.workoutPlanId)!.name,
    },
  }
}

function matchesExerciseWhere(exercise: StoredExercise, where: any): boolean {
  if (!where) {
    return true
  }

  if (where.AND) {
    return where.AND.every((entry: any) => matchesExerciseWhere(exercise, entry))
  }

  if (where.OR) {
    return where.OR.some((entry: any) => matchesExerciseWhere(exercise, entry))
  }

  if (where.id && exercise.id !== where.id) {
    return false
  }

  if (where.ownerUserId && exercise.ownerUserId !== where.ownerUserId) {
    return false
  }

  if (where.source && exercise.source !== where.source) {
    return false
  }

  if (where.muscleGroup && exercise.muscleGroup !== where.muscleGroup) {
    return false
  }

  if (where.name?.contains && !exercise.name.toLowerCase().includes(where.name.contains.toLowerCase())) {
    return false
  }

  return true
}

function matchesWorkoutPlanWhere(plan: StoredWorkoutPlan, where: any): boolean {
  if (!where) {
    return true
  }

  if (where.id && plan.id !== where.id) {
    return false
  }

  if (where.ownerUserId && plan.ownerUserId !== where.ownerUserId) {
    return false
  }

  return true
}

function matchesPlanExerciseWhere(entry: StoredPlanExercise, where: any): boolean {
  if (!where) {
    return true
  }

  if (where.id && entry.id !== where.id) {
    return false
  }

  if (where.workoutPlanId && entry.workoutPlanId !== where.workoutPlanId) {
    return false
  }

  if (where.workoutPlan?.ownerUserId) {
    const plan = state.workoutPlans.find((item) => item.id === entry.workoutPlanId)
    if (!plan || plan.ownerUserId !== where.workoutPlan.ownerUserId) {
      return false
    }
  }

  return true
}

function matchesPlanSetWhere(entry: StoredPlanSet, where: any): boolean {
  if (!where) {
    return true
  }

  if (where.id && entry.id !== where.id) {
    return false
  }

  if (where.planExerciseId && entry.planExerciseId !== where.planExerciseId) {
    return false
  }

  if (where.planExercise?.workoutPlan?.ownerUserId) {
    const planExercise = state.planExercises.find((item) => item.id === entry.planExerciseId)
    const plan = planExercise ? state.workoutPlans.find((item) => item.id === planExercise.workoutPlanId) : null

    if (!plan || plan.ownerUserId !== where.planExercise.workoutPlan.ownerUserId) {
      return false
    }
  }

  return true
}

function matchesSessionWhere(session: StoredSession, where: any): boolean {
  if (!where) {
    return true
  }

  if (where.id && session.id !== where.id) {
    return false
  }

  if (where.ownerUserId && session.ownerUserId !== where.ownerUserId) {
    return false
  }

  if (where.status && session.status !== where.status) {
    return false
  }

  if (where.workoutPlanId && session.workoutPlanId !== where.workoutPlanId) {
    return false
  }

  return true
}

function matchesSessionSetWhere(entry: StoredSessionSet, where: any): boolean {
  if (!where) {
    return true
  }

  if (where.exerciseId && entry.exerciseId !== where.exerciseId) {
    return false
  }

  if (typeof where.isPR !== 'undefined' && entry.isPR !== where.isPR) {
    return false
  }

  if (where.setType?.in && !where.setType.in.includes(entry.setType)) {
    return false
  }

  if (where.workoutSession) {
    const session = state.sessions.find((item) => item.id === entry.workoutSessionId)

    if (!session) {
      return false
    }

    if (where.workoutSession.ownerUserId && session.ownerUserId !== where.workoutSession.ownerUserId) {
      return false
    }

    if (where.workoutSession.status && session.status !== where.workoutSession.status) {
      return false
    }
  }

  return true
}

const mockDb = {
  user: {
    async findUnique({ select, where }: { select?: Record<string, boolean>; where: { email?: string; id?: string } }) {
      const user = where.email
        ? state.users.find((entry) => entry.email === where.email)
        : state.users.find((entry) => entry.id === where.id)

      return user ? applySelect(user, select) : null
    },
    async update({ data, where }: { data: Partial<Pick<StoredUser, 'displayName' | 'theme'>>; where: { id: string } }) {
      const user = state.users.find((entry) => entry.id === where.id)

      if (!user) {
        throw new Error('User not found')
      }

      Object.assign(user, data, { updatedAt: new Date() })
      return user
    },
  },
  exercise: {
    async count({ where }: { where?: any }) {
      return state.exercises.filter((entry) => matchesExerciseWhere(entry, where)).length
    },
    async create({ data }: { data: Omit<StoredExercise, 'createdAt' | 'updatedAt'> }) {
      const exercise: StoredExercise = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      state.exercises.push(exercise)
      return exercise
    },
    async findFirst({ select, where }: { select?: Record<string, boolean>; where?: any }) {
      const exercise = state.exercises.find((entry) => matchesExerciseWhere(entry, where))
      return exercise ? applySelect(exercise, select) : null
    },
    async findMany({ orderBy, skip = 0, take, where }: { orderBy?: any[]; skip?: number; take?: number; where?: any }) {
      const items = [...state.exercises].filter((entry) => matchesExerciseWhere(entry, where))

      if (orderBy) {
        items.sort((left, right) => {
          if (left.source !== right.source) {
            return left.source.localeCompare(right.source)
          }

          return left.name.localeCompare(right.name)
        })
      }

      return items.slice(skip, typeof take === 'number' ? skip + take : undefined)
    },
  },
  planExercise: {
    async create({ data }: { data: StoredPlanExercise }) {
      state.planExercises.push(data)
      return data
    },
    async delete({ where }: { where: { id: string } }) {
      state.planExercises = state.planExercises.filter((entry) => entry.id !== where.id)
    },
    async findFirst({ include, orderBy, where }: { include?: any; orderBy?: any; where?: any }) {
      let items = state.planExercises.filter((entry) => matchesPlanExerciseWhere(entry, where))

      if (orderBy?.order === 'desc') {
        items = items.sort((left, right) => right.order - left.order)
      }

      const entry = items[0]

      if (!entry) {
        return null
      }

      if (include?.sets) {
        return {
          ...entry,
          sets: state.planSets.filter((set) => set.planExerciseId === entry.id).sort((left, right) => right.order - left.order),
        }
      }

      return entry
    },
    async findMany({ orderBy, where }: { orderBy?: any; where?: any }) {
      const items = state.planExercises.filter((entry) => matchesPlanExerciseWhere(entry, where))
      return orderBy?.order === 'asc' ? items.sort((left, right) => left.order - right.order) : items
    },
    async update({ data, where }: { data: Partial<Pick<StoredPlanExercise, 'order'>>; where: { id: string } }) {
      const entry = state.planExercises.find((item) => item.id === where.id)

      if (!entry) {
        throw new Error('Plan exercise not found')
      }

      Object.assign(entry, data)
      return entry
    },
  },
  planSet: {
    async create({ data }: { data: StoredPlanSet }) {
      state.planSets.push(data)
      return data
    },
    async delete({ where }: { where: { id: string } }) {
      state.planSets = state.planSets.filter((entry) => entry.id !== where.id)
    },
    async findFirst({ include, where }: { include?: any; where?: any }) {
      const entry = state.planSets.find((item) => matchesPlanSetWhere(item, where))

      if (!entry) {
        return null
      }

      if (include?.planExercise) {
        return {
          ...entry,
          planExercise: {
            id: state.planExercises.find((planExercise) => planExercise.id === entry.planExerciseId)!.id,
            workoutPlanId: state.planExercises.find((planExercise) => planExercise.id === entry.planExerciseId)!.workoutPlanId,
          },
        }
      }

      return entry
    },
    async findMany({ orderBy, where }: { orderBy?: any; where?: any }) {
      const items = state.planSets.filter((entry) => matchesPlanSetWhere(entry, where))
      return orderBy?.order === 'asc' ? items.sort((left, right) => left.order - right.order) : items
    },
    async update({ data, where }: { data: Partial<Omit<StoredPlanSet, 'id' | 'planExerciseId'>>; where: { id: string } }) {
      const entry = state.planSets.find((item) => item.id === where.id)

      if (!entry) {
        throw new Error('Plan set not found')
      }

      Object.assign(entry, data)
      return entry
    },
  },
  sessionSet: {
    async count({ where }: { where?: any }) {
      return state.sessionSets.filter((entry) => matchesSessionSetWhere(entry, where)).length
    },
    async create({ data, include }: { data: Omit<StoredSessionSet, 'createdAt'>; include?: any }) {
      const entry: StoredSessionSet = {
        ...data,
        createdAt: new Date(),
      }

      state.sessionSets.push(entry)

      if (include?.exercise) {
        return {
          ...entry,
          exercise: state.exercises.find((exercise) => exercise.id === entry.exerciseId)!,
        }
      }

      return entry
    },
    async findMany({ include, orderBy, select, skip = 0, take, where }: { include?: any; orderBy?: any[]; select?: any; skip?: number; take?: number; where?: any }) {
      let items = state.sessionSets.filter((entry) => matchesSessionSetWhere(entry, where))

      if (orderBy) {
        items = items.sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      }

      const sliced = items.slice(skip, typeof take === 'number' ? skip + take : undefined)

      return sliced.map((entry) => {
        if (select) {
          return applySelect(entry, select)
        }

        if (include?.exercise || include?.workoutSession) {
          return {
            ...entry,
            ...(include?.exercise ? { exercise: state.exercises.find((exercise) => exercise.id === entry.exerciseId)! } : {}),
            ...(include?.workoutSession
              ? {
                  workoutSession: {
                    completedAt: state.sessions.find((session) => session.id === entry.workoutSessionId)!.completedAt,
                  },
                }
              : {}),
          }
        }

        return entry
      })
    },
  },
  workoutPlan: {
    async count({ where }: { where?: any }) {
      return state.workoutPlans.filter((plan) => matchesWorkoutPlanWhere(plan, where)).length
    },
    async create({ data, include }: { data: Omit<StoredWorkoutPlan, 'createdAt' | 'updatedAt'>; include?: any }) {
      const plan: StoredWorkoutPlan = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      state.workoutPlans.push(plan)
      return include ? buildWorkoutPlan(plan) : plan
    },
    async delete({ where }: { where: { id: string } }) {
      state.workoutPlans = state.workoutPlans.filter((plan) => plan.id !== where.id)
      state.planExercises = state.planExercises.filter((entry) => entry.workoutPlanId !== where.id)
    },
    async findFirst({ include, where }: { include?: any; where?: any }) {
      const plan = state.workoutPlans.find((entry) => matchesWorkoutPlanWhere(entry, where))
      return plan ? (include ? buildWorkoutPlan(plan) : plan) : null
    },
    async findMany({ include, orderBy, skip = 0, take, where }: { include?: any; orderBy?: any[]; skip?: number; take?: number; where?: any }) {
      let items = state.workoutPlans.filter((entry) => matchesWorkoutPlanWhere(entry, where))

      if (orderBy?.[0]?.updatedAt === 'desc') {
        items = items.sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
      }

      return items.slice(skip, typeof take === 'number' ? skip + take : undefined).map((plan) => (include ? buildWorkoutPlan(plan) : plan))
    },
    async update({ data, include, where }: { data: Partial<Pick<StoredWorkoutPlan, 'accent' | 'focusLabel' | 'name'>>; include?: any; where: { id: string } }) {
      const plan = state.workoutPlans.find((entry) => entry.id === where.id)

      if (!plan) {
        throw new Error('Workout plan not found')
      }

      Object.assign(plan, data, { updatedAt: new Date() })
      return include ? buildWorkoutPlan(plan) : plan
    },
  },
  workoutSession: {
    async count({ where }: { where?: any }) {
      return state.sessions.filter((entry) => matchesSessionWhere(entry, where)).length
    },
    async create({ data, include }: { data: Omit<StoredSession, 'startedAt'>; include?: any }) {
      const session: StoredSession = {
        ...data,
        startedAt: new Date(),
      }

      state.sessions.push(session)
      return include ? buildSession(session) : session
    },
    async findFirst({ include, where }: { include?: any; where?: any }) {
      const session = state.sessions.find((entry) => matchesSessionWhere(entry, where))

      if (!session) {
        return null
      }

      if (include?.workoutPlan?.include?.exercises) {
        return {
          ...session,
          workoutPlan: {
            ...state.workoutPlans.find((plan) => plan.id === session.workoutPlanId)!,
            exercises: state.planExercises
              .filter((entry) => entry.workoutPlanId === session.workoutPlanId)
              .map((entry) => ({ exerciseId: entry.exerciseId })),
          },
        }
      }

      return include ? buildSession(session) : session
    },
    async findMany({ include, orderBy, skip = 0, take, where }: { include?: any; orderBy?: any[]; skip?: number; take?: number; where?: any }) {
      let items = state.sessions.filter((entry) => matchesSessionWhere(entry, where))

      if (orderBy?.[0]?.startedAt === 'desc') {
        items = items.sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime())
      }

      return items.slice(skip, typeof take === 'number' ? skip + take : undefined).map((session) => (include ? buildSession(session) : session))
    },
    async update({ data, include, where }: { data: Partial<Pick<StoredSession, 'completedAt' | 'durationSeconds' | 'status'>>; include?: any; where: { id: string } }) {
      const session = state.sessions.find((entry) => entry.id === where.id)

      if (!session) {
        throw new Error('Session not found')
      }

      Object.assign(session, data)
      return include ? buildSession(session) : session
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
const { issueAuthTokens } = await import('../../src/modules/auth/infrastructure/auth-tokens.js')

function authorizationFor(userId: string, role: 'STUDENT' | 'TRAINER' = 'STUDENT') {
  return `Bearer ${issueAuthTokens({ id: userId, role }).accessToken}`
}

describe('training flow integration', () => {
  beforeEach(() => {
    state = createState()
  })

  it('lists default and owned custom exercises without leaking foreign custom exercises', async () => {
    const response = await request(createTestApp())
      .get('/exercises')
      .set('Authorization', authorizationFor('user-1'))

    expect(response.status).toBe(200)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.items.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002']),
    )
    expect(response.body.items.map((item: { id: string }) => item.id)).not.toContain('550e8400-e29b-41d4-a716-446655440003')
  })

  it('enforces the student workout plan cap', async () => {
    for (let index = 0; index < 4; index += 1) {
      state.workoutPlans.push({
        accent: null,
        createdAt: new Date(),
        focusLabel: null,
        id: `extra-plan-${index}`,
        name: `Plan ${index}`,
        ownerUserId: 'user-1',
        updatedAt: new Date(),
      })
    }

    const response = await request(createTestApp())
      .post('/workout-plans')
      .set('Authorization', authorizationFor('user-1'))
      .send({ name: 'Overflow Plan' })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('WORKOUT_PLAN_LIMIT_REACHED')
  })

  it('rejects workout plan edits when a session for that plan is active', async () => {
    state.sessions.push({
      completedAt: null,
      durationSeconds: null,
      id: '550e8400-e29b-41d4-a716-446655440040',
      ownerUserId: 'user-1',
      startedAt: new Date('2026-04-06T12:00:00.000Z'),
      status: 'ACTIVE',
      workoutPlanId: '550e8400-e29b-41d4-a716-446655440010',
    })

    const response = await request(createTestApp())
      .patch('/workout-plans/550e8400-e29b-41d4-a716-446655440010')
      .set('Authorization', authorizationFor('user-1'))
      .send({ name: 'Locked name' })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('WORKOUT_PLAN_LOCKED')
  })

  it('supports the session lifecycle, exercise history, and profile stats', async () => {
    const app = createTestApp()
    const authorization = authorizationFor('user-1')

    const startResponse = await request(app)
      .post('/sessions')
      .set('Authorization', authorization)
      .send({ workoutPlanId: '550e8400-e29b-41d4-a716-446655440010' })

    expect(startResponse.status).toBe(201)
    expect(startResponse.body.workoutPlanName).toBe('Push')

    const sessionId = startResponse.body.id as string

    const activeResponse = await request(app).get('/sessions/active').set('Authorization', authorization)

    expect(activeResponse.status).toBe(200)
    expect(activeResponse.body.id).toBe(sessionId)

    const setResponse = await request(app)
      .post(`/sessions/${sessionId}/sets`)
      .set('Authorization', authorization)
      .send({
        exerciseId: '550e8400-e29b-41d4-a716-446655440001',
        setType: 'NORMAL',
        weightKg: 100,
        reps: 8,
      })

    expect(setResponse.status).toBe(201)
    expect(setResponse.body.isPR).toBe(true)
    expect(setResponse.body.exerciseName).toBe('Barbell Bench Press')

    const completeResponse = await request(app)
      .patch(`/sessions/${sessionId}/complete`)
      .set('Authorization', authorization)
      .send({})

    expect(completeResponse.status).toBe(200)
    expect(completeResponse.body.status).toBe('COMPLETED')

    const listResponse = await request(app).get('/sessions').set('Authorization', authorization)

    expect(listResponse.status).toBe(200)
    expect(listResponse.body.items[0].totalVolumeKg).toBe(800)
    expect(listResponse.body.items[0].exerciseCount).toBe(1)

    const detailResponse = await request(app).get(`/sessions/${sessionId}`).set('Authorization', authorization)

    expect(detailResponse.status).toBe(200)
    expect(detailResponse.body.sets[0].exerciseName).toBe('Barbell Bench Press')

    const historyResponse = await request(app)
      .get('/exercises/550e8400-e29b-41d4-a716-446655440001/history')
      .set('Authorization', authorization)

    expect(historyResponse.status).toBe(200)
    expect(historyResponse.body.items).toHaveLength(1)
    expect(historyResponse.body.items[0].volume).toBe(800)

    const statsResponse = await request(app).get('/users/me/stats').set('Authorization', authorization)

    expect(statsResponse.status).toBe(200)
    expect(statsResponse.body.totalSessions).toBe(1)
    expect(statsResponse.body.prCount).toBe(1)
  })
})
