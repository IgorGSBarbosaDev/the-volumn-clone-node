import userEvent from '@testing-library/user-event'
import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WorkoutPage } from './workout-page'
import { renderWithProviders } from '../test/render-with-providers'

const mockNavigate = vi.fn()
const createPlanMutateAsync = vi.fn()
const deletePlanMutateAsync = vi.fn()
const startSessionMutateAsync = vi.fn().mockResolvedValue({ id: 'session-1' })

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../features/workout-plans/use-workout-plans', () => ({
  useWorkoutPlans: () => ({
    data: {
      items: [
        {
          accent: 'violet',
          exerciseCount: 3,
          focusLabel: 'Push day',
          id: 'plan-1',
          muscleGroups: ['CHEST', 'TRICEPS'],
          name: 'Push',
          totalPlannedSets: 10,
        },
        {
          accent: 'blue',
          exerciseCount: 4,
          focusLabel: 'Pull day',
          id: 'plan-2',
          muscleGroups: ['BACK', 'BICEPS'],
          name: 'Pull',
          totalPlannedSets: 12,
        },
      ],
    },
  }),
}))

vi.mock('../features/workout-plans/use-workout-plan', () => ({
  useWorkoutPlan: (planId: string | undefined) => ({
    data:
      planId === 'plan-1'
        ? {
            accent: 'violet',
            exerciseCount: 2,
            exercises: [
              {
                exerciseId: 'exercise-1',
                exerciseName: 'Barbell Bench Press',
                id: 'plan-exercise-1',
                muscleGroup: 'CHEST',
                order: 0,
                sets: [
                  { id: 'set-1', notes: null, order: 0, setType: 'WARM_UP', targetLoadKg: 60, targetReps: 12 },
                  { id: 'set-2', notes: null, order: 1, setType: 'NORMAL', targetLoadKg: 100, targetReps: 8 },
                ],
              },
              {
                exerciseId: 'exercise-2',
                exerciseName: 'Tricep Pushdown',
                id: 'plan-exercise-2',
                muscleGroup: 'TRICEPS',
                order: 1,
                sets: [{ id: 'set-3', notes: null, order: 0, setType: 'FAILURE', targetLoadKg: 40, targetReps: 10 }],
              },
            ],
            focusLabel: 'Push day',
            id: 'plan-1',
            muscleGroups: ['CHEST', 'TRICEPS'],
            name: 'Push',
            totalPlannedSets: 3,
          }
        : undefined,
    isError: false,
    isLoading: false,
  }),
}))

vi.mock('../features/sessions/use-active-session', () => ({
  useActiveSession: () => ({
    data: {
      id: 'active-1',
      workoutPlanId: 'plan-2',
      workoutPlanName: 'Push',
    },
  }),
}))

vi.mock('../features/workout-plans/use-workout-plan-mutations', () => ({
  useCreateWorkoutPlan: () => ({
    error: null,
    isError: false,
    isPending: false,
    mutateAsync: createPlanMutateAsync,
  }),
  useDeleteWorkoutPlan: () => ({
    isPending: false,
    mutateAsync: deletePlanMutateAsync,
  }),
}))

vi.mock('../features/sessions/use-session-mutations', () => ({
  useStartSession: () => ({
    error: null,
    isError: false,
    isPending: false,
    mutateAsync: startSessionMutateAsync,
  }),
}))

afterEach(() => {
  cleanup()
})

describe('WorkoutPage', () => {
  it('renders the figma workout list with live plans', () => {
    renderWithProviders(<WorkoutPage />, '/workout')

    expect(screen.getByRole('heading', { name: 'Workouts' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add new workout' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open Push workout' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open Pull workout' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '/history')
  })

  it('opens the workout detail screen and starts a session from live plan data', async () => {
    const user = userEvent.setup()

    renderWithProviders(<WorkoutPage />, '/workout')

    await user.click(screen.getByRole('button', { name: 'Open Push workout' }))
    await user.click(screen.getAllByRole('button', { name: 'Start Workout' })[0])

    expect(screen.getByRole('heading', { level: 1, name: 'Push' })).toBeInTheDocument()
    expect(screen.getByText('2 work sets')).toBeInTheDocument()
    expect(screen.getByText('Barbell Bench Press')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Editor' })).toHaveAttribute('href', '/workout/plan-1/edit')
    expect(startSessionMutateAsync).toHaveBeenCalledWith({ workoutPlanId: 'plan-1' })
  })
})
