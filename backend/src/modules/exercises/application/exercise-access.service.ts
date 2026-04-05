import { ApiError } from '../../../shared/http/api-error.js'
import { EXERCISE_ERRORS } from '../domain/exercises.constants.js'
import { findExerciseById } from '../infrastructure/exercises.repository.js'

export async function getAccessibleExerciseById(userId: string, exerciseId: string) {
  const exercise = await findExerciseById(exerciseId)

  if (!exercise) {
    throw new ApiError(404, EXERCISE_ERRORS.exerciseNotFound.code, EXERCISE_ERRORS.exerciseNotFound.message)
  }

  if (exercise.source === 'DEFAULT') {
    return exercise
  }

  if (exercise.ownerUserId !== userId) {
    throw new ApiError(404, EXERCISE_ERRORS.exerciseNotFound.code, EXERCISE_ERRORS.exerciseNotFound.message)
  }

  return exercise
}
