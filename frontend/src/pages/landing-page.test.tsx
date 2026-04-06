import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LandingPage } from './landing-page'
import { renderWithProviders } from '../test/render-with-providers'

describe('LandingPage', () => {
  it('renders the marketing landing page content with navigation CTAs', () => {
    renderWithProviders(<LandingPage />)

    expect(screen.getByRole('heading', { name: 'Track Every Lift. Dominate Every Gym.' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Tracking Free' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Sign In' })[0]).toBeInTheDocument()
  })
})
