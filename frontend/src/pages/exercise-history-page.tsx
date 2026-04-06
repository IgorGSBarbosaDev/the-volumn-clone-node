import { useParams } from 'react-router-dom'
import { AppFrame } from '../components/app-frame'
import { useExerciseHistory } from '../features/history/use-exercise-history'

export function ExerciseHistoryPage() {
  const { exerciseId } = useParams()
  const historyQuery = useExerciseHistory(exerciseId)

  return (
    <AppFrame subtitle="Review exercise progression" title="Exercise History">
      {historyQuery.data ? (
        <>
          <section>
            <h2>{historyQuery.data.exercise.name}</h2>
            <p>Muscle group: {historyQuery.data.exercise.muscleGroup}</p>
          </section>

          <section>
            <ul>
              {historyQuery.data.items.map((entry) => (
                <li key={entry.setId}>
                  {entry.sessionCompletedAt}: {entry.weightKg} kg x {entry.reps} ({entry.setType}) volume {entry.volume}
                  {entry.isPR ? ' PR' : ''}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <p>Loading history...</p>
      )}
    </AppFrame>
  )
}
