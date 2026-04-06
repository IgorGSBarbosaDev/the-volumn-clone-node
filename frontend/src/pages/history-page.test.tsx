import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HistoryPage } from './history-page'
import { renderWithProviders } from '../test/render-with-providers'

vi.mock('../features/sessions/use-sessions', () => ({
  useSessions: () => ({
    data: {
      items: [
        {
          id: 'session-1',
          status: 'COMPLETED',
          totalSets: 8,
          totalVolumeKg: 2500,
          workoutPlanName: 'Push',
        },
      ],
    },
  }),
}))

describe('HistoryPage', () => {
  it('renders session history from the sessions query', () => {
    renderWithProviders(<HistoryPage />)

    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Push' })).toHaveAttribute('href', '/sessions/session-1')
    expect(screen.getByText(/Status: COMPLETED/)).toBeInTheDocument()
  })
})
