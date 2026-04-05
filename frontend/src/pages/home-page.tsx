import { NavLink } from 'react-router-dom'
import { ThemeSwitcher } from '../components/theme-switcher'
import { useThemeStore } from '../store/theme-store'

const calendarDays = [
  [null, null, null, 1, 2, 3, 4],
  [5, 6, 7, 8, 9, 10, 11],
  [12, 13, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24, 25],
  [26, 27, 28, 29, 30, null, null],
]

const recommendedPlans = [
  { accent: 'blue', exerciseCount: 4, name: 'Upper' },
  { accent: 'orange', exerciseCount: 4, name: 'Lower' },
  { accent: 'violet', exerciseCount: 4, name: 'Push' },
] as const

const recentSessions = [
  { duration: '45m', name: 'Push', sets: '11 sets', totalLoad: '7.2k kg', when: 'Mar 30' },
  { duration: '53m', name: 'Pull', sets: '7 sets', totalLoad: '2.8k kg', when: 'Mar 28' },
  { duration: '70m', name: 'Lower', sets: '7 sets', totalLoad: '5.3k kg', when: 'Mar 26' },
  { duration: '45m', name: 'Push', sets: '7 sets', totalLoad: '5.3k kg', when: 'Mar 23' },
  { duration: '53m', name: 'Pull', sets: '6 sets', totalLoad: '3.2k kg', when: 'Mar 18' },
] as const

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const
const volumeBars = [
  { label: 'Jan', value: 34 },
  { label: 'Feb', value: 61 },
  { label: 'Mar', value: 96 },
  { label: 'Apr', value: 0 },
] as const
const navItems = [
  { label: 'Dashboard', to: '/home' },
  { label: 'Workouts', to: '/workout' },
  { label: 'History', to: '/history' },
  { label: 'Profile', to: '/profile' },
] as const

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

export function HomePage() {
  const theme = useThemeStore((state) => state.theme)
  const cycleTheme = useThemeStore((state) => state.cycleTheme)

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
          <p>Wednesday, April 1</p>
          <h1>The Volumn</h1>
        </header>

        <section className="home-card home-card--calendar" aria-label="Monthly overview">
          <div className="home-calendar__header">
            <button aria-label="Previous month" className="home-icon-button home-icon-button--small" type="button">
              <IconChevron direction="left" />
            </button>
            <div>
              <h2>April 2026</h2>
              <p>0 sessions logged</p>
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

          <div className="home-calendar__grid" aria-label="April 2026 days">
            {calendarDays.flatMap((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const key = `${weekIndex}-${dayIndex}`
                if (day === null) {
                  return <span key={key} className="home-calendar__day home-calendar__day--empty" aria-hidden="true" />
                }

                return (
                  <button
                    key={key}
                    aria-pressed={day === 1}
                    className={`home-calendar__day${day === 1 ? ' home-calendar__day--selected' : ''}`}
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
            <strong>3</strong>
            <span>workouts completed</span>
          </article>
          <article className="home-card home-kpi">
            <p className="home-kpi__eyebrow">Month PRs</p>
            <strong>0</strong>
            <span>personal records</span>
          </article>
        </section>

        <section className="home-card home-card--volume" aria-label="Training volume chart">
          <div className="home-section-title">
            <div>
              <h2>Training Volume</h2>
              <p>Last 3 months</p>
            </div>
            <span>vs Jan</span>
          </div>

          <div className="home-volume-chart" role="img" aria-label="Training volume bars for January to April">
            {volumeBars.map((bar, index) => (
              <div key={bar.label} className="home-volume-chart__column">
                <div
                  className={`home-volume-chart__bar${index === 2 ? ' home-volume-chart__bar--highlight' : ''}`}
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
            <button className="home-link-button" type="button">
              My plans
              <IconChevron direction="right" />
            </button>
          </div>

          <div className="home-plan-grid">
            {recommendedPlans.map((plan) => (
              <article key={plan.name} className="home-plan-card">
                <span className={`home-plan-card__icon home-plan-card__icon--${plan.accent}`}>
                  <IconSpark />
                </span>
                <strong>{plan.name}</strong>
                <span>{plan.exerciseCount} exercises</span>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-title">
            <h2>Recent Sessions</h2>
            <button className="home-link-button" type="button">
              View all
              <IconChevron direction="right" />
            </button>
          </div>

          <div className="home-session-list">
            {recentSessions.map((session) => (
              <article key={`${session.name}-${session.when}`} className="home-session-card">
                <div>
                  <strong>{session.name}</strong>
                  <p>
                    <span>{session.when}</span>
                    <span aria-hidden="true">·</span>
                    <span>{session.duration}</span>
                    <span aria-hidden="true">·</span>
                    <span>{session.sets}</span>
                    <span aria-hidden="true">·</span>
                    <span>{session.totalLoad}</span>
                  </p>
                </div>
                <span className="home-session-card__chevron" aria-hidden="true">
                  <IconChevron direction="right" />
                </span>
              </article>
            ))}
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
