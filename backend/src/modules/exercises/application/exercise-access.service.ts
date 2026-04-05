import { ApiError } from '../../../shared/http/api-error.js'
import { findExerciseById } from '../infrastructure/exercise-access.repository.js'

export async function getAccessibleExerciseById(userId: string, exerciseId: string) {
  const exercise = await findExerciseById(exerciseId)

  if (!exercise) {
    throw new ApiError(404, 'EXERCISE_NOT_FOUND', 'Exercise not found')
  }

  if (exercise.source === 'DEFAULT') {
    return exercise
  }

  if (exercise.ownerUserId !== userId) {
    throw new ApiError(404, 'EXERCISE_NOT_FOUND', 'Exercise not found')
  }

  return exercise
}
