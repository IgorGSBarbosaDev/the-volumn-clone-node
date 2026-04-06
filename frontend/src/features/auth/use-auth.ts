import { useAuthStore } from './auth-store'

export function useAuth() {
  const status = useAuthStore((state) => state.status)
  const currentUser = useAuthStore((state) => state.currentUser)

  return {
    status,
    currentUser,
    isAuthenticated: status === 'authenticated',
  }
}
