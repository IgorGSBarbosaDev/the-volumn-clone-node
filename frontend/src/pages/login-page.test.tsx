import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoginPage } from './login-page'

describe('LoginPage', () => {
  it('renders the figma mobile login content', () => {
    render(<LoginPage />)

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toHaveValue('alex@example.com')
    expect(screen.getByLabelText('Password')).toHaveValue('password123')
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use demo credentials' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /switch theme/i })).toBeInTheDocument()
  })
})

