import type { CurrentUserResponse, UpdateCurrentUserRequest } from '@the-volumn/shared'
import { apiClient } from './api-client'

export async function getCurrentUser() {
  const response = await apiClient.get<CurrentUserResponse>('/users/me')
  return response.data
}

export async function updateCurrentUser(payload: UpdateCurrentUserRequest) {
  const response = await apiClient.patch<CurrentUserResponse>('/users/me', payload)
  return response.data
}
