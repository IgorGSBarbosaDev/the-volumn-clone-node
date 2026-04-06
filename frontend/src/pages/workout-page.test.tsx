import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WorkoutPage } from './workout-page'
import { renderWithProviders } from '../test/render-with-providers'

vi.mock('../features/workout-plans/use-workout-plans', () => ({
  useWorkoutPlans: () => ({
    data: {
      items: [
        {
          exerciseCount: 3,
          id: 'plan-1',
          muscleGroups: ['CHEST', 'TRICEPS'],
          name: 'Push',
          totalPlannedSets: 10,
        },
      ],
    },
  }),
}))

vi.mock('../features/sessions/use-active-session', () => ({
  useActiveSession: () => ({
    data: {
      workoutPlanName: 'Push',
    },
  }),
}))

vi.mock('../features/workout-plans/use-workout-plan-mutations', () => ({
  useCreateWorkoutPlan: () => ({
    error: null,
    isError: false,
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useDeleteWorkoutPlan: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useStartSession: undefined,
}))

vi.mock('../features/sessions/use-session-mutations', () => ({
  useStartSession: () => ({
    error: null,
    isError: false,
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}))

describe('WorkoutPage', () => {
  it('renders real workout plan summaries and editor links', () => {
    renderWithProviders(<WorkoutPage />)

    expect(screen.getByRole('heading', { name: 'Workouts' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open editor' })).toHaveAttribute('href', '/workout/plan-1/edit')
    expect(screen.getByText('Muscle groups: CHEST, TRICEPS')).toBeInTheDocument()
  })
})
