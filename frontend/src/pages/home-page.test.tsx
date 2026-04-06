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
          id: 'plan-1',
          name: 'Push',
          exerciseCount: 3,
          totalPlannedSets: 10,
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
          id: 'session-1',
          totalSets: 8,
          totalVolumeKg: 2400,
          workoutPlanName: 'Push',
        },
      ],
    },
  }),
}))

vi.mock('../features/sessions/use-active-session', () => ({
  useActiveSession: () => ({
    data: {
      totalSets: 3,
      workoutPlanName: 'Push',
    },
  }),
}))

describe('HomePage', () => {
  it('renders dashboard data from live hooks instead of static placeholders', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Total sessions: 4')).toBeInTheDocument()
    expect(screen.getByText(/Push is in progress/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/workout/plan-1/edit')
  })
})
