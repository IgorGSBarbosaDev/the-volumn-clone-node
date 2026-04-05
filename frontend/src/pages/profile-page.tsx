import { NavLink } from 'react-router-dom'
import { ThemeSwitcher } from '../components/theme-switcher'
import { useThemeStore } from '../store/theme-store'

type SettingsItem = {
  badge?: string
  description: string
  icon: 'account' | 'pulse' | 'heart' | 'share' | 'help'
  title: string
}

const settingsItems: SettingsItem[] = [
  {
    description: 'Manage your personal details',
    icon: 'account',
    title: 'Account Info',
  },
  {
    badge: 'NEW',
    description: 'Charts, PRs, volume trends',
    icon: 'pulse',
    title: 'Performance Hub',
  },
  {
    description: 'Apple Health, Strava, Garmin',
    icon: 'heart',
    title: 'Connected Apps',
  },
  {
    description: 'CSV, JSON, PDF formats',
    icon: 'share',
    title: 'Export Data',
  },
  {
    description: 'Tutorials and documentation',
    icon: 'help',
    title: 'Help & Support',
  },
] as const

function BrandIcon() {
  return (
    <svg aria-hidden="true" className="home-brand__mark" viewBox="0 0 28 28">
      <defs>
        <linearGradient id="profile-brand-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#C026D3" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="14" fill="url(#profile-brand-gradient)" />
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

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path
        d="M3.7 11.8 11.5 4l1.5 1.5-7.8 7.8-2.4.6.9-2.1Zm7-7 1.1-1.1a1 1 0 0 1 1.4 0l.7.7a1 1 0 0 1 0 1.4l-1.1 1.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  )
}

function AvatarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48">
      <circle cx="24" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M11.5 36.5a14.5 14.5 0 0 1 25 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
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

function SettingIcon({ kind }: { kind: (typeof settingsItems)[number]['icon'] | 'theme' }) {
  switch (kind) {
    case 'account':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path
            d="M14.3 15.5a5.3 5.3 0 0 0-8.6 0M10 9.7a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </svg>
      )
    case 'pulse':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path
            d="M3.4 10h3.2l1.6-4.2 3.1 8.4 1.9-4.2h3.4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      )
    case 'heart':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path
            d="M10 15.8s-5.3-3.2-5.3-7.2A3 3 0 0 1 10 6a3 3 0 0 1 5.3 2.6c0 4-5.3 7.2-5.3 7.2Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </svg>
      )
    case 'share':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path
            d="M7.4 10.5 12.6 7.6m-5.2 4.8 5.2 2.9M15 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </svg>
      )
    case 'help':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path
            d="M10 14.8a.2.2 0 1 0 0 .4.2.2 0 0 0 0-.4Zm0-2.5v-.5a2.8 2.8 0 1 0-2.5-1.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </svg>
      )
    case 'theme':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path
            d="M10 4a6 6 0 1 0 6 6 5.2 5.2 0 0 1-6-6Zm0 4.5a1.3 1.3 0 1 0 1.3 1.3A1.3 1.3 0 0 0 10 8.5Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </svg>
      )
  }
}

const navItems = [
  { icon: DashboardIcon, label: 'Dashboard', to: '/home' },
  { icon: WorkoutsIcon, label: 'Workouts', to: '/workout' },
  { icon: HistoryIcon, label: 'History', to: '/history' },
  { icon: ProfileIcon, label: 'Profile', to: '/profile' },
] as const

export function ProfilePage() {
  const theme = useThemeStore((state) => state.theme)
  const cycleTheme = useThemeStore((state) => state.cycleTheme)

  return (
    <main className="profile-shell">
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

      <div className="profile-content">
        <header className="profile-hero">
          <div className="profile-avatar">
            <div aria-hidden="true" className="profile-avatar__placeholder">
              <AvatarIcon />
            </div>
            <button aria-label="Edit profile photo" className="profile-avatar__edit" type="button">
              <EditIcon />
            </button>
          </div>

          <h1>Alex Thompson</h1>
          <p className="profile-hero__email">alex@example.com</p>
          <p className="profile-hero__meta">Powerlifting · Intermediate</p>
        </header>

        <section className="profile-stats" aria-label="Profile stats">
          <article className="profile-stat-card">
            <p>Total Sessions</p>
            <strong>13</strong>
          </article>
          <article className="profile-stat-card">
            <p>PR Count</p>
            <strong>0</strong>
          </article>
        </section>

        <section className="profile-section">
          <h2>Settings &amp; Account</h2>
          <div className="profile-settings-card">
            {settingsItems.map((item) => (
              <button key={item.title} className="profile-setting-row" type="button">
                <span className="profile-setting-row__icon">
                  <SettingIcon kind={item.icon} />
                </span>
                <span className="profile-setting-row__copy">
                  <span className="profile-setting-row__title">
                    {item.title}
                    {item.badge ? <span className="profile-setting-row__badge">{item.badge}</span> : null}
                  </span>
                  <span className="profile-setting-row__description">{item.description}</span>
                </span>
                <span className="profile-setting-row__chevron" aria-hidden="true">
                  <ChevronRightIcon />
                </span>
              </button>
            ))}

            <div className="profile-setting-row">
              <span className="profile-setting-row__icon">
                <SettingIcon kind="theme" />
              </span>
              <span className="profile-setting-row__copy">
                <span className="profile-setting-row__title">App Theme</span>
                <span className="profile-setting-row__description">Blossom, Mint, Void, and more</span>
              </span>
              <ThemeSwitcher className="theme-switcher theme-switcher--small" onToggle={cycleTheme} theme={theme} />
            </div>
          </div>
        </section>

        <section className="profile-footer-actions">
          <button className="profile-logout-button" type="button">
            <svg aria-hidden="true" viewBox="0 0 16 16">
              <path
                d="M6.2 3.3H4.8a1.6 1.6 0 0 0-1.6 1.6v6.2a1.6 1.6 0 0 0 1.6 1.6h1.4M9.4 11.2l3.2-3.2-3.2-3.2M12.6 8H6.4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.4"
              />
            </svg>
            <span>Log Out</span>
          </button>

          <p>The Volumn · v1.5.0</p>
        </section>
      </div>

      <nav aria-label="Primary" className="home-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.label}
              className={({ isActive }) =>
                `home-bottom-nav__item${isActive ? ' home-bottom-nav__item--active' : ''}`
              }
              to={item.to}
            >
              <span className="home-bottom-nav__icon">
                <Icon />
              </span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </main>
  )
}
