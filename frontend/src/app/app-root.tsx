import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { bootstrapAuth } from '../features/auth/auth-runtime'
import { useAuth } from '../features/auth/use-auth'
import { ActiveSessionPage } from '../pages/active-session-page'
import { ExerciseHistoryPage } from '../pages/exercise-history-page'
import { HistoryPage } from '../pages/history-page'
import { HomePage } from '../pages/home-page'
import { LandingPage } from '../pages/landing-page'
import { LoginPage } from '../pages/login-page'
import { ProfileEditPage } from '../pages/profile-edit-page'
import { ProfilePage } from '../pages/profile-page'
import { RegisterPage } from '../pages/register-page'
import { SessionDetailPage } from '../pages/session-detail-page'
import { WorkoutPage } from '../pages/workout-page'
import { WorkoutPlanEditorPage } from '../pages/workout-plan-editor-page'
import { useThemeStore } from '../store/theme-store'
import { AppProviders } from './app-providers'

function AuthBootstrappedLayout() {
  const { isAuthenticated, status } = useAuth()

  if (status === 'bootstrapping') {
    return <main style={{ padding: '2rem' }}>Loading session...</main>
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  return <Outlet />
}

function PublicOnlyLayout() {
  const { isAuthenticated, status } = useAuth()

  if (status === 'bootstrapping') {
    return <main style={{ padding: '2rem' }}>Loading session...</main>
  }

  if (isAuthenticated) {
    return <Navigate replace to="/home" />
  }

  return <Outlet />
}

function AppRouter() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    void bootstrapAuth()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingPage />} path="/" />

        <Route element={<PublicOnlyLayout />}>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
        </Route>

        <Route element={<AuthBootstrappedLayout />}>
          <Route element={<HomePage />} path="/home" />
          <Route element={<WorkoutPage />} path="/workout" />
          <Route element={<WorkoutPlanEditorPage />} path="/workout/:planId/edit" />
          <Route element={<ActiveSessionPage />} path="/sessions/active" />
          <Route element={<SessionDetailPage />} path="/sessions/:sessionId" />
          <Route element={<HistoryPage />} path="/history" />
          <Route element={<ExerciseHistoryPage />} path="/history/exercises/:exerciseId" />
          <Route element={<ProfilePage />} path="/profile" />
          <Route element={<ProfileEditPage />} path="/profile/edit" />
        </Route>

        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export function AppRoot() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
