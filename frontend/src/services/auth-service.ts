import type { AuthSession, LoginRequest, RegisterRequest } from '@the-volumn/shared'
import { apiClient } from './api-client'

export async function register(payload: RegisterRequest) {
  const response = await apiClient.post<AuthSession>('/auth/register', payload)
  return response.data
}

export async function login(payload: LoginRequest) {
  const response = await apiClient.post<AuthSession>('/auth/login', payload)
  return response.data
}

export async function refreshSession() {
  const response = await apiClient.post<AuthSession>('/auth/refresh')
  return response.data
}

export async function logout() {
  await apiClient.post('/auth/logout')
}
