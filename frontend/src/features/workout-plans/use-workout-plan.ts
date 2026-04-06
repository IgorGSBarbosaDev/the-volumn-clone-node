import { useQuery } from '@tanstack/react-query'
import { getWorkoutPlan } from '../../services/workout-plans-service'

export function useWorkoutPlan(planId: string | undefined) {
  return useQuery({
    enabled: Boolean(planId),
    queryKey: ['workout-plan', planId],
    queryFn: () => getWorkoutPlan(planId!),
  })
}
