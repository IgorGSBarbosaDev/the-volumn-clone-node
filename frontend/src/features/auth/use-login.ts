import { useMutation } from '@tanstack/react-query'
import type { LoginRequest } from '@the-volumn/shared'
import { login } from '../../services/auth-service'
import { setAuthSession } from './auth-store'

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (session) => {
      setAuthSession(session)
    },
  })
}
