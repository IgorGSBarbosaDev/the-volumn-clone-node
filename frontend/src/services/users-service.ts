import type { CurrentUserResponse, CurrentUserStatsResponse, UpdateCurrentUserRequest } from '@the-volumn/shared'
import { apiClient } from './api-client'

export async function getCurrentUser() {
  const response = await apiClient.get<CurrentUserResponse>('/users/me')
  return response.data
}

export async function updateCurrentUser(payload: UpdateCurrentUserRequest) {
  const response = await apiClient.patch<CurrentUserResponse>('/users/me', payload)
  return response.data
}

export async function getCurrentUserStats() {
  const response = await apiClient.get<CurrentUserStatsResponse>('/users/me/stats')
  return response.data
}
