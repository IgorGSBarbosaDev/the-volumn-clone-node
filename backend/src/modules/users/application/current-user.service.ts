import type { CurrentUserResponse, UpdateCurrentUserRequest } from '@the-volumn/shared'
import { ApiError } from '../../../shared/http/api-error.js'
import { mapUserSummary } from '../../../shared/lib/user-summary.js'
import { findCurrentUserById, updateCurrentUserProfile } from '../infrastructure/current-user.repository.js'

export async function getCurrentUser(userId: string): Promise<CurrentUserResponse> {
  const user = await findCurrentUserById(userId)

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  return mapUserSummary(user)
}

export async function updateCurrentUser(userId: string, payload: UpdateCurrentUserRequest): Promise<CurrentUserResponse> {
  const user = await findCurrentUserById(userId)

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  const updatedUser = await updateCurrentUserProfile(userId, payload)

  return mapUserSummary(updatedUser)
}
