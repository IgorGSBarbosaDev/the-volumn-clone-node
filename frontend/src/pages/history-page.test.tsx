import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HistoryPage } from './history-page'

describe('HistoryPage', () => {
  it('renders the figma workout history screen and limits the list to 10 workouts', () => {
    render(
      <MemoryRouter initialEntries={['/history']}>
        <HistoryPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search sessions' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open calendar view' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('article')).toHaveLength(10)
  })
})
