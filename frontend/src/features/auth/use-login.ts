import { useMutation } from '@tanstack/react-query'
import type { LoginRequest } from '@the-volumn/shared'
import { login } from '../../services/auth-service'

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
  })
}
