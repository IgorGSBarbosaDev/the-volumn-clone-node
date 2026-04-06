import { useQuery } from '@tanstack/react-query'
import { getWorkoutPlans } from '../../services/workout-plans-service'

export function useWorkoutPlans(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['workout-plans', page, pageSize],
    queryFn: () => getWorkoutPlans({ page, pageSize }),
  })
}
