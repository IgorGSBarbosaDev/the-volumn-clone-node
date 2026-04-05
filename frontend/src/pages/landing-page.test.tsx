import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LandingPage } from './landing-page'

describe('LandingPage', () => {
  it('renders the marketing landing page content', () => {
    render(<LandingPage />)

    expect(screen.getByRole('heading', { name: 'Track Every Lift. Dominate Every Gym.' })).toBeInTheDocument()
    expect(screen.getByText('Built for Performance')).toBeInTheDocument()
    expect(screen.getByText('See your strength evolving.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Tracking Free' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Sign In' })[0]).toBeInTheDocument()
  })
})
