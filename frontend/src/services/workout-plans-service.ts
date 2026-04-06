import type {
  AddPlanExerciseRequest,
  CreatePlanSetRequest,
  CreateWorkoutPlanRequest,
  PaginationQuery,
  PlanSet,
  ReorderPlanExercisesRequest,
  UpdatePlanSetRequest,
  UpdateWorkoutPlanRequest,
  WorkoutPlanDetail,
  WorkoutPlanListResponse,
} from '@the-volumn/shared'
import { apiClient } from './api-client'

export async function getWorkoutPlans(params: PaginationQuery = { page: 1, pageSize: 20 }) {
  const response = await apiClient.get<WorkoutPlanListResponse>('/workout-plans', { params })
  return response.data
}

export async function getWorkoutPlan(planId: string) {
  const response = await apiClient.get<WorkoutPlanDetail>(`/workout-plans/${planId}`)
  return response.data
}

export async function createWorkoutPlan(payload: CreateWorkoutPlanRequest) {
  const response = await apiClient.post<WorkoutPlanDetail>('/workout-plans', payload)
  return response.data
}

export async function updateWorkoutPlan(planId: string, payload: UpdateWorkoutPlanRequest) {
  const response = await apiClient.patch<WorkoutPlanDetail>(`/workout-plans/${planId}`, payload)
  return response.data
}

export async function deleteWorkoutPlan(planId: string) {
  await apiClient.delete(`/workout-plans/${planId}`)
}

export async function addPlanExercise(planId: string, payload: AddPlanExerciseRequest) {
  const response = await apiClient.post<WorkoutPlanDetail>(`/workout-plans/${planId}/exercises`, payload)
  return response.data
}

export async function removePlanExercise(planId: string, planExerciseId: string) {
  await apiClient.delete(`/workout-plans/${planId}/exercises/${planExerciseId}`)
}

export async function reorderPlanExercises(planId: string, payload: ReorderPlanExercisesRequest) {
  const response = await apiClient.patch<WorkoutPlanDetail>(`/workout-plans/${planId}/exercises/reorder`, payload)
  return response.data
}

export async function createPlanSet(planId: string, planExerciseId: string, payload: CreatePlanSetRequest) {
  const response = await apiClient.post<PlanSet>(`/workout-plans/${planId}/exercises/${planExerciseId}/sets`, payload)
  return response.data
}

export async function updatePlanSet(setId: string, payload: UpdatePlanSetRequest) {
  const response = await apiClient.patch<PlanSet>(`/plan-sets/${setId}`, payload)
  return response.data
}

export async function deletePlanSet(setId: string) {
  await apiClient.delete(`/plan-sets/${setId}`)
}
