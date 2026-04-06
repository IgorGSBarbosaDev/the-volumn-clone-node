import { useQuery } from '@tanstack/react-query'
import { getSession } from '../../services/sessions-service'

export function useSession(sessionId: string | undefined) {
  return useQuery({
    enabled: Boolean(sessionId),
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId!),
  })
}
