import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HomePage } from './home-page'
import { renderWithProviders } from '../test/render-with-providers'

vi.mock('../features/auth/use-auth', () => ({
  useAuth: () => ({
    currentUser: {
      displayName: 'Alex',
      email: 'alex@example.com',
    },
  }),
}))

vi.mock('../features/users/use-current-user-stats', () => ({
  useCurrentUserStats: () => ({
    data: {
      prCount: 2,
      totalSessions: 4,
    },
  }),
}))

vi.mock('../features/workout-plans/use-workout-plans', () => ({
  useWorkoutPlans: () => ({
    data: {
      items: [
        {
          accent: 'violet',
          focusLabel: 'Push day',
          id: 'plan-1',
          muscleGroups: ['CHEST', 'TRICEPS'],
          name: 'Push',
          exerciseCount: 3,
          totalPlannedSets: 10,
        },
        {
          accent: 'blue',
          focusLabel: 'Pull day',
          id: 'plan-2',
          muscleGroups: ['BACK', 'BICEPS'],
          name: 'Pull',
          exerciseCount: 4,
          totalPlannedSets: 12,
        },
      ],
    },
  }),
}))

vi.mock('../features/sessions/use-sessions', () => ({
  useSessions: () => ({
    data: {
      items: [
        {
          completedAt: '2026-04-05T12:40:00.000Z',
          durationSeconds: 2700,
          exerciseCount: 3,
          id: 'session-1',
          startedAt: '2026-04-05T12:00:00.000Z',
          status: 'COMPLETED',
          totalSets: 8,
          totalVolumeKg: 2400,
          workoutPlanName: 'Push',
        },
        {
          completedAt: '2026-04-03T13:00:00.000Z',
          durationSeconds: 3180,
          exerciseCount: 4,
          id: 'session-2',
          startedAt: '2026-04-03T12:07:00.000Z',
          status: 'COMPLETED',
          totalSets: 7,
          totalVolumeKg: 1800,
          workoutPlanName: 'Pull',
        },
      ],
    },
  }),
}))

vi.mock('../features/sessions/use-active-session', () => ({
  useActiveSession: () => ({
    data: {
      id: 'active-1',
      totalSets: 3,
      workoutPlanName: 'Push',
    },
  }),
}))

describe('HomePage', () => {
  it('renders the figma dashboard structure with live training data', () => {
    renderWithProviders(<HomePage />, '/home')

    expect(screen.getByRole('heading', { name: 'The Volumn' })).toBeInTheDocument()
    expect(screen.getByLabelText('Monthly overview')).toBeInTheDocument()
    expect(screen.getByText('4 sessions logged')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recommended Plans' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recent Sessions' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Resume active session' })).toHaveAttribute('href', '/sessions/active')
    expect(screen.getAllByText('Push').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pull').length).toBeGreaterThan(0)
    expect(screen.getByText('2.4k kg')).toBeInTheDocument()
  })
})
