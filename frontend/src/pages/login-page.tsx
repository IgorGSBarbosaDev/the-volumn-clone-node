import { useState } from 'react'
import { BrandBadge } from '../components/brand-badge'
import { TextField } from '../components/text-field'
import { ThemeSwitcher } from '../components/theme-switcher'
import { useThemeStore } from '../store/theme-store'

const DEMO_EMAIL = 'alex@example.com'
const DEMO_PASSWORD = 'password123'

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="primary-action__icon" viewBox="0 0 16 16">
      <path
        d="M3.3 8h8.6m0 0-3-3m3 3-3 3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg aria-hidden="true" className="field__icon" viewBox="0 0 18 18">
      <path
        d="M1.7 9s2.6-4.5 7.3-4.5S16.3 9 16.3 9 13.7 13.5 9 13.5 1.7 9 1.7 9Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <circle cx="9" cy="9" r={visible ? '2.6' : '1.8'} fill="none" stroke="currentColor" strokeWidth="1.5" />
      {!visible ? (
        <path
          d="M4.4 13.2 13.6 4.8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      ) : null}
    </svg>
  )
}

export function LoginPage() {
  const theme = useThemeStore((state) => state.theme)
  const cycleTheme = useThemeStore((state) => state.cycleTheme)
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="login-shell">
      <ThemeSwitcher onToggle={cycleTheme} theme={theme} />

      <section className="login-card" aria-label="Login screen">
        <BrandBadge />

        <header className="login-copy">
          <h1>Welcome back</h1>
          <p>Log in to continue your training journey.</p>
        </header>

        <form className="login-form" onSubmit={(event) => event.preventDefault()}>
          <TextField
            aria-label="Email address"
            autoComplete="email"
            label="Email address"
            placeholder="alex@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <TextField
            aria-label="Password"
            autoComplete="current-password"
            label="Password"
            placeholder="password123"
            type={showPassword ? 'text' : 'password'}
            value={password}
            action={
              <button className="field__action" type="button">
                Forgot password?
              </button>
            }
            onChange={(event) => setPassword(event.target.value)}
          />

          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="field__toggle"
            type="button"
            onClick={() => setShowPassword((currentValue) => !currentValue)}
          >
            <EyeIcon visible={showPassword} />
          </button>

          <button className="primary-action" type="submit">
            <span>Log In</span>
            <ArrowIcon />
          </button>
        </form>

        <div className="login-divider" aria-hidden="true">
          <span />
          <strong>or</strong>
          <span />
        </div>

        <button
          className="secondary-action"
          type="button"
          onClick={() => {
            setEmail(DEMO_EMAIL)
            setPassword(DEMO_PASSWORD)
          }}
        >
          Use demo credentials
        </button>

        <p className="login-signup-copy">
          <span>Don&apos;t have an account? </span>
          <button className="login-signup-copy__action" type="button">
            Sign up free
          </button>
        </p>
      </section>
    </main>
  )
}

