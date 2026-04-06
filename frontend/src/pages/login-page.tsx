import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandBadge } from '../components/brand-badge'
import { TextField } from '../components/text-field'
import { ThemeSwitcher } from '../components/theme-switcher'
import { useLogin } from '../features/auth/use-login'
import { getErrorMessage } from '../services/http-error'
import { useThemeStore } from '../store/theme-store'

export function LoginPage() {
  const navigate = useNavigate()
  const theme = useThemeStore((state) => state.theme)
  const cycleTheme = useThemeStore((state) => state.cycleTheme)
  const loginMutation = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await loginMutation.mutateAsync({ email, password })
    navigate('/home', { replace: true })
  }

  return (
    <main className="login-shell">
      <ThemeSwitcher onToggle={cycleTheme} theme={theme} />

      <section className="login-card" aria-label="Login screen">
        <BrandBadge />

        <header className="login-copy">
          <h1>Welcome back</h1>
          <p>Log in to continue your training journey.</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <TextField
            autoComplete="email"
            label="Email address"
            placeholder="alex@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <TextField
            autoComplete="current-password"
            label="Password"
            placeholder="password123"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {loginMutation.isError ? <p>{getErrorMessage(loginMutation.error, 'Login failed')}</p> : null}

          <button className="primary-action" disabled={loginMutation.isPending} type="submit">
            {loginMutation.isPending ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="login-signup-copy">
          <span>Don&apos;t have an account? </span>
          <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  )
}
