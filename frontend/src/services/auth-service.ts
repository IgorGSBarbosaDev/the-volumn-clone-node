import type { AuthSession, LoginRequest, RegisterRequest } from '@the-volumn/shared'
import { publicApiClient } from './api-client'

export async function register(payload: RegisterRequest) {
  const response = await publicApiClient.post<AuthSession>('/auth/register', payload)
  return response.data
}

export async function login(payload: LoginRequest) {
  const response = await publicApiClient.post<AuthSession>('/auth/login', payload)
  return response.data
}

export async function refreshSession() {
  const response = await publicApiClient.post<AuthSession>('/auth/refresh')
  return response.data
}

export async function logout() {
  await publicApiClient.post('/auth/logout')
}
