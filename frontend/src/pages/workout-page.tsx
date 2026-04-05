import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ThemeSwitcher } from '../components/theme-switcher'
import { useThemeStore } from '../store/theme-store'

const workoutPlans = [
  {
    accent: 'orange',
    duration: '45 min',
    exerciseCount: 4,
    icon: 'Push',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    name: 'Push',
    sets: 14,
  },
  {
    accent: 'blue',
    duration: '53 min',
    exerciseCount: 4,
    icon: 'Pull',
    muscleGroups: ['Back', 'Biceps'],
    name: 'Pull',
    sets: 13,
  },
  {
    accent: 'violet',
    duration: '50 min',
    exerciseCount: 6,
    icon: 'Upper',
    muscleGroups: ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'],
    name: 'Upper',
    sets: 19,
  },
  {
    accent: 'green',
    duration: '60 min',
    exerciseCount: 5,
    icon: 'Lower',
    muscleGroups: ['Glutes', 'Hamstrings', 'Calves'],
    name: 'Lower',
    sets: 16,
  },
] as const

const pushWorkout = {
  exerciseCount: 4,
  exercises: [
    {
      area: 'Chest',
      name: 'Barbell Bench Press',
      sets: ['W · 60kg × 12', '2 · 100kg × 8', '3 · 100kg × 8', 'F · 100kg × 6'],
      setsLabel: '4 sets',
    },
    {
      area: 'Chest',
      name: 'Incline Dumbbell Press',
      sets: ['Fd · 24kg × 15', '2 · 32kg × 10', '3 · 32kg × 10', 'D · 24kg × 15'],
      setsLabel: '4 sets',
    },
    {
      area: 'Shoulders',
      name: 'Overhead Press',
      sets: ['W · 30kg × 12', '2 · 50kg × 8', '3 · 50kg × 8'],
      setsLabel: '3 sets',
    },
    {
      area: 'Triceps',
      name: 'Tricep Pushdown',
      sets: ['1 · 40kg × 12', '2 · 40kg × 12', '3 · 40kg × 10'],
      setsLabel: '3 sets',
    },
  ],
  muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
  name: 'Push',
  totalSets: 14,
  workSets: 11,
} as const

function WorkoutBrandIcon() {
  return (
    <svg aria-hidden="true" className="home-brand__mark" viewBox="0 0 28 28">
      <defs>
        <linearGradient id="workout-brand-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#C026D3" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="14" fill="url(#workout-brand-gradient)" />
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

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M8 3.2v9.6M3.2 8h9.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
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

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path
        d="M8 3.1a4.9 4.9 0 1 0 4.9 4.9A4.9 4.9 0 0 0 8 3.1Zm0 2.3V8l1.8 1.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path
        d="M11.8 4.8 6.5 10l5.3 5.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function MenuDotsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <circle cx="10" cy="5.2" r="1.5" fill="currentColor" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      <circle cx="10" cy="14.8" r="1.5" fill="currentColor" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m7.3 5.9 7.2 4.1-7.2 4.1V5.9Z" fill="currentColor" />
    </svg>
  )
}

function SessionIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path
        d="M13 2.7 7.7 10h3.2l-.8 7.3 5.3-7.3h-3.2l.8-7.3Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function PlanGlyph({ name }: { name: string }) {
  if (name === 'Push') {
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16">
        <path
          d="M3.4 9.3 6.8 6m0 0 2.4 2.4M6.8 6l-.7 6.3m3.1-3.9 3.4-3.4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </svg>
    )
  }

  if (name === 'Pull') {
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16">
        <path
          d="M4 5.2h8m-8 5.6h8m1-6.8v8m-10-8v8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </svg>
    )
  }

  if (name === 'Upper') {
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16">
        <path
          d="M4.2 11.6V8.8A3.8 3.8 0 0 1 8 5a3.8 3.8 0 0 1 3.8 3.8v2.8M5.4 4.7A2.6 2.6 0 0 1 8 2.4a2.6 2.6 0 0 1 2.6 2.3"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path
        d="M5.1 4.3h5.8M4.4 7.2h7.2m-6.1 2.9h5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
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

const navItems = [
  { icon: DashboardIcon, label: 'Dashboard', to: '/home' },
  { icon: WorkoutsIcon, label: 'Workouts', to: '/workout' },
  { icon: HistoryIcon, label: 'History', to: '/history' },
  { icon: ProfileIcon, label: 'Profile', to: '/profile' },
] as const

function WorkoutBottomNav() {
  return (
    <nav aria-label="Primary" className="home-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            key={item.label}
            className={({ isActive }) => `home-bottom-nav__item${isActive ? ' home-bottom-nav__item--active' : ''}`}
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
  )
}

function WorkoutListView({ onOpenPush }: { onOpenPush: () => void }) {
  return (
    <>
      <div className="home-topbar">
        <div className="home-brand">
          <WorkoutBrandIcon />
          <span>The Volumn</span>
        </div>

        <div className="home-topbar__actions">
          <WorkoutThemeControls />
        </div>
      </div>

      <div className="workout-content">
        <header className="workout-header">
          <div>
            <h1>Workouts</h1>
            <p>Choose a plan to start training</p>
          </div>

          <button className="workout-new-button" type="button">
            <PlusIcon />
            <span>New</span>
          </button>
        </header>

        <section className="workout-plan-list" aria-label="Workout plans">
          {workoutPlans.map((plan) => {
            const content = (
              <>
                <div className={`workout-plan-card__bar workout-plan-card__bar--${plan.accent}`} />
                <div className="workout-plan-card__body">
                  <div className="workout-plan-card__header">
                    <div className="workout-plan-card__title">
                      <span className={`workout-plan-card__icon workout-plan-card__icon--${plan.accent}`}>
                        <PlanGlyph name={plan.icon} />
                      </span>
                      <h2>{plan.name}</h2>
                    </div>

                    <div className="workout-plan-card__meta">
                      <span className={`workout-plan-card__duration workout-plan-card__duration--${plan.accent}`}>
                        <ClockIcon />
                        <span>{plan.duration}</span>
                      </span>
                      <ChevronRightIcon />
                    </div>
                  </div>

                  <div className="workout-plan-card__tags">
                    {plan.muscleGroups.map((group) => (
                      <span key={group} className={`workout-plan-card__tag workout-plan-card__tag--${plan.accent}`}>
                        {group}
                      </span>
                    ))}
                  </div>

                  <div className="workout-plan-card__footer">
                    <span>
                      {plan.exerciseCount} exercises · {plan.sets} sets
                    </span>
                    <span className="workout-plan-card__saved">Saved ✓</span>
                  </div>
                </div>
              </>
            )

            if (plan.name === 'Push') {
              return (
                <button
                  key={plan.name}
                  aria-label="Open Push workout"
                  className={`workout-plan-card workout-plan-card--interactive workout-plan-card--${plan.accent}`}
                  onClick={onOpenPush}
                  type="button"
                >
                  {content}
                </button>
              )
            }

            return (
              <article key={plan.name} className={`workout-plan-card workout-plan-card--${plan.accent}`}>
                {content}
              </article>
            )
          })}
        </section>

        <button className="workout-add-button" type="button">
          <PlusIcon />
          <span>Add new workout</span>
        </button>
      </div>
    </>
  )
}

function WorkoutThemeControls() {
  const theme = useThemeStore((state) => state.theme)
  const cycleTheme = useThemeStore((state) => state.cycleTheme)

  return (
    <>
      <ThemeSwitcher className="theme-switcher theme-switcher--inline" onToggle={cycleTheme} theme={theme} />
      <button aria-label="Quick actions" className="home-icon-button" type="button">
        <QuickActionsIcon />
      </button>
    </>
  )
}

function PushWorkoutDetail({ onBack }: { onBack: () => void }) {
  return (
    <>
      <div className="workout-detail-topbar">
        <div className="home-brand">
          <WorkoutBrandIcon />
          <span>The Volumn</span>
        </div>

        <div className="workout-detail-topbar__actions">
          <WorkoutThemeControls />
        </div>
      </div>

      <section className="workout-detail-hero">
        <div className="workout-detail-hero__overlay" />

        <div className="workout-detail-hero__controls">
          <button
            aria-label="Back to workout plans"
            className="workout-detail-hero__icon-button workout-detail-hero__icon-button--dark"
            onClick={onBack}
            type="button"
          >
            <BackIcon />
          </button>

          <button aria-label="Workout options" className="workout-detail-hero__icon-button workout-detail-hero__icon-button--dark" type="button">
            <MenuDotsIcon />
          </button>
        </div>

        <div className="workout-detail-hero__content">
          <div className="workout-detail-hero__tags">
            {pushWorkout.muscleGroups.map((group) => (
              <span key={group} className="workout-detail-hero__tag">
                {group}
              </span>
            ))}
          </div>

          <h1>{pushWorkout.name}</h1>
        </div>
      </section>

      <div className="workout-detail-content">
        <section aria-label="Workout summary" className="workout-detail-stats">
          <article className="workout-detail-stat-card">
            <span className="workout-detail-stat-card__icon">
              <SessionIcon />
            </span>
            <strong>{pushWorkout.exerciseCount}</strong>
            <span>Exercises</span>
          </article>

          <article className="workout-detail-stat-card">
            <span className="workout-detail-stat-card__icon">
              <QuickActionsIcon />
            </span>
            <strong>{pushWorkout.totalSets}</strong>
            <span>Total Sets</span>
          </article>

          <article className="workout-detail-stat-card">
            <span className="workout-detail-stat-card__icon">
              <ClockIcon />
            </span>
            <strong>45 min</strong>
            <span>Duration</span>
          </article>
        </section>

        <button className="workout-detail-start-button workout-detail-start-button--primary" type="button">
          <PlayIcon />
          <span>Start Workout</span>
        </button>

        <section className="workout-detail-exercises" aria-label="Push workout exercises">
          <header className="workout-detail-exercises__header">
            <h2>Exercises</h2>
            <p>{pushWorkout.workSets} work sets</p>
          </header>

          <div className="workout-detail-exercises__list">
            {pushWorkout.exercises.map((exercise, index) => (
              <article key={exercise.name} className="workout-detail-exercise-card">
                <div className="workout-detail-exercise-card__index">{index + 1}</div>

                <div className="workout-detail-exercise-card__content">
                  <div className="workout-detail-exercise-card__header">
                    <div>
                      <h3>{exercise.name}</h3>
                      <p>{exercise.area}</p>
                    </div>
                    <span>{exercise.setsLabel}</span>
                  </div>

                  <div className="workout-detail-set-tags">
                    {exercise.sets.map((setLabel) => (
                      <span
                        key={setLabel}
                        className={`workout-detail-set-tag ${getSetTagClassName(setLabel)}`}
                      >
                        {setLabel}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <button className="workout-detail-start-button" type="button">
          <PlayIcon />
          <span>Start Workout</span>
        </button>
      </div>
    </>
  )
}

function getSetTagClassName(setLabel: string) {
  if (setLabel.startsWith('W ·')) {
    return 'workout-detail-set-tag--warmup'
  }

  if (setLabel.startsWith('F ·')) {
    return 'workout-detail-set-tag--failure'
  }

  if (setLabel.startsWith('Fd ·')) {
    return 'workout-detail-set-tag--feeder'
  }

  if (setLabel.startsWith('D ·')) {
    return 'workout-detail-set-tag--drop'
  }

  return 'workout-detail-set-tag--normal'
}

export function WorkoutPage() {
  const [selectedWorkout, setSelectedWorkout] = useState<'push' | null>(null)

  return (
    <main className={`workout-shell${selectedWorkout === 'push' ? ' workout-shell--detail' : ''}`}>
      {selectedWorkout === 'push' ? (
        <PushWorkoutDetail onBack={() => setSelectedWorkout(null)} />
      ) : (
        <WorkoutListView onOpenPush={() => setSelectedWorkout('push')} />
      )}

      <WorkoutBottomNav />
    </main>
  )
}
