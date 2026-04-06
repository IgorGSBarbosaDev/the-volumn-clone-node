import { useQuery } from '@tanstack/react-query'
import { getSessions } from '../../services/sessions-service'

export function useSessions(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['sessions', page, pageSize],
    queryFn: () => getSessions({ page, pageSize }),
  })
}
