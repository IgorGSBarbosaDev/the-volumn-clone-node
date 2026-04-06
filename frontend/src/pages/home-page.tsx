import { Link } from 'react-router-dom'
import { AppFrame } from '../components/app-frame'
import { useAuth } from '../features/auth/use-auth'
import { useActiveSession } from '../features/sessions/use-active-session'
import { useSessions } from '../features/sessions/use-sessions'
import { useCurrentUserStats } from '../features/users/use-current-user-stats'
import { useWorkoutPlans } from '../features/workout-plans/use-workout-plans'

export function HomePage() {
  const { currentUser } = useAuth()
  const statsQuery = useCurrentUserStats()
  const plansQuery = useWorkoutPlans(1, 3)
  const sessionsQuery = useSessions(1, 5)
  const activeSessionQuery = useActiveSession()

  return (
    <AppFrame subtitle={currentUser?.email} title="Dashboard">
      {activeSessionQuery.data ? (
        <article>
          <h2>Active session</h2>
          <p>
            {activeSessionQuery.data.workoutPlanName} is in progress with {activeSessionQuery.data.totalSets} logged
            sets.
          </p>
          <Link to="/sessions/active">Resume session</Link>
        </article>
      ) : null}

      <section>
        <h2>This Week</h2>
        <p>Total sessions: {statsQuery.data?.totalSessions ?? 0}</p>
        <p>PR count: {statsQuery.data?.prCount ?? 0}</p>
      </section>

      <section>
        <h2>Recommended Plans</h2>
        {plansQuery.data?.items.length ? (
          <ul>
            {plansQuery.data.items.map((plan) => (
              <li key={plan.id}>
                <strong>{plan.name}</strong> with {plan.exerciseCount} exercises and {plan.totalPlannedSets} planned
                sets. <Link to={`/workout/${plan.id}/edit`}>Edit</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No workout plans yet. Head to Workouts to create your first plan.</p>
        )}
      </section>

      <section>
        <h2>Recent Sessions</h2>
        {sessionsQuery.data?.items.length ? (
          <ul>
            {sessionsQuery.data.items.map((session) => (
              <li key={session.id}>
                <Link to={`/sessions/${session.id}`}>{session.workoutPlanName}</Link> with {session.totalSets} sets and{' '}
                {session.totalVolumeKg} kg total volume
              </li>
            ))}
          </ul>
        ) : (
          <p>No sessions logged yet.</p>
        )}
      </section>
    </AppFrame>
  )
}
