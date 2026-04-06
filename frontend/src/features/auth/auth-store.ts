import type { AuthSession, UserSummary } from '@the-volumn/shared'
import { create } from 'zustand'
import { useThemeStore } from '../../store/theme-store'

export type AuthStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated'

type AuthStore = {
  accessToken: string | null
  accessTokenExpiresAt: string | null
  currentUser: UserSummary | null
  markUnauthenticated: () => void
  setAuthenticated: (session: AuthSession) => void
  setBootstrapping: () => void
  setCurrentUser: (user: UserSummary) => void
  status: AuthStatus
}

function syncTheme(theme: UserSummary['theme']) {
  useThemeStore.getState().setTheme(theme)
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  accessTokenExpiresAt: null,
  currentUser: null,
  status: 'bootstrapping',
  markUnauthenticated: () =>
    set({
      accessToken: null,
      accessTokenExpiresAt: null,
      currentUser: null,
      status: 'unauthenticated',
    }),
  setAuthenticated: (session) => {
    syncTheme(session.user.theme)
    set({
      accessToken: session.accessToken,
      accessTokenExpiresAt: session.accessTokenExpiresAt,
      currentUser: session.user,
      status: 'authenticated',
    })
  },
  setBootstrapping: () =>
    set((state) => ({
      ...state,
      status: 'bootstrapping',
    })),
  setCurrentUser: (user) => {
    syncTheme(user.theme)
    set((state) => ({
      ...state,
      currentUser: user,
      status: state.accessToken ? 'authenticated' : state.status,
    }))
  },
}))

export function getAccessToken() {
  return useAuthStore.getState().accessToken
}

export function setAuthSession(session: AuthSession) {
  useAuthStore.getState().setAuthenticated(session)
}

export function setCurrentUser(user: UserSummary) {
  useAuthStore.getState().setCurrentUser(user)
}

export function markAuthBootstrapping() {
  useAuthStore.getState().setBootstrapping()
}

export function clearAuthSession() {
  useAuthStore.getState().markUnauthenticated()
}
