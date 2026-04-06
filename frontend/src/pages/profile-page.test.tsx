import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProfilePage } from './profile-page'
import { renderWithProviders } from '../test/render-with-providers'

const mutateAsync = vi.fn().mockResolvedValue(undefined)
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../features/auth/use-auth', () => ({
  useAuth: () => ({
    currentUser: {
      displayName: 'Alex',
      email: 'alex@example.com',
      role: 'STUDENT',
      theme: 'rose',
    },
  }),
}))

vi.mock('../features/users/use-current-user-stats', () => ({
  useCurrentUserStats: () => ({
    data: {
      prCount: 3,
      totalSessions: 12,
    },
  }),
}))

vi.mock('../features/auth/use-logout', () => ({
  useLogout: () => ({
    isPending: false,
    mutateAsync,
  }),
}))

describe('ProfilePage', () => {
  it('renders live profile data and logs out through the mutation', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ProfilePage />, '/profile')

    expect(screen.getByRole('heading', { name: 'Alex' })).toBeInTheDocument()
    expect(screen.getByLabelText('Profile stats')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /settings & account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /account info/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /performance hub/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('Total Sessions')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Log Out' }))

    expect(mutateAsync).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })
})
