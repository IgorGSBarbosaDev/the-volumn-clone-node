import { useQuery } from '@tanstack/react-query'
import { getCurrentUserStats } from '../../services/users-service'
import { useAuthStore } from '../auth/auth-store'

export function useCurrentUserStats() {
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated')

  return useQuery({
    enabled: isAuthenticated,
    queryKey: ['current-user-stats'],
    queryFn: getCurrentUserStats,
  })
}
