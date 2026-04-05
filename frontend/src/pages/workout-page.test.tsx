import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { WorkoutPage } from './workout-page'

afterEach(() => {
  cleanup()
})

describe('WorkoutPage', () => {
  it('renders the workout list before a plan is selected', () => {
    render(
      <MemoryRouter>
        <WorkoutPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Workouts' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add new workout' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Push' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pull' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Upper' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Lower' })).toBeInTheDocument()
  })

  it('opens the push workout detail screen when the push workout is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <WorkoutPage />
      </MemoryRouter>,
    )

    await user.click(screen.getAllByRole('button', { name: 'Open Push workout' })[0])

    expect(screen.getByRole('heading', { level: 1, name: 'Push' })).toBeInTheDocument()
    expect(screen.getByText('11 work sets')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Back to workout plans' })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Start Workout' })).toHaveLength(2)
    expect(screen.queryByRole('heading', { name: 'Workouts' })).not.toBeInTheDocument()
  })

  it('returns to the workout list from the push detail screen', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <WorkoutPage />
      </MemoryRouter>,
    )

    await user.click(screen.getAllByRole('button', { name: 'Open Push workout' })[0])
    await user.click(screen.getAllByRole('button', { name: 'Back to workout plans' })[0])

    expect(screen.getByRole('heading', { level: 1, name: 'Workouts' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Open Push workout' })[0]).toBeInTheDocument()
    expect(screen.queryByText('11 work sets')).not.toBeInTheDocument()
  })
})
