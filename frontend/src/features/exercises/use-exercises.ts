import { useQuery } from '@tanstack/react-query'
import type { ExerciseSource, MuscleGroup } from '@the-volumn/shared'
import { getExercises } from '../../services/exercises-service'

type UseExercisesOptions = {
  muscleGroup?: MuscleGroup
  page?: number
  pageSize?: number
  search?: string
  source?: ExerciseSource
}

export function useExercises(options: UseExercisesOptions = {}) {
  const { muscleGroup, page = 1, pageSize = 20, search, source } = options

  return useQuery({
    queryKey: ['exercises', page, pageSize, search ?? '', muscleGroup ?? 'ALL', source ?? 'ALL'],
    queryFn: () =>
      getExercises({
        page,
        pageSize,
        ...(search ? { search } : {}),
        ...(muscleGroup ? { muscleGroup } : {}),
        ...(source ? { source } : {}),
      }),
  })
}
