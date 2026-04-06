import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HistoryPage } from './history-page'
import { renderWithProviders } from '../test/render-with-providers'

vi.mock('../features/sessions/use-sessions', () => ({
  useSessions: () => ({
    data: {
      items: [
        {
          completedAt: '2026-04-05T12:45:00.000Z',
          durationSeconds: 2700,
          exerciseCount: 3,
          id: 'session-1',
          startedAt: '2026-04-05T12:00:00.000Z',
          status: 'COMPLETED',
          totalSets: 8,
          totalVolumeKg: 2500,
          workoutPlanName: 'Push',
        },
        {
          completedAt: '2026-04-03T13:00:00.000Z',
          durationSeconds: 3180,
          exerciseCount: 4,
          id: 'session-2',
          startedAt: '2026-04-03T12:07:00.000Z',
          status: 'ACTIVE',
          totalSets: 6,
          totalVolumeKg: 1800,
          workoutPlanName: 'Pull',
        },
      ],
    },
  }),
}))

describe('HistoryPage', () => {
  it('renders the figma history structure with live session cards', () => {
    renderWithProviders(<HistoryPage />, '/history')

    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search sessions' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open calendar view' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Push' })).toHaveAttribute('href', '/sessions/session-1')
    expect(screen.getByText('2.5k kg')).toBeInTheDocument()
  })
})
