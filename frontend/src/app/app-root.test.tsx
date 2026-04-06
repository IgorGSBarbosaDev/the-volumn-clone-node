import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoot } from './app-root'
import { useAuthStore } from '../features/auth/auth-store'

vi.mock('../features/auth/auth-runtime', () => ({
  bootstrapAuth: vi.fn(async () => undefined),
}))

vi.mock('../pages/landing-page', () => ({
  LandingPage: () => <h1>Landing</h1>,
}))

vi.mock('../pages/login-page', () => ({
  LoginPage: () => <h1>Login</h1>,
}))

vi.mock('../pages/register-page', () => ({
  RegisterPage: () => <h1>Register</h1>,
}))

vi.mock('../pages/home-page', () => ({
  HomePage: () => <h1>Home</h1>,
}))

vi.mock('../pages/workout-page', () => ({
  WorkoutPage: () => <h1>Workouts</h1>,
}))

vi.mock('../pages/history-page', () => ({
  HistoryPage: () => <h1>History</h1>,
}))

vi.mock('../pages/profile-page', () => ({
  ProfilePage: () => <h1>Profile</h1>,
}))

vi.mock('../pages/profile-edit-page', () => ({
  ProfileEditPage: () => <h1>Edit Profile</h1>,
}))

vi.mock('../pages/session-detail-page', () => ({
  SessionDetailPage: () => <h1>Session Detail</h1>,
}))

vi.mock('../pages/exercise-history-page', () => ({
  ExerciseHistoryPage: () => <h1>Exercise History</h1>,
}))

vi.mock('../pages/active-session-page', () => ({
  ActiveSessionPage: () => <h1>Active Session</h1>,
}))

vi.mock('../pages/workout-plan-editor-page', () => ({
  WorkoutPlanEditorPage: () => <h1>Plan Editor</h1>,
}))

describe('AppRoot', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
    useAuthStore.setState({
      accessToken: null,
      accessTokenExpiresAt: null,
      currentUser: null,
      status: 'unauthenticated',
    })
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the public landing route', () => {
    render(<AppRoot />)

    expect(screen.getByRole('heading', { name: 'Landing' })).toBeInTheDocument()
  })

  it('redirects private routes to login when unauthenticated', async () => {
    window.history.pushState({}, '', '/home')

    render(<AppRoot />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    })
  })

  it('renders private routes when authenticated', async () => {
    window.history.pushState({}, '', '/workout')
    useAuthStore.setState({
      accessToken: 'token',
      accessTokenExpiresAt: '2026-04-06T12:00:00.000Z',
      currentUser: {
        id: 'user-1',
        email: 'alex@example.com',
        displayName: 'Alex',
        role: 'STUDENT',
        theme: 'rose',
        createdAt: '2026-04-06T12:00:00.000Z',
        updatedAt: '2026-04-06T12:00:00.000Z',
      },
      status: 'authenticated',
    })

    render(<AppRoot />)

    expect(screen.getByRole('heading', { name: 'Workouts' })).toBeInTheDocument()
  })

  it('keeps auth-only public routes available when logged out', () => {
    window.history.pushState({}, '', '/register')

    render(<AppRoot />)

    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument()
  })
})
