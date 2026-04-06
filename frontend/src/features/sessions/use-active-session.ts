import { useQuery } from '@tanstack/react-query'
import { getActiveSession } from '../../services/sessions-service'

export function useActiveSession() {
  return useQuery({
    retry: false,
    queryKey: ['active-session'],
    queryFn: getActiveSession,
  })
}
