import { useMutation } from '@tanstack/react-query'
import type { UpdateCurrentUserRequest } from '@the-volumn/shared'
import { updateCurrentUser } from '../../services/users-service'

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload: UpdateCurrentUserRequest) => updateCurrentUser(payload),
  })
}
