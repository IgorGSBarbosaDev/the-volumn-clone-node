import type { CurrentUserResponse, CurrentUserStatsResponse, UpdateCurrentUserRequest } from '@the-volumn/shared'
import { db } from '../../../config/db.js'
import { ApiError } from '../../../shared/http/api-error.js'
import { mapUserSummary } from '../../../shared/lib/user-summary.js'
import { getCurrentUserStats as getCurrentUserStatsSnapshot } from '../../sessions/application/sessions.service.js'

export async function getCurrentUser(userId: string): Promise<CurrentUserResponse> {
  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  return mapUserSummary(user)
}

export async function updateCurrentUser(userId: string, payload: UpdateCurrentUserRequest): Promise<CurrentUserResponse> {
  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: payload,
  })

  return mapUserSummary(updatedUser)
}

export async function getCurrentUserStats(userId: string): Promise<CurrentUserStatsResponse> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  return getCurrentUserStatsSnapshot(userId)
}
