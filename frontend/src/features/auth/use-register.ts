import { useMutation } from '@tanstack/react-query'
import type { RegisterRequest } from '@the-volumn/shared'
import { register } from '../../services/auth-service'
import { setAuthSession } from './auth-store'

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload),
    onSuccess: (session) => {
      setAuthSession(session)
    },
  })
}
