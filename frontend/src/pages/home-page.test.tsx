import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HomePage } from './home-page'

describe('HomePage', () => {
  it('renders the core mobile dashboard sections from figma', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'The Volumn' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recommended Plans' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recent Sessions' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByLabelText('Monthly overview')).toBeInTheDocument()
    expect(screen.getByText('Training Volume')).toBeInTheDocument()
    expect(screen.getAllByText('Push').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pull').length).toBeGreaterThan(0)
  })
})
