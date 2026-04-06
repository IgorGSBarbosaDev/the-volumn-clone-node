import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandBadge } from '../components/brand-badge'
import { TextField } from '../components/text-field'
import { ThemeSwitcher } from '../components/theme-switcher'
import { useRegister } from '../features/auth/use-register'
import { getErrorMessage } from '../services/http-error'
import { useThemeStore } from '../store/theme-store'

export function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const theme = useThemeStore((state) => state.theme)
  const cycleTheme = useThemeStore((state) => state.cycleTheme)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'STUDENT' | 'TRAINER'>('STUDENT')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await registerMutation.mutateAsync({
      email,
      password,
      displayName,
      role,
      theme,
    })
    navigate('/home', { replace: true })
  }

  return (
    <main className="login-shell">
      <ThemeSwitcher onToggle={cycleTheme} theme={theme} />

      <section className="login-card" aria-label="Register screen">
        <BrandBadge />

        <header className="login-copy">
          <h1>Create your account</h1>
          <p>Start building plans and tracking progression.</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <TextField label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          <TextField label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value as 'STUDENT' | 'TRAINER')}>
              <option value="STUDENT">Student</option>
              <option value="TRAINER">Trainer</option>
            </select>
          </label>

          <p>Selected theme: {theme}</p>

          {registerMutation.isError ? <p>{getErrorMessage(registerMutation.error, 'Registration failed')}</p> : null}

          <button className="primary-action" disabled={registerMutation.isPending} type="submit">
            {registerMutation.isPending ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="login-signup-copy">
          <span>Already have an account? </span>
          <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}
