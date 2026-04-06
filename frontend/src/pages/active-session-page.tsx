import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppFrame } from '../components/app-frame'
import { useActiveSession } from '../features/sessions/use-active-session'
import { useCompleteSession, useCreateSessionSet } from '../features/sessions/use-session-mutations'
import { useWorkoutPlan } from '../features/workout-plans/use-workout-plan'
import { getErrorMessage } from '../services/http-error'

export function ActiveSessionPage() {
  const navigate = useNavigate()
  const activeSessionQuery = useActiveSession()
  const session = activeSessionQuery.data
  const planQuery = useWorkoutPlan(session?.workoutPlanId)
  const [exerciseId, setExerciseId] = useState('')
  const [setType, setSetType] = useState<'WARM_UP' | 'FEEDER' | 'NORMAL' | 'FAILURE' | 'DROP_SET'>('NORMAL')
  const [weightKg, setWeightKg] = useState('0')
  const [reps, setReps] = useState('0')
  const [notes, setNotes] = useState('')
  const createSetMutation = useCreateSessionSet(session?.id ?? '')
  const completeSessionMutation = useCompleteSession(session?.id ?? '')
  const availableExercises = useMemo(() => planQuery.data?.exercises ?? [], [planQuery.data])

  return (
    <AppFrame subtitle="Log performed sets quickly" title="Active Session">
      {!session ? (
        <p>No active session found.</p>
      ) : (
        <>
          <section>
            <h2>{session.workoutPlanName}</h2>
            <p>{session.totalSets} sets logged so far.</p>
          </section>

          <section>
            <h2>Log a Set</h2>
            <form
              onSubmit={async (event) => {
                event.preventDefault()
                await createSetMutation.mutateAsync({
                  exerciseId,
                  setType,
                  weightKg: Number(weightKg),
                  reps: Number(reps),
                  notes: notes || null,
                })
                setNotes('')
              }}
            >
              <label>
                Exercise
                <select value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>
                  <option value="">Select exercise</option>
                  {availableExercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.exerciseId}>
                      {exercise.exerciseName}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Set type
                <select value={setType} onChange={(event) => setSetType(event.target.value as typeof setType)}>
                  <option value="WARM_UP">WARM_UP</option>
                  <option value="FEEDER">FEEDER</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="FAILURE">FAILURE</option>
                  <option value="DROP_SET">DROP_SET</option>
                </select>
              </label>

              <label>
                Weight (kg)
                <input value={weightKg} onChange={(event) => setWeightKg(event.target.value)} />
              </label>

              <label>
                Reps
                <input value={reps} onChange={(event) => setReps(event.target.value)} />
              </label>

              <label>
                Notes
                <input value={notes} onChange={(event) => setNotes(event.target.value)} />
              </label>

              <button disabled={createSetMutation.isPending || !exerciseId} type="submit">
                {createSetMutation.isPending ? 'Logging...' : 'Log set'}
              </button>
            </form>

            {createSetMutation.isError ? <p>{getErrorMessage(createSetMutation.error)}</p> : null}
          </section>

          <section>
            <h2>Performed Sets</h2>
            <ul>
              {session.sets.map((set) => (
                <li key={set.id}>
                  {set.exerciseName}: {set.weightKg} kg x {set.reps} ({set.setType}){set.isPR ? ' PR' : ''}
                </li>
              ))}
            </ul>
          </section>

          <button
            disabled={completeSessionMutation.isPending}
            type="button"
            onClick={async () => {
              const completedSession = await completeSessionMutation.mutateAsync({})
              navigate(`/sessions/${completedSession.id}`)
            }}
          >
            {completeSessionMutation.isPending ? 'Completing...' : 'Complete session'}
          </button>
        </>
      )}
    </AppFrame>
  )
}
