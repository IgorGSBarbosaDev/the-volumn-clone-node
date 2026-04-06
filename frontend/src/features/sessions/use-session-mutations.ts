import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CompleteSessionRequest, CreateSessionSetRequest, StartSessionRequest } from '@the-volumn/shared'
import { completeSession, createSessionSet, startSession } from '../../services/sessions-service'

function invalidateSessionQueries(queryClient: ReturnType<typeof useQueryClient>, sessionId?: string) {
  void queryClient.invalidateQueries({ queryKey: ['sessions'] })
  void queryClient.invalidateQueries({ queryKey: ['current-user-stats'] })
  void queryClient.invalidateQueries({ queryKey: ['active-session'] })

  if (sessionId) {
    void queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
  }
}

export function useStartSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: StartSessionRequest) => startSession(payload),
    onSuccess: (session) => {
      invalidateSessionQueries(queryClient, session.id)
    },
  })
}

export function useCreateSessionSet(sessionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSessionSetRequest) => createSessionSet(sessionId, payload),
    onSuccess: () => {
      invalidateSessionQueries(queryClient, sessionId)
    },
  })
}

export function useCompleteSession(sessionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CompleteSessionRequest) => completeSession(sessionId, payload),
    onSuccess: () => {
      invalidateSessionQueries(queryClient, sessionId)
    },
  })
}
