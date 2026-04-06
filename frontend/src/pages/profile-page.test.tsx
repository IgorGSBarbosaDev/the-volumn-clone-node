import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProfilePage } from './profile-page'
import { renderWithProviders } from '../test/render-with-providers'

const mutateAsync = vi.fn().mockResolvedValue(undefined)

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

    renderWithProviders(<ProfilePage />)

    expect(screen.getByRole('heading', { name: 'Alex' })).toBeInTheDocument()
    expect(screen.getByText('Total completed sessions: 12')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Log Out' }))

    expect(mutateAsync).toHaveBeenCalled()
  })
})
