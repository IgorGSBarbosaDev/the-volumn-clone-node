import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '../../services/users-service'
import { setCurrentUser, useAuthStore } from './auth-store'

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated')
  const query = useQuery({
    enabled: isAuthenticated,
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    initialData: useAuthStore.getState().currentUser ?? undefined,
  })

  useEffect(() => {
    if (query.data) {
      setCurrentUser(query.data)
    }
  }, [query.data])

  return query
}
