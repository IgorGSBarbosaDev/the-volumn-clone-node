import { useState } from 'react'
import type { PlanSet, WorkoutPlanDetail, WorkoutPlanSummary } from '@the-volumn/shared'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { TextField } from '../components/text-field'
import { ThemeSwitcher } from '../components/theme-switcher'
import { useActiveSession } from '../features/sessions/use-active-session'
import { useStartSession } from '../features/sessions/use-session-mutations'
import { useCreateWorkoutPlan, useDeleteWorkoutPlan } from '../features/workout-plans/use-workout-plan-mutations'
import { useWorkoutPlan } from '../features/workout-plans/use-workout-plan'
import { useWorkoutPlans } from '../features/workout-plans/use-workout-plans'
import { getErrorMessage } from '../services/http-error'
import { useThemeStore } from '../store/theme-store'

type WorkoutAccent = 'orange' | 'blue' | 'violet' | 'green'

const navItems = [
  { label: 'Dashboard', to: '/home' },
  { label: 'Workouts', to: '/workout' },
  { label: 'History', to: '/history' },
  { label: 'Profile', to: '/profile' },
] as const

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

function PlanGlyph({ accent }: { accent: WorkoutAccent }) {
  switch (accent) {
    case 'orange':
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
    case 'blue':
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
    case 'violet':
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
    case 'green':
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

function getWorkoutAccent(accent: WorkoutPlanSummary['accent'], index: number): WorkoutAccent {
  switch (accent) {
    case 'amber':
      return 'orange'
    case 'blue':
      return 'blue'
    case 'green':
      return 'green'
    case 'rose':
    case 'violet':
      return 'violet'
    default:
      return ['orange', 'blue', 'violet', 'green'][index % 4] as WorkoutAccent
  }
}

function formatPlanMeta(plan: WorkoutPlanSummary) {
  return plan.focusLabel ?? `${plan.totalPlannedSets} sets`
}

function getSetTagClassName(setType: PlanSet['setType']) {
  switch (setType) {
    case 'WARM_UP':
      return 'workout-detail-set-tag--warmup'
    case 'FEEDER':
      return 'workout-detail-set-tag--feeder'
    case 'FAILURE':
      return 'workout-detail-set-tag--failure'
    case 'DROP_SET':
      return 'workout-detail-set-tag--drop'
    default:
      return 'workout-detail-set-tag--normal'
  }
}

function formatSetLabel(set: PlanSet) {
  const prefix =
    set.setType === 'WARM_UP'
      ? 'W'
      : set.setType === 'FEEDER'
        ? 'Fd'
        : set.setType === 'FAILURE'
          ? 'F'
          : set.setType === 'DROP_SET'
            ? 'D'
            : `${set.order + 1}`
  const load = typeof set.targetLoadKg === 'number' ? `${set.targetLoadKg}kg` : null
  const reps = typeof set.targetReps === 'number' ? `${set.targetReps}` : null

  if (load && reps) {
    return `${prefix} · ${load} × ${reps}`
  }

  if (load) {
    return `${prefix} · ${load}`
  }

  if (reps) {
    return `${prefix} · ${reps} reps`
  }

  return prefix
}

function getWorkSetCount(plan: WorkoutPlanDetail) {
  return plan.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.setType !== 'WARM_UP' && set.setType !== 'FEEDER').length,
    0,
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

type WorkoutListViewProps = {
  activeSessionName?: string
  createErrorMessage: string | null
  isCreateFormVisible: boolean
  isCreatePending: boolean
  planName: string
  plans: WorkoutPlanSummary[]
  onChangePlanName: (value: string) => void
  onCreatePlan: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  onOpenPlan: (planId: string) => void
  onToggleCreateForm: () => void
}

function WorkoutListView({
  activeSessionName,
  createErrorMessage,
  isCreateFormVisible,
  isCreatePending,
  planName,
  plans,
  onChangePlanName,
  onCreatePlan,
  onOpenPlan,
  onToggleCreateForm,
}: WorkoutListViewProps) {
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

          <button className="workout-new-button" type="button" onClick={onToggleCreateForm}>
            <PlusIcon />
            <span>New</span>
          </button>
        </header>

        {activeSessionName ? (
          <Link className="home-session-card" to="/sessions/active">
            <div>
              <strong>{activeSessionName}</strong>
              <p>
                <span>Session in progress</span>
                <span aria-hidden="true">·</span>
                <span>Resume active workout</span>
              </p>
            </div>
            <span className="home-session-card__chevron" aria-hidden="true">
              <ChevronRightIcon />
            </span>
          </Link>
        ) : null}

        {isCreateFormVisible ? (
          <form className="workout-plan-card workout-plan-card--interactive workout-plan-card--violet" onSubmit={onCreatePlan}>
            <div className="workout-plan-card__bar workout-plan-card__bar--violet" />
            <div className="workout-plan-card__body">
              <div className="workout-plan-card__header">
                <div className="workout-plan-card__title">
                  <span className="workout-plan-card__icon workout-plan-card__icon--violet">
                    <PlusIcon />
                  </span>
                  <h2>New workout</h2>
                </div>

                <div className="workout-plan-card__meta">
                  <span className="workout-plan-card__duration workout-plan-card__duration--violet">
                    <ClockIcon />
                    <span>Draft</span>
                  </span>
                </div>
              </div>

              <div className="login-form">
                <TextField
                  autoFocus
                  label="Workout name"
                  placeholder="Push day"
                  value={planName}
                  onChange={(event) => onChangePlanName(event.target.value)}
                />

                {createErrorMessage ? <p>{createErrorMessage}</p> : null}

                <button className="primary-action" disabled={isCreatePending || !planName.trim()} type="submit">
                  {isCreatePending ? 'Creating...' : 'Create Workout'}
                </button>
              </div>
            </div>
          </form>
        ) : null}

        <section className="workout-plan-list" aria-label="Workout plans">
          {plans.length ? (
            plans.map((plan, index) => {
              const accent = getWorkoutAccent(plan.accent, index)

              return (
                <button
                  key={plan.id}
                  aria-label={`Open ${plan.name} workout`}
                  className={`workout-plan-card workout-plan-card--interactive workout-plan-card--${accent}`}
                  type="button"
                  onClick={() => onOpenPlan(plan.id)}
                >
                  <div className={`workout-plan-card__bar workout-plan-card__bar--${accent}`} />
                  <div className="workout-plan-card__body">
                    <div className="workout-plan-card__header">
                      <div className="workout-plan-card__title">
                        <span className={`workout-plan-card__icon workout-plan-card__icon--${accent}`}>
                          <PlanGlyph accent={accent} />
                        </span>
                        <h2>{plan.name}</h2>
                      </div>

                      <div className="workout-plan-card__meta">
                        <span className={`workout-plan-card__duration workout-plan-card__duration--${accent}`}>
                          <ClockIcon />
                          <span>{formatPlanMeta(plan)}</span>
                        </span>
                        <ChevronRightIcon />
                      </div>
                    </div>

                    <div className="workout-plan-card__tags">
                      {(plan.muscleGroups.length ? plan.muscleGroups : ['NO MUSCLE GROUPS']).map((group) => (
                        <span key={group} className={`workout-plan-card__tag workout-plan-card__tag--${accent}`}>
                          {group}
                        </span>
                      ))}
                    </div>

                    <div className="workout-plan-card__footer">
                      <span>
                        {plan.exerciseCount} exercises · {plan.totalPlannedSets} sets
                      </span>
                      <span className="workout-plan-card__saved">Saved ✓</span>
                    </div>
                  </div>
                </button>
              )
            })
          ) : (
            <article className="workout-plan-card workout-plan-card--violet">
              <div className="workout-plan-card__bar workout-plan-card__bar--violet" />
              <div className="workout-plan-card__body">
                <div className="workout-plan-card__header">
                  <div className="workout-plan-card__title">
                    <span className="workout-plan-card__icon workout-plan-card__icon--violet">
                      <PlusIcon />
                    </span>
                    <h2>No workouts yet</h2>
                  </div>
                </div>

                <div className="workout-plan-card__footer">
                  <span>Create your first plan to start training</span>
                </div>
              </div>
            </article>
          )}
        </section>

        <button className="workout-add-button" type="button" onClick={onToggleCreateForm}>
          <PlusIcon />
          <span>Add new workout</span>
        </button>
      </div>
    </>
  )
}

type WorkoutDetailViewProps = {
  deleteErrorMessage: string | null
  detail: WorkoutPlanDetail | undefined
  detailErrorMessage: string | null
  isDeleting: boolean
  isStarting: boolean
  isLoading: boolean
  startErrorMessage: string | null
  onBack: () => void
  onDelete: () => Promise<void>
  onStartWorkout: () => Promise<void>
}

function WorkoutDetailView({
  deleteErrorMessage,
  detail,
  detailErrorMessage,
  isDeleting,
  isLoading,
  isStarting,
  startErrorMessage,
  onBack,
  onDelete,
  onStartWorkout,
}: WorkoutDetailViewProps) {
  const workSetCount = detail ? getWorkSetCount(detail) : 0

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
            type="button"
            onClick={onBack}
          >
            <BackIcon />
          </button>

          <button aria-label="Workout options" className="workout-detail-hero__icon-button workout-detail-hero__icon-button--dark" type="button">
            <MenuDotsIcon />
          </button>
        </div>

        <div className="workout-detail-hero__content">
          <div className="workout-detail-hero__tags">
            {(detail?.muscleGroups.length ? detail.muscleGroups : ['PLAN']).map((group) => (
              <span key={group} className="workout-detail-hero__tag">
                {group}
              </span>
            ))}
          </div>

          <h1>{detail?.name ?? 'Loading workout'}</h1>
        </div>
      </section>

      <div className="workout-detail-content">
        <section aria-label="Workout summary" className="workout-detail-stats">
          <article className="workout-detail-stat-card">
            <span className="workout-detail-stat-card__icon">
              <SessionIcon />
            </span>
            <strong>{detail?.exerciseCount ?? 0}</strong>
            <span>Exercises</span>
          </article>

          <article className="workout-detail-stat-card">
            <span className="workout-detail-stat-card__icon">
              <QuickActionsIcon />
            </span>
            <strong>{detail?.totalPlannedSets ?? 0}</strong>
            <span>Total Sets</span>
          </article>

          <article className="workout-detail-stat-card">
            <span className="workout-detail-stat-card__icon">
              <ClockIcon />
            </span>
            <strong>{detail?.focusLabel ?? `${detail?.muscleGroups.length ?? 0}`}</strong>
            <span>{detail?.focusLabel ? 'Focus' : 'Muscle Groups'}</span>
          </article>
        </section>

        <button
          className="workout-detail-start-button workout-detail-start-button--primary"
          disabled={isStarting || isLoading || !detail}
          type="button"
          onClick={() => {
            void onStartWorkout()
          }}
        >
          <PlayIcon />
          <span>{isStarting ? 'Starting...' : 'Start Workout'}</span>
        </button>

        {startErrorMessage ? <p>{startErrorMessage}</p> : null}
        {detailErrorMessage ? <p>{detailErrorMessage}</p> : null}

        <section className="workout-detail-exercises" aria-label={`${detail?.name ?? 'Workout'} exercises`}>
          <header className="workout-detail-exercises__header">
            <h2>Exercises</h2>
            <p>{workSetCount} work sets</p>
          </header>

          <div className="workout-detail-exercises__list">
            {isLoading ? (
              <article className="workout-detail-exercise-card">
                <div className="workout-detail-exercise-card__index">...</div>
                <div className="workout-detail-exercise-card__content">
                  <div className="workout-detail-exercise-card__header">
                    <div>
                      <h3>Loading workout</h3>
                      <p>Fetching plan detail</p>
                    </div>
                  </div>
                </div>
              </article>
            ) : detail?.exercises.length ? (
              detail.exercises.map((exercise, index) => (
                <article key={exercise.id} className="workout-detail-exercise-card">
                  <div className="workout-detail-exercise-card__index">{index + 1}</div>

                  <div className="workout-detail-exercise-card__content">
                    <div className="workout-detail-exercise-card__header">
                      <div>
                        <h3>{exercise.exerciseName}</h3>
                        <p>{exercise.muscleGroup}</p>
                      </div>
                      <span>{exercise.sets.length} sets</span>
                    </div>

                    <div className="workout-detail-set-tags">
                      {exercise.sets.map((set) => (
                        <span key={set.id} className={`workout-detail-set-tag ${getSetTagClassName(set.setType)}`}>
                          {formatSetLabel(set)}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <article className="workout-detail-exercise-card">
                <div className="workout-detail-exercise-card__index">!</div>

                <div className="workout-detail-exercise-card__content">
                  <div className="workout-detail-exercise-card__header">
                    <div>
                      <h3>No exercises configured yet</h3>
                      <p>Open the editor to add exercises and planned sets.</p>
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>
        </section>

        <Link className="workout-detail-start-button" to={detail ? `/workout/${detail.id}/edit` : '/workout'}>
          <PlayIcon />
          <span>Open Editor</span>
        </Link>

        <button
          className="workout-detail-start-button"
          disabled={isDeleting || !detail}
          type="button"
          onClick={() => {
            void onDelete()
          }}
        >
          <PlayIcon />
          <span>{isDeleting ? 'Deleting...' : 'Delete Workout'}</span>
        </button>

        {deleteErrorMessage ? <p>{deleteErrorMessage}</p> : null}
      </div>
    </>
  )
}

export function WorkoutPage() {
  const navigate = useNavigate()
  const plansQuery = useWorkoutPlans()
  const activeSessionQuery = useActiveSession()
  const createPlanMutation = useCreateWorkoutPlan()
  const deletePlanMutation = useDeleteWorkoutPlan()
  const startSessionMutation = useStartSession()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [planName, setPlanName] = useState('')
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false)
  const detailQuery = useWorkoutPlan(selectedPlanId ?? undefined)

  async function handleCreatePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const plan = await createPlanMutation.mutateAsync({ name: planName })
    setPlanName('')
    setIsCreateFormVisible(false)
    setSelectedPlanId(plan.id)
  }

  async function handleStartWorkout() {
    if (!detailQuery.data) {
      return
    }

    const session = await startSessionMutation.mutateAsync({ workoutPlanId: detailQuery.data.id })
    navigate(`/sessions/${session.id}`)
  }

  async function handleDeleteWorkout() {
    if (!detailQuery.data) {
      return
    }

    await deletePlanMutation.mutateAsync(detailQuery.data.id)
    setSelectedPlanId(null)
  }

  return (
    <main className={`workout-shell${selectedPlanId ? ' workout-shell--detail' : ''}`}>
      {selectedPlanId ? (
        <WorkoutDetailView
          deleteErrorMessage={deletePlanMutation.isError ? getErrorMessage(deletePlanMutation.error) : null}
          detail={detailQuery.data}
          detailErrorMessage={detailQuery.isError ? getErrorMessage(detailQuery.error) : null}
          isDeleting={deletePlanMutation.isPending}
          isLoading={detailQuery.isLoading}
          isStarting={startSessionMutation.isPending}
          startErrorMessage={startSessionMutation.isError ? getErrorMessage(startSessionMutation.error) : null}
          onBack={() => setSelectedPlanId(null)}
          onDelete={handleDeleteWorkout}
          onStartWorkout={handleStartWorkout}
        />
      ) : (
        <WorkoutListView
          activeSessionName={activeSessionQuery.data?.workoutPlanName}
          createErrorMessage={createPlanMutation.isError ? getErrorMessage(createPlanMutation.error) : null}
          isCreateFormVisible={isCreateFormVisible}
          isCreatePending={createPlanMutation.isPending}
          planName={planName}
          plans={plansQuery.data?.items ?? []}
          onChangePlanName={setPlanName}
          onCreatePlan={handleCreatePlan}
          onOpenPlan={setSelectedPlanId}
          onToggleCreateForm={() => setIsCreateFormVisible((current) => !current)}
        />
      )}

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
