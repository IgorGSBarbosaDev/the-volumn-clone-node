import { db } from '../../../config/db.js'

export async function findExerciseById(exerciseId: string) {
  return db.exercise.findFirst({
    where: {
      id: exerciseId,
    },
  })
}
