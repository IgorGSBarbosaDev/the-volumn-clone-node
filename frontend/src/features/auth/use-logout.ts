import { useMutation } from '@tanstack/react-query'
import { logout } from '../../services/auth-service'
import { clearAuthSession } from './auth-store'

export function useLogout() {
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthSession()
    },
  })
}
