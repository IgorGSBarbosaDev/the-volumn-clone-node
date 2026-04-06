import type {
  CreateExerciseRequest,
  ExerciseHistoryResponse,
  ExercisesListResponse,
  ExercisesQuery,
  PaginationQuery,
} from '@the-volumn/shared'
import {
  createCustomExercise,
  listAccessibleExercises as listAccessibleExercisesFromRepository,
  listExerciseHistoryEntries,
} from '../infrastructure/exercises.repository.js'
import { getAccessibleExerciseById } from './exercise-access.service.js'

export async function listAccessibleExercises(userId: string, query: ExercisesQuery): Promise<ExercisesListResponse> {
  return listAccessibleExercisesFromRepository(userId, query)
}

export async function createOwnedExercise(userId: string, payload: CreateExerciseRequest) {
  return createCustomExercise(userId, payload)
}

export async function getAccessibleExerciseHistory(
  userId: string,
  exerciseId: string,
  pagination: PaginationQuery,
): Promise<ExerciseHistoryResponse> {
  const exercise = await getAccessibleExerciseById(userId, exerciseId)
  const history = await listExerciseHistoryEntries(userId, exercise.id, pagination)

  return {
    exercise,
    items: history.items,
    meta: history.meta,
  }
}
