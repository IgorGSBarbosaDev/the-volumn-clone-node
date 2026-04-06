import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppFrame } from '../components/app-frame'
import { useActiveSession } from '../features/sessions/use-active-session'
import { useStartSession } from '../features/sessions/use-session-mutations'
import { useCreateWorkoutPlan, useDeleteWorkoutPlan } from '../features/workout-plans/use-workout-plan-mutations'
import { useWorkoutPlans } from '../features/workout-plans/use-workout-plans'
import { getErrorMessage } from '../services/http-error'

export function WorkoutPage() {
  const navigate = useNavigate()
  const plansQuery = useWorkoutPlans()
  const activeSessionQuery = useActiveSession()
  const createPlanMutation = useCreateWorkoutPlan()
  const deletePlanMutation = useDeleteWorkoutPlan()
  const startSessionMutation = useStartSession()
  const [planName, setPlanName] = useState('')

  async function handleCreatePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const plan = await createPlanMutation.mutateAsync({ name: planName })
    setPlanName('')
    navigate(`/workout/${plan.id}/edit`)
  }

  return (
    <AppFrame
      actions={<Link to="/profile/edit">Edit profile</Link>}
      subtitle="Manage plans and start sessions"
      title="Workouts"
    >
      {activeSessionQuery.data ? (
        <article>
          <h2>Active session</h2>
          <p>{activeSessionQuery.data.workoutPlanName} is currently active.</p>
          <Link to="/sessions/active">Open active logger</Link>
        </article>
      ) : null}

      <section>
        <h2>Create a Workout Plan</h2>
        <form onSubmit={handleCreatePlan}>
          <label>
            Plan name
            <input value={planName} onChange={(event) => setPlanName(event.target.value)} />
          </label>
          <button disabled={createPlanMutation.isPending || !planName.trim()} type="submit">
            {createPlanMutation.isPending ? 'Creating...' : 'Create plan'}
          </button>
        </form>
        {createPlanMutation.isError ? <p>{getErrorMessage(createPlanMutation.error)}</p> : null}
      </section>

      <section>
        <h2>Your Plans</h2>
        {plansQuery.data?.items.length ? (
          <ul>
            {plansQuery.data.items.map((plan) => (
              <li key={plan.id}>
                <strong>{plan.name}</strong> with {plan.exerciseCount} exercises and {plan.totalPlannedSets} planned
                sets.
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to={`/workout/${plan.id}/edit`}>Open editor</Link>
                  <button
                    disabled={startSessionMutation.isPending}
                    type="button"
                    onClick={async () => {
                      const session = await startSessionMutation.mutateAsync({ workoutPlanId: plan.id })
                      navigate(`/sessions/${session.id}`)
                    }}
                  >
                    Start session
                  </button>
                  <button
                    disabled={deletePlanMutation.isPending}
                    type="button"
                    onClick={async () => {
                      await deletePlanMutation.mutateAsync(plan.id)
                    }}
                  >
                    Delete
                  </button>
                </div>
                <p>Muscle groups: {plan.muscleGroups.join(', ') || 'None yet'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No workout plans created yet.</p>
        )}
        {startSessionMutation.isError ? <p>{getErrorMessage(startSessionMutation.error)}</p> : null}
      </section>
    </AppFrame>
  )
}
