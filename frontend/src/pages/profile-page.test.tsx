import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ProfilePage } from './profile-page'

describe('ProfilePage', () => {
  it('renders the figma mobile profile screen content', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <ProfilePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Alex Thompson' })).toBeInTheDocument()
    expect(screen.getByLabelText('Profile stats')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /settings & account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /account info/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /performance hub/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page')
  })
})
