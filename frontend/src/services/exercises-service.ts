import type {
  CreateExerciseRequest,
  Exercise,
  ExerciseHistoryResponse,
  ExercisesListResponse,
  ExercisesQuery,
} from '@the-volumn/shared'
import { apiClient } from './api-client'

export async function getExercises(params: ExercisesQuery) {
  const response = await apiClient.get<ExercisesListResponse>('/exercises', { params })
  return response.data
}

export async function createExercise(payload: CreateExerciseRequest) {
  const response = await apiClient.post<Exercise>('/exercises', payload)
  return response.data
}

export async function getExerciseHistory(exerciseId: string, page = 1, pageSize = 20) {
  const response = await apiClient.get<ExerciseHistoryResponse>(`/exercises/${exerciseId}/history`, {
    params: { page, pageSize },
  })
  return response.data
}
