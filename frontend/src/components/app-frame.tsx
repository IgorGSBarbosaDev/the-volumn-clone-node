import type { PropsWithChildren, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../features/auth/auth-store'

type AppFrameProps = PropsWithChildren<{
  actions?: ReactNode
  subtitle?: string
  title: string
}>

const navItems = [
  { label: 'Home', to: '/home' },
  { label: 'Workouts', to: '/workout' },
  { label: 'History', to: '/history' },
  { label: 'Profile', to: '/profile' },
] as const

export function AppFrame({ actions, children, subtitle, title }: AppFrameProps) {
  const currentUser = useAuthStore((state) => state.currentUser)

  return (
    <main style={{ margin: '0 auto', maxWidth: 960, padding: '2rem 1rem 4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'start' }}>
        <div>
          <p style={{ margin: 0, opacity: 0.7 }}>The Volumn</p>
          <h1 style={{ marginBottom: '0.25rem' }}>{title}</h1>
          <p style={{ marginTop: 0, opacity: 0.8 }}>{subtitle ?? currentUser?.displayName ?? 'Authenticated session'}</p>
        </div>
        {actions ? <div>{actions}</div> : null}
      </header>

      <nav
        aria-label="Primary"
        style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1.5rem 0 2rem' }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            style={({ isActive }) => ({
              fontWeight: isActive ? 700 : 500,
              textDecoration: 'none',
            })}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <section style={{ display: 'grid', gap: '1rem' }}>{children}</section>
    </main>
  )
}
