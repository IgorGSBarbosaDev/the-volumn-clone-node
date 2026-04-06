import type { WorkoutPlanSummary, WorkoutSessionSummary } from '@the-volumn/shared'
import { Link, NavLink } from 'react-router-dom'
import { ThemeSwitcher } from '../components/theme-switcher'
import { useAuth } from '../features/auth/use-auth'
import { useActiveSession } from '../features/sessions/use-active-session'
import { useSessions } from '../features/sessions/use-sessions'
import { useCurrentUserStats } from '../features/users/use-current-user-stats'
import { useWorkoutPlans } from '../features/workout-plans/use-workout-plans'
import { useThemeStore } from '../store/theme-store'

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const
const navItems = [
  { label: 'Dashboard', to: '/home' },
  { label: 'Workouts', to: '/workout' },
  { label: 'History', to: '/history' },
  { label: 'Profile', to: '/profile' },
] as const
const homeDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
})
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
})
const monthShortFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
const sessionDayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
})

function BrandPulseIcon() {
  return (
    <svg aria-hidden="true" className="home-brand__mark" viewBox="0 0 28 28">
      <defs>
        <linearGradient id="home-brand-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#C026D3" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="14" fill="url(#home-brand-gradient)" />
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

function IconSpark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path
        d="M8.2 1.8 9.6 5l3.3 1.3-3.3 1.3-1.4 3.2-1.4-3.2L3.5 6.3 6.8 5l1.4-3.2Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  )
}

function IconBolt() {
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

function IconChevron({ direction }: { direction: 'left' | 'right' }) {
  const path = direction === 'left' ? 'M9.8 3.5 6 8l3.8 4.5' : 'M6.2 3.5 10 8l-3.8 4.5'

  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path
        d={path}
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

function getCalendarWeeks(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: Array<number | null> = Array.from({ length: firstDayOfMonth }, () => null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(day)
  }

  while (days.length % 7 !== 0) {
    days.push(null)
  }

  const weeks: Array<Array<number | null>> = []

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7))
  }

  return weeks
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

function getHomeAccent(plan: WorkoutPlanSummary, index: number) {
  switch (plan.accent) {
    case 'blue':
      return 'blue'
    case 'amber':
      return 'orange'
    case 'rose':
    case 'violet':
      return 'violet'
    default:
      return ['violet', 'blue', 'orange'][index % 3]
  }
}

function getVolumeBars(sessions: WorkoutSessionSummary[]) {
  if (!sessions.length) {
    const now = new Date()

    return Array.from({ length: 4 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1)

      return {
        label: monthShortFormatter.format(monthDate),
        value: 0,
      }
    })
  }

  const source = sessions.slice(0, 4).reverse()
  const maxVolume = Math.max(...source.map((session) => session.totalVolumeKg), 1)

  return source.map((session) => ({
    label: monthShortFormatter.format(new Date(session.startedAt)),
    value: Math.round((session.totalVolumeKg / maxVolume) * 100),
  }))
}

export function HomePage() {
  const { currentUser } = useAuth()
  const theme = useThemeStore((state) => state.theme)
  const cycleTheme = useThemeStore((state) => state.cycleTheme)
  const statsQuery = useCurrentUserStats()
  const plansQuery = useWorkoutPlans(1, 3)
  const sessionsQuery = useSessions(1, 5)
  const activeSessionQuery = useActiveSession()
  const now = new Date()
  const calendarWeeks = getCalendarWeeks(now)
  const selectedDay = now.getDate()
  const plans = plansQuery.data?.items ?? []
  const sessions = sessionsQuery.data?.items ?? []
  const volumeBars = getVolumeBars(sessions)

  return (
    <main className="home-shell">
      <div className="home-topbar">
        <div className="home-brand">
          <BrandPulseIcon />
          <span>The Volumn</span>
        </div>

        <div className="home-topbar__actions">
          <ThemeSwitcher className="theme-switcher theme-switcher--inline" onToggle={cycleTheme} theme={theme} />
          <button aria-label="Quick actions" className="home-icon-button" type="button">
            <IconBolt />
          </button>
        </div>
      </div>

      <div className="home-content">
        <header className="home-header">
          <p>{homeDateFormatter.format(now)}</p>
          <h1>The Volumn</h1>
        </header>

        {activeSessionQuery.data ? (
          <section className="home-section">
            <div className="home-section-title">
              <div>
                <h2>Active Session</h2>
                <p>{currentUser?.email ?? 'Resume your in-progress workout'}</p>
              </div>
              <Link className="home-link-button" to="/sessions/active">
                Resume active session
                <IconChevron direction="right" />
              </Link>
            </div>

            <Link className="home-session-card" to="/sessions/active">
              <div>
                <strong>{activeSessionQuery.data.workoutPlanName}</strong>
                <p>
                  <span>{activeSessionQuery.data.totalSets} sets logged</span>
                  <span aria-hidden="true">·</span>
                  <span>Session in progress</span>
                </p>
              </div>
              <span className="home-session-card__chevron" aria-hidden="true">
                <IconChevron direction="right" />
              </span>
            </Link>
          </section>
        ) : null}

        <section className="home-card home-card--calendar" aria-label="Monthly overview">
          <div className="home-calendar__header">
            <button aria-label="Previous month" className="home-icon-button home-icon-button--small" type="button">
              <IconChevron direction="left" />
            </button>
            <div>
              <h2>{monthFormatter.format(now)}</h2>
              <p>{statsQuery.data?.totalSessions ?? 0} sessions logged</p>
            </div>
            <button aria-label="Next month" className="home-icon-button home-icon-button--small" type="button">
              <IconChevron direction="right" />
            </button>
          </div>

          <div className="home-calendar__weekdays" aria-hidden="true">
            {weekDays.map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>

          <div className="home-calendar__grid" aria-label={`${monthFormatter.format(now)} days`}>
            {calendarWeeks.flatMap((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const key = `${weekIndex}-${dayIndex}`

                if (day === null) {
                  return <span key={key} className="home-calendar__day home-calendar__day--empty" aria-hidden="true" />
                }

                return (
                  <button
                    key={key}
                    aria-pressed={day === selectedDay}
                    className={`home-calendar__day${day === selectedDay ? ' home-calendar__day--selected' : ''}`}
                    type="button"
                  >
                    {day}
                  </button>
                )
              }),
            )}
          </div>
        </section>

        <section className="home-kpis" aria-label="Weekly metrics">
          <article className="home-card home-kpi">
            <p className="home-kpi__eyebrow">This Week</p>
            <strong>{statsQuery.data?.totalSessions ?? 0}</strong>
            <span>workouts completed</span>
          </article>
          <article className="home-card home-kpi">
            <p className="home-kpi__eyebrow">Month PRs</p>
            <strong>{statsQuery.data?.prCount ?? 0}</strong>
            <span>personal records</span>
          </article>
        </section>

        <section className="home-card home-card--volume" aria-label="Training volume chart">
          <div className="home-section-title">
            <div>
              <h2>Training Volume</h2>
              <p>Last 4 logged sessions</p>
            </div>
            <span>{sessions.length ? 'live data' : 'no sessions'}</span>
          </div>

          <div className="home-volume-chart" role="img" aria-label="Training volume bars for recent sessions">
            {volumeBars.map((bar, index) => (
              <div key={`${bar.label}-${index}`} className="home-volume-chart__column">
                <div
                  className={`home-volume-chart__bar${index === volumeBars.length - 1 ? ' home-volume-chart__bar--highlight' : ''}`}
                  style={{ height: `${bar.value}%` }}
                />
                <span>{bar.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-title">
            <h2>Recommended Plans</h2>
            <Link className="home-link-button" to="/workout">
              My plans
              <IconChevron direction="right" />
            </Link>
          </div>

          <div className="home-plan-grid">
            {plans.length ? (
              plans.map((plan, index) => (
                <Link key={plan.id} className="home-plan-card" to={`/workout/${plan.id}/edit`}>
                  <span className={`home-plan-card__icon home-plan-card__icon--${getHomeAccent(plan, index)}`}>
                    <IconSpark />
                  </span>
                  <strong>{plan.name}</strong>
                  <span>{plan.focusLabel ?? `${plan.exerciseCount} exercises`}</span>
                </Link>
              ))
            ) : (
              <article className="home-plan-card">
                <span className="home-plan-card__icon home-plan-card__icon--violet">
                  <IconSpark />
                </span>
                <strong>No plans yet</strong>
                <span>Create your first workout to get started</span>
              </article>
            )}
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-title">
            <h2>Recent Sessions</h2>
            <Link className="home-link-button" to="/history">
              View all
              <IconChevron direction="right" />
            </Link>
          </div>

          <div className="home-session-list">
            {sessions.length ? (
              sessions.map((session) => (
                <Link key={session.id} className="home-session-card" to={`/sessions/${session.id}`}>
                  <div>
                    <strong>{session.workoutPlanName}</strong>
                    <p>
                      <span>{sessionDayFormatter.format(new Date(session.startedAt))}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDuration(session.durationSeconds)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{session.totalSets} sets</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatVolume(session.totalVolumeKg)}</span>
                    </p>
                  </div>
                  <span className="home-session-card__chevron" aria-hidden="true">
                    <IconChevron direction="right" />
                  </span>
                </Link>
              ))
            ) : (
              <article className="home-session-card">
                <div>
                  <strong>No sessions logged</strong>
                  <p>
                    <span>Start your first workout</span>
                  </p>
                </div>
                <span className="home-session-card__chevron" aria-hidden="true">
                  <IconChevron direction="right" />
                </span>
              </article>
            )}
          </div>
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
