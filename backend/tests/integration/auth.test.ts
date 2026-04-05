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

function getRefreshCookie(response: request.Response) {
  return response.headers['set-cookie']?.[0] as string | undefined
}

describe('auth and session security', () => {
  beforeEach(() => {
    state = createState()
  })

  it('registers a user, returns an auth session, and sets the refresh cookie', async () => {
    const response = await request(createTestApp()).post('/auth/register').send({
      email: 'alex@example.com',
      password: 'password123',
      displayName: 'Alex',
      role: 'STUDENT',
      theme: 'rose',
    })

    expect(response.status).toBe(201)
    expect(response.body.user.email).toBe('alex@example.com')
    expect(response.body.user.role).toBe('STUDENT')
    expect(typeof response.body.accessToken).toBe('string')
    expect(typeof response.body.accessTokenExpiresAt).toBe('string')
    expect(getRefreshCookie(response)).toContain('HttpOnly')
    expect(getRefreshCookie(response)).toContain('SameSite=Lax')
  })

  it('rejects duplicate email registration', async () => {
    const app = createTestApp()

    await request(app).post('/auth/register').send({
      email: 'alex@example.com',
      password: 'password123',
      displayName: 'Alex',
      role: 'STUDENT',
      theme: 'rose',
    })

    const response = await request(app).post('/auth/register').send({
      email: 'alex@example.com',
      password: 'password123',
      displayName: 'Alex Clone',
      role: 'TRAINER',
      theme: 'green',
    })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('EMAIL_ALREADY_IN_USE')
  })

  it('logs in successfully and returns a fresh auth session cookie pair', async () => {
    const app = createTestApp()

    await request(app).post('/auth/register').send({
      email: 'alex@example.com',
      password: 'password123',
      displayName: 'Alex',
      role: 'STUDENT',
      theme: 'rose',
    })

    const response = await request(app).post('/auth/login').send({
      email: 'alex@example.com',
      password: 'password123',
    })

    expect(response.status).toBe(200)
    expect(response.body.user.displayName).toBe('Alex')
    expect(getRefreshCookie(response)).toContain('refreshToken=')
  })

  it('rejects invalid credentials with a generic auth error', async () => {
    const app = createTestApp()

    await request(app).post('/auth/register').send({
      email: 'alex@example.com',
      password: 'password123',
      displayName: 'Alex',
      role: 'STUDENT',
      theme: 'rose',
    })

    const response = await request(app).post('/auth/login').send({
      email: 'alex@example.com',
      password: 'wrong-password',
    })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('rotates refresh tokens and rejects the old refresh token after rotation', async () => {
    const app = createTestApp()

    const registerResponse = await request(app).post('/auth/register').send({
      email: 'alex@example.com',
      password: 'password123',
      displayName: 'Alex',
      role: 'STUDENT',
      theme: 'rose',
    })

    const oldCookie = getRefreshCookie(registerResponse)
    expect(oldCookie).toBeDefined()

    const refreshResponse = await request(app).post('/auth/refresh').set('Cookie', oldCookie!)

    expect(refreshResponse.status).toBe(200)
    const newCookie = getRefreshCookie(refreshResponse)
    expect(newCookie).toBeDefined()
    expect(newCookie).not.toBe(oldCookie)

    const replayResponse = await request(app).post('/auth/refresh').set('Cookie', oldCookie!)

    expect(replayResponse.status).toBe(401)
    expect(replayResponse.body.error.code).toBe('REFRESH_TOKEN_REVOKED')
  })

  it('rejects refresh when the cookie is missing', async () => {
    const response = await request(createTestApp()).post('/auth/refresh')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN')
  })

  it('rejects refresh when the persisted refresh session is expired', async () => {
    const app = createTestApp()

    const registerResponse = await request(app).post('/auth/register').send({
      email: 'alex@example.com',
      password: 'password123',
      displayName: 'Alex',
      role: 'STUDENT',
      theme: 'rose',
    })

    state.refreshTokens[0]!.expiresAt = new Date(Date.now() - 60_000)

    const response = await request(app).post('/auth/refresh').set('Cookie', getRefreshCookie(registerResponse)!)

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('REFRESH_TOKEN_EXPIRED')
  })

  it('logs out idempotently and revokes the current refresh session', async () => {
    const app = createTestApp()

    const registerResponse = await request(app).post('/auth/register').send({
      email: 'alex@example.com',
      password: 'password123',
      displayName: 'Alex',
      role: 'STUDENT',
      theme: 'rose',
    })

    const cookie = getRefreshCookie(registerResponse)!

    const firstLogout = await request(app).post('/auth/logout').set('Cookie', cookie)

    expect(firstLogout.status).toBe(204)
    expect(firstLogout.headers['set-cookie']?.[0]).toContain('Max-Age=0')
    expect(state.refreshTokens[0]?.revokedAt).toBeInstanceOf(Date)

    const secondLogout = await request(app).post('/auth/logout').set('Cookie', cookie)

    expect(secondLogout.status).toBe(204)
  })

  it('rejects protected users/me without a bearer token and accepts it with a valid one', async () => {
    const app = createTestApp()

    const unauthorized = await request(app).get('/users/me')

    expect(unauthorized.status).toBe(401)
    expect(unauthorized.body.error.code).toBe('UNAUTHORIZED')

    const registerResponse = await request(app).post('/auth/register').send({
      email: 'alex@example.com',
      password: 'password123',
      displayName: 'Alex',
      role: 'STUDENT',
      theme: 'rose',
    })

    const authorized = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${getAccessToken(registerResponse)}`)

    expect(authorized.status).toBe(200)
    expect(authorized.body.email).toBe('alex@example.com')
    expect(authorized.body.displayName).toBe('Alex')
  })

  it('rate limits auth routes after repeated requests', async () => {
    const app = createTestApp()

    const statuses: number[] = []

    for (let index = 0; index < 6; index += 1) {
      const response = await request(app).post('/auth/login').send({
        email: 'alex@example.com',
        password: 'password123',
      })

      statuses.push(response.status)
    }

    expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401])
    expect(statuses[5]).toBe(429)
  })
})
