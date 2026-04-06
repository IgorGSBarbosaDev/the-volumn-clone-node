import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateCurrentUserRequest } from '@the-volumn/shared'
import { updateCurrentUser } from '../../services/users-service'
import { setCurrentUser } from '../auth/auth-store'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCurrentUserRequest) => updateCurrentUser(payload),
    onSuccess: (user) => {
      setCurrentUser(user)
      void queryClient.invalidateQueries({ queryKey: ['current-user'] })
    },
  })
}
