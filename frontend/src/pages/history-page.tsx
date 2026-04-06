import { useState } from 'react'
import type { WorkoutSessionSummary } from '@the-volumn/shared'
import { Link, NavLink } from 'react-router-dom'
import { ThemeSwitcher } from '../components/theme-switcher'
import { useSessions } from '../features/sessions/use-sessions'
import { useThemeStore } from '../store/theme-store'

const navItems = [
  { label: 'Dashboard', to: '/home' },
  { label: 'Workouts', to: '/workout' },
  { label: 'History', to: '/history' },
  { label: 'Profile', to: '/profile' },
] as const
const historyDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
  year: 'numeric',
})

function BrandIcon() {
  return (
    <svg aria-hidden="true" className="home-brand__mark" viewBox="0 0 28 28">
      <defs>
        <linearGradient id="history-brand-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#C026D3" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="14" fill="url(#history-brand-gradient)" />
      <path
        d="M8.3 14.3h3.1l1.3-3.8 2.6 7.3 1.8-4.4h2.7"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function QuickActionsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path
        d="M9.1 1.8 4.9 8h2.6L6.9 14.2 11.1 8H8.5l.6-6.2Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18">
      <path
        d="M4 3.8h10A1.8 1.8 0 0 1 15.8 5.6v8.2A1.8 1.8 0 0 1 14 15.6H4a1.8 1.8 0 0 1-1.8-1.8V5.6A1.8 1.8 0 0 1 4 3.8Zm0 3.2h10M6 2.5v2.6m6-2.6v2.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path
        d="M11.3 11.3 14 14M7.1 12a4.9 4.9 0 1 0 0-9.8 4.9 4.9 0 0 0 0 9.8Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path
        d="M6.2 3.5 10 8l-3.8 4.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <rect x="3.2" y="3.2" width="5.1" height="5.1" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11.7" y="3.2" width="5.1" height="5.1" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3.2" y="11.7" width="5.1" height="5.1" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11.7" y="11.7" width="5.1" height="5.1" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function WorkoutsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path
        d="M6 7.5 8.2 9.7m3.6 3.6L14 15.5m-5.8-5.8 3.6 3.6m-5.8-3.6 2.2-2.2m5.6 5.8 2.2-2.2M4.4 5.9l1.5-1.5m8.2 8.2 1.5-1.5M2.9 7.4l2.9-2.9m8.4 8.4 2.9-2.9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path
        d="M4 10a6 6 0 1 0 1.8-4.3L4 7.4M4 4.6v2.8h2.8M10 6.4V10l2.6 1.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path
        d="M14.8 16.1a5.6 5.6 0 0 0-9.6 0M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function NavIcon({ label }: { label: (typeof navItems)[number]['label'] }) {
  switch (label) {
    case 'Dashboard':
      return <DashboardIcon />
    case 'Workouts':
      return <WorkoutsIcon />
    case 'History':
      return <HistoryIcon />
    case 'Profile':
      return <ProfileIcon />
  }
}

function formatDuration(durationSeconds: number | null) {
  if (!durationSeconds) {
    return '0m'
  }

  const totalMinutes = Math.round(durationSeconds / 60)

  if (totalMinutes < 60) {
    return `${totalMinutes}m`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}

function formatVolume(totalVolumeKg: number) {
  if (totalVolumeKg >= 1000) {
    return `${(totalVolumeKg / 1000).toFixed(1).replace(/\.0$/, '')}k kg`
  }

  return `${Math.round(totalVolumeKg)} kg`
}

function matchesSearch(session: WorkoutSessionSummary, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return (
    session.workoutPlanName.toLowerCase().includes(normalizedQuery) ||
    session.status.toLowerCase().includes(normalizedQuery)
  )
}

export function HistoryPage() {
  const theme = useThemeStore((state) => state.theme)
  const cycleTheme = useThemeStore((state) => state.cycleTheme)
  const sessionsQuery = useSessions(1, 20)
  const [searchValue, setSearchValue] = useState('')
  const visibleHistory = (sessionsQuery.data?.items ?? []).filter((session) => matchesSearch(session, searchValue)).slice(0, 10)

  return (
    <main className="history-shell">
      <div className="home-topbar">
        <div className="home-brand">
          <BrandIcon />
          <span>The Volumn</span>
        </div>

        <div className="home-topbar__actions">
          <ThemeSwitcher className="theme-switcher theme-switcher--inline" onToggle={cycleTheme} theme={theme} />
          <button aria-label="Quick actions" className="home-icon-button" type="button">
            <QuickActionsIcon />
          </button>
        </div>
      </div>

      <div className="history-content">
        <div className="history-header">
          <h1>History</h1>
          <button aria-label="Open calendar view" className="history-calendar-button" type="button">
            <CalendarIcon />
          </button>
        </div>

        <label className="history-search">
          <SearchIcon />
          <input
            aria-label="Search sessions"
            placeholder="Search sessions..."
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </label>

        <section className="history-list" aria-label="Workout history list">
          {visibleHistory.length ? (
            visibleHistory.map((session) => (
              <article key={session.id} className="history-card">
                <div className="history-card__header">
                  <p>{historyDateFormatter.format(new Date(session.startedAt))}</p>
                  <h2>
                    <Link to={`/sessions/${session.id}`}>{session.workoutPlanName}</Link>
                  </h2>
                </div>

                <div className="history-card__stats">
                  <div>
                    <span>Duration</span>
                    <strong>{formatDuration(session.durationSeconds)}</strong>
                  </div>
                  <div>
                    <span>Volume</span>
                    <strong>{formatVolume(session.totalVolumeKg)}</strong>
                  </div>
                  <div>
                    <span>Sets</span>
                    <strong>{session.totalSets}</strong>
                  </div>
                </div>

                <div className="history-card__footer">
                  <span>{session.exerciseCount} exercises</span>
                  <Link
                    aria-label={`Open ${session.workoutPlanName}`}
                    className="history-card__chevron"
                    to={`/sessions/${session.id}`}
                  >
                    <ChevronRightIcon />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <article className="history-card">
              <div className="history-card__header">
                <p>No matching history</p>
                <h2>{searchValue.trim() ? 'Try another search' : 'No workouts logged yet'}</h2>
              </div>

              <div className="history-card__stats">
                <div>
                  <span>Duration</span>
                  <strong>0m</strong>
                </div>
                <div>
                  <span>Volume</span>
                  <strong>0 kg</strong>
                </div>
                <div>
                  <span>Sets</span>
                  <strong>0</strong>
                </div>
              </div>

              <div className="history-card__footer">
                <span>Start logging sessions to build history</span>
                <span className="history-card__chevron" aria-hidden="true">
                  <ChevronRightIcon />
                </span>
              </div>
            </article>
          )}
        </section>
      </div>

      <nav aria-label="Primary" className="home-bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            className={({ isActive }) => `home-bottom-nav__item${isActive ? ' home-bottom-nav__item--active' : ''}`}
            to={item.to}
          >
            <span className="home-bottom-nav__icon">
              <NavIcon label={item.label} />
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </main>
  )
}
