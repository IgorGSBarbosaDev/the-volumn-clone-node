import userEvent from '@testing-library/user-event'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoot } from './app-root'
import { useThemeStore } from '../store/theme-store'

describe('AppRoot', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/home')
    window.localStorage.clear()
    useThemeStore.setState({ theme: 'rose' })
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the home route by default and cycles the theme from the dashboard top bar', async () => {
    const user = userEvent.setup()

    window.history.pushState({}, '', '/home')

    render(<AppRoot />)

    expect(document.documentElement).toHaveAttribute('data-theme', 'rose')
    expect(screen.getByRole('heading', { name: 'Recommended Plans' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /switch theme/i }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'green')
  })

  it('renders the landing page on the public root route', () => {
    window.history.pushState({}, '', '/')

    render(<AppRoot />)

    expect(screen.getByRole('heading', { name: 'Track Every Lift. Dominate Every Gym.' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Tracking Free' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Sign In' })[0]).toBeInTheDocument()
  })

  it('renders the workout page on the workout route', () => {
    window.history.pushState({}, '', '/workout')

    render(<AppRoot />)

    expect(screen.getByRole('heading', { name: 'Workouts' })).toBeInTheDocument()
  })

  it('keeps the push workout detail screen theme-aware when cycling themes', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/workout')

    render(<AppRoot />)

    await user.click(screen.getAllByRole('button', { name: 'Open Push workout' })[0])

    expect(screen.getByRole('heading', { level: 1, name: 'Push' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'rose')

    await user.click(screen.getByRole('button', { name: /switch theme/i }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'green')
    expect(screen.getByRole('heading', { level: 1, name: 'Push' })).toBeInTheDocument()
  })

  it('renders the history page on the history route', () => {
    window.history.pushState({}, '', '/history')

    render(<AppRoot />)

    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument()
  })

  it('renders the profile page on the profile route', () => {
    window.history.pushState({}, '', '/profile')

    render(<AppRoot />)

    expect(screen.getByRole('heading', { name: 'Alex Thompson' })).toBeInTheDocument()
  })

  it('renders the login page on the dedicated auth route', () => {
    window.history.pushState({}, '', '/login')

    render(<AppRoot />)

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })
})
