import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './login-page'
import { renderWithProviders } from '../test/render-with-providers'

const mutateAsync = vi.fn().mockResolvedValue(undefined)

vi.mock('../features/auth/use-login', () => ({
  useLogin: () => ({
    error: null,
    isError: false,
    isPending: false,
    mutateAsync,
  }),
}))

describe('LoginPage', () => {
  it('submits credentials through the login mutation', async () => {
    const user = userEvent.setup()

    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText('Email address'), 'alex@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log In' }))

    expect(mutateAsync).toHaveBeenCalledWith({
      email: 'alex@example.com',
      password: 'password123',
    })
    expect(screen.getByRole('link', { name: 'Create one' })).toBeInTheDocument()
  })
})
