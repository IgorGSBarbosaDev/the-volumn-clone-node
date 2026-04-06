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

type MockState = {
  refreshTokens: StoredRefreshToken[]
  users: StoredUser[]
}

function createState(): MockState {
  return {
    refreshTokens: [],
    users: [],
  }
}

let state = createState()

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
    async update({
      where,
      data,
    }: {
      where: { id: string }
      data: Partial<Pick<StoredUser, 'displayName' | 'theme'>>
    }) {
      const user = state.users.find((entry) => entry.id === where.id)

      if (!user) {
        throw new Error('User not found')
      }

      Object.assign(user, data, { updatedAt: new Date() })
      return user
    },
  },
  refreshToken: {
    async create({
      data,
    }: {
      data: StoredRefreshToken
    }) {
      state.refreshTokens.push(data)
      return data
    },
    async findUnique({ where }: { where: { tokenHash?: string; id?: string } }) {
      if (where.tokenHash) {
        return state.refreshTokens.find((token) => token.tokenHash === where.tokenHash) ?? null
      }

      if (where.id) {
        return state.refreshTokens.find((token) => token.id === where.id) ?? null
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

async function registerAndAuthenticate() {
  const response = await request(createTestApp()).post('/auth/register').send({
    email: 'alex@example.com',
    password: 'password123',
    displayName: 'Alex',
    role: 'STUDENT',
    theme: 'rose',
  })

  return {
    accessToken: getAccessToken(response),
    app: createTestApp(),
    userId: response.body.user.id as string,
  }
}

describe('current user profile and theme preference', () => {
  beforeEach(() => {
    state = createState()
  })

  it('rejects current-user reads without a bearer token', async () => {
    const response = await request(createTestApp()).get('/users/me')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('returns the authenticated current user profile', async () => {
    const { accessToken, app } = await registerAndAuthenticate()

    const response = await request(app).get('/users/me').set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      email: 'alex@example.com',
      displayName: 'Alex',
      role: 'STUDENT',
      theme: 'rose',
    })
    expect(typeof response.body.id).toBe('string')
    expect(typeof response.body.createdAt).toBe('string')
    expect(typeof response.body.updatedAt).toBe('string')
  })

  it('updates only the display name when requested', async () => {
    const { accessToken, app, userId } = await registerAndAuthenticate()

    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ displayName: 'Alex Updated' })

    expect(response.status).toBe(200)
    expect(response.body.displayName).toBe('Alex Updated')
    expect(response.body.theme).toBe('rose')
    expect(state.users.find((user) => user.id === userId)?.displayName).toBe('Alex Updated')
  })

  it('updates only the theme when requested', async () => {
    const { accessToken, app, userId } = await registerAndAuthenticate()

    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ theme: 'green' })

    expect(response.status).toBe(200)
    expect(response.body.displayName).toBe('Alex')
    expect(response.body.theme).toBe('green')
    expect(state.users.find((user) => user.id === userId)?.theme).toBe('green')
  })

  it('updates display name and theme together and persists them for later reads', async () => {
    const { accessToken, app } = await registerAndAuthenticate()

    const patchResponse = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        displayName: 'Alex Profile',
        theme: 'black',
      })

    expect(patchResponse.status).toBe(200)
    expect(patchResponse.body.displayName).toBe('Alex Profile')
    expect(patchResponse.body.theme).toBe('black')

    const getResponse = await request(app).get('/users/me').set('Authorization', `Bearer ${accessToken}`)

    expect(getResponse.status).toBe(200)
    expect(getResponse.body.displayName).toBe('Alex Profile')
    expect(getResponse.body.theme).toBe('black')
  })

  it('rejects empty profile updates', async () => {
    const { accessToken, app } = await registerAndAuthenticate()

    const response = await request(app).patch('/users/me').set('Authorization', `Bearer ${accessToken}`).send({})

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects invalid theme values', async () => {
    const { accessToken, app } = await registerAndAuthenticate()

    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ theme: 'violet' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects invalid display-name lengths', async () => {
    const { accessToken, app } = await registerAndAuthenticate()

    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ displayName: 'A' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns user-not-found when the authenticated user no longer exists on reads', async () => {
    const { accessToken, app, userId } = await registerAndAuthenticate()
    state.users = state.users.filter((user) => user.id !== userId)

    const response = await request(app).get('/users/me').set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('USER_NOT_FOUND')
  })

  it('returns user-not-found when the authenticated user no longer exists on updates', async () => {
    const { accessToken, app, userId } = await registerAndAuthenticate()
    state.users = state.users.filter((user) => user.id !== userId)

    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ theme: 'green' })

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('USER_NOT_FOUND')
  })
})
