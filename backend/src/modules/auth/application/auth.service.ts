import { Prisma } from '@prisma/client'
import type { AuthSession, LoginRequest, RegisterRequest, UserRole } from '@the-volumn/shared'
import { randomUUID } from 'crypto'
import { db } from '../../../config/db.js'
import { ApiError } from '../../../shared/http/api-error.js'
import { mapUserSummary } from '../../../shared/lib/user-summary.js'
import { issueAuthTokens, hashRefreshToken, verifyRefreshToken } from '../infrastructure/auth-tokens.js'
import { hashPassword, verifyPassword } from '../infrastructure/password-hasher.js'

type AuthUserRecord = {
  createdAt: Date
  displayName: string
  email: string
  id: string
  role: UserRole
  theme: 'rose' | 'green' | 'black'
  updatedAt: Date
}

type AuthSessionResult = {
  authSession: AuthSession
  refreshToken: string
  refreshTokenExpiresAt: Date
}

type TransactionDb = Prisma.TransactionClient

export async function register(payload: RegisterRequest): Promise<AuthSessionResult> {
  const existingUser = await db.user.findUnique({
    where: { email: payload.email },
  })

  if (existingUser) {
    throw new ApiError(409, 'EMAIL_ALREADY_IN_USE', 'An account already exists for this email')
  }

  const passwordHash = await hashPassword(payload.password)
  const now = new Date()

  return db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        id: randomUUID(),
        email: payload.email,
        passwordHash,
        displayName: payload.displayName,
        role: payload.role,
        theme: payload.theme,
      },
    })

    return createPersistedAuthSession(tx, user, now)
  })
}

export async function login(payload: LoginRequest): Promise<AuthSessionResult> {
  const user = await db.user.findUnique({
    where: { email: payload.email },
  })

  if (!user || !(await verifyPassword(payload.password, user.passwordHash))) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect')
  }

  return db.$transaction(async (tx) => createPersistedAuthSession(tx, user, new Date()))
}

export async function refresh(refreshToken: string | undefined): Promise<AuthSessionResult> {
  if (!refreshToken) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid')
  }

  const claims = verifyRefreshToken(refreshToken)
  const persistedSession = await db.refreshToken.findUnique({
    where: {
      tokenHash: hashRefreshToken(refreshToken),
    },
  })

  if (!persistedSession || persistedSession.id !== claims.sessionId || persistedSession.userId !== claims.userId) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid')
  }

  if (persistedSession.revokedAt) {
    throw new ApiError(401, 'REFRESH_TOKEN_REVOKED', 'Refresh token has been revoked')
  }

  if (persistedSession.expiresAt.getTime() <= Date.now()) {
    throw new ApiError(401, 'REFRESH_TOKEN_EXPIRED', 'Refresh token has expired')
  }

  const user = await db.user.findUnique({
    where: { id: persistedSession.userId },
  })

  if (!user) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid')
  }

  const now = new Date()

  return db.$transaction(async (tx) => {
    const revokedSession = await tx.refreshToken.updateMany({
      where: {
        id: persistedSession.id,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    })

    if (revokedSession.count !== 1) {
      throw new ApiError(401, 'REFRESH_TOKEN_REVOKED', 'Refresh token has been revoked')
    }

    return createPersistedAuthSession(tx, user, now)
  })
}

export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) {
    return
  }

  try {
    const claims = verifyRefreshToken(refreshToken)
    const persistedSession = await db.refreshToken.findUnique({
      where: {
        tokenHash: hashRefreshToken(refreshToken),
      },
    })

    if (!persistedSession || persistedSession.id !== claims.sessionId || persistedSession.userId !== claims.userId || persistedSession.revokedAt) {
      return
    }

    await db.refreshToken.updateMany({
      where: {
        id: persistedSession.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return
    }

    throw error
  }
}

async function createPersistedAuthSession(tx: TransactionDb, user: AuthUserRecord, now: Date): Promise<AuthSessionResult> {
  const tokens = issueAuthTokens(
    {
      id: user.id,
      role: user.role,
    },
    now,
  )

  await tx.refreshToken.create({
    data: {
      id: tokens.refreshTokenId,
      userId: user.id,
      tokenHash: hashRefreshToken(tokens.refreshToken),
      createdAt: now,
      expiresAt: tokens.refreshTokenExpiresAt,
      revokedAt: null,
    },
  })

  return {
    authSession: {
      user: mapUserSummary(user),
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt.toISOString(),
    },
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
  }
}
