import { useQuery } from '@tanstack/react-query'
import { getExerciseHistory } from '../../services/exercises-service'

export function useExerciseHistory(exerciseId: string | undefined, page = 1, pageSize = 20) {
  return useQuery({
    enabled: Boolean(exerciseId),
    queryKey: ['exercise-history', exerciseId, page, pageSize],
    queryFn: () => getExerciseHistory(exerciseId!, page, pageSize),
  })
}
