import { Link } from 'react-router-dom'
import { AppFrame } from '../components/app-frame'
import { useSessions } from '../features/sessions/use-sessions'

export function HistoryPage() {
  const sessionsQuery = useSessions()

  return (
    <AppFrame subtitle="Review completed and active sessions" title="History">
      <section>
        <h2>Workout History</h2>
        {sessionsQuery.data?.items.length ? (
          <ul>
            {sessionsQuery.data.items.map((session) => (
              <li key={session.id}>
                <Link to={`/sessions/${session.id}`}>{session.workoutPlanName}</Link>
                <p>
                  Status: {session.status} | Sets: {session.totalSets} | Volume: {session.totalVolumeKg} kg
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No session history yet.</p>
        )}
      </section>
    </AppFrame>
  )
}
