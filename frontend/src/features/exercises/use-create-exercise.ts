import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateExerciseRequest } from '@the-volumn/shared'
import { createExercise } from '../../services/exercises-service'

export function useCreateExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateExerciseRequest) => createExercise(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exercises'] })
    },
  })
}
