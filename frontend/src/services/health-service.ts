import { apiClient } from './api-client'

export type HealthResponse = {
  service: string
  status: string
  time: string
}

export async function getHealth() {
  const response = await apiClient.get<HealthResponse>('/health')
  return response.data
}
