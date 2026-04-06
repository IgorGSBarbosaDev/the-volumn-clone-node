import { Link, useParams } from 'react-router-dom'
import { AppFrame } from '../components/app-frame'
import { useSession } from '../features/sessions/use-session'

export function SessionDetailPage() {
  const { sessionId } = useParams()
  const sessionQuery = useSession(sessionId)

  return (
    <AppFrame subtitle="Review a logged workout" title="Session Detail">
      {sessionQuery.data ? (
        <>
          <section>
            <h2>{sessionQuery.data.workoutPlanName}</h2>
            <p>Status: {sessionQuery.data.status}</p>
            <p>Total sets: {sessionQuery.data.totalSets}</p>
            <p>Total volume: {sessionQuery.data.totalVolumeKg} kg</p>
          </section>

          <section>
            <h2>Performed Sets</h2>
            <ul>
              {sessionQuery.data.sets.map((set) => (
                <li key={set.id}>
                  <strong>{set.exerciseName}</strong> - {set.weightKg} kg x {set.reps} ({set.setType})
                  {set.isPR ? ' PR' : ''}
                  <div>
                    <Link to={`/history/exercises/${set.exerciseId}`}>Exercise history</Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <p>Loading session...</p>
      )}
    </AppFrame>
  )
}
