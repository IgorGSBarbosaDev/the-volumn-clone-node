import type {
  CompleteSessionRequest,
  CreateSessionSetRequest,
  PaginationQuery,
  SessionSet,
  SessionsListResponse,
  StartSessionRequest,
  WorkoutSessionDetail,
} from '@the-volumn/shared'
import { apiClient } from './api-client'

export async function startSession(payload: StartSessionRequest) {
  const response = await apiClient.post<WorkoutSessionDetail>('/sessions', payload)
  return response.data
}

export async function getSessions(params: PaginationQuery = { page: 1, pageSize: 20 }) {
  const response = await apiClient.get<SessionsListResponse>('/sessions', { params })
  return response.data
}

export async function getSession(sessionId: string) {
  const response = await apiClient.get<WorkoutSessionDetail>(`/sessions/${sessionId}`)
  return response.data
}

export async function getActiveSession() {
  const response = await apiClient.get<WorkoutSessionDetail>('/sessions/active')
  return response.data
}

export async function createSessionSet(sessionId: string, payload: CreateSessionSetRequest) {
  const response = await apiClient.post<SessionSet>(`/sessions/${sessionId}/sets`, payload)
  return response.data
}

export async function completeSession(sessionId: string, payload: CompleteSessionRequest = {}) {
  const response = await apiClient.patch<WorkoutSessionDetail>(`/sessions/${sessionId}/complete`, payload)
  return response.data
}
