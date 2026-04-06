import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { MuscleGroup, PlanExercise, ThemePreference } from '@the-volumn/shared'
import { AppFrame } from '../components/app-frame'
import { useCreateExercise } from '../features/exercises/use-create-exercise'
import { useExercises } from '../features/exercises/use-exercises'
import {
  useAddPlanExercise,
  useCreatePlanSet,
  useDeletePlanSet,
  useRemovePlanExercise,
  useReorderPlanExercises,
  useUpdatePlanSet,
  useUpdateWorkoutPlan,
} from '../features/workout-plans/use-workout-plan-mutations'
import { useWorkoutPlan } from '../features/workout-plans/use-workout-plan'
import { getErrorMessage } from '../services/http-error'

type PlanExerciseEditorProps = {
  canMoveDown: boolean
  canMoveUp: boolean
  onMoveDown: () => Promise<void>
  onMoveUp: () => Promise<void>
  planExercise: PlanExercise
  planId: string
}

function PlanExerciseEditor({ canMoveDown, canMoveUp, onMoveDown, onMoveUp, planExercise, planId }: PlanExerciseEditorProps) {
  const createPlanSetMutation = useCreatePlanSet(planId, planExercise.id)
  const deletePlanSetMutation = useDeletePlanSet(planId)
  const updatePlanSetMutation = useUpdatePlanSet(planId)
  const removePlanExerciseMutation = useRemovePlanExercise(planId)
  const [targetReps, setTargetReps] = useState('8')
  const [targetLoadKg, setTargetLoadKg] = useState('0')
  const [setType, setSetType] = useState<'WARM_UP' | 'FEEDER' | 'NORMAL' | 'FAILURE' | 'DROP_SET'>('NORMAL')

  return (
    <article style={{ border: '1px solid currentColor', padding: '1rem' }}>
      <h3>
        {planExercise.order + 1}. {planExercise.exerciseName}
      </h3>
      <p>{planExercise.muscleGroup}</p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button disabled={!canMoveUp} type="button" onClick={() => void onMoveUp()}>
          Move up
        </button>
        <button disabled={!canMoveDown} type="button" onClick={() => void onMoveDown()}>
          Move down
        </button>
        <button
          disabled={removePlanExerciseMutation.isPending}
          type="button"
          onClick={() => void removePlanExerciseMutation.mutateAsync(planExercise.id)}
        >
          Remove exercise
        </button>
      </div>

      <ul>
        {planExercise.sets.map((set) => (
          <li key={set.id}>
            {set.setType} - {set.targetLoadKg ?? 0} kg x {set.targetReps ?? 0}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() =>
                  void updatePlanSetMutation.mutateAsync({
                    setId: set.id,
                    payload: {
                      setType: set.setType,
                      targetLoadKg: set.targetLoadKg,
                      targetReps: (set.targetReps ?? 0) + 1,
                    },
                  })
                }
              >
                +1 rep
              </button>
              <button type="button" onClick={() => void deletePlanSetMutation.mutateAsync(set.id)}>
                Delete set
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form
        onSubmit={async (event) => {
          event.preventDefault()
          await createPlanSetMutation.mutateAsync({
            setType,
            targetLoadKg: targetLoadKg ? Number(targetLoadKg) : null,
            targetReps: targetReps ? Number(targetReps) : null,
          })
        }}
      >
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
          Load
          <input value={targetLoadKg} onChange={(event) => setTargetLoadKg(event.target.value)} />
        </label>
        <label>
          Reps
          <input value={targetReps} onChange={(event) => setTargetReps(event.target.value)} />
        </label>
        <button type="submit">Add set</button>
      </form>
    </article>
  )
}

export function WorkoutPlanEditorPage() {
  const { planId } = useParams()
  const workoutPlanQuery = useWorkoutPlan(planId)
  const [name, setName] = useState('')
  const [focusLabel, setFocusLabel] = useState('')
  const [accent, setAccent] = useState<ThemePreference | 'blue' | 'amber' | 'violet'>('rose')
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('CHEST')
  const exercisesQuery = useExercises({ page: 1, pageSize: 20, search: exerciseSearch })
  const updateWorkoutPlanMutation = useUpdateWorkoutPlan(planId ?? '')
  const addPlanExerciseMutation = useAddPlanExercise(planId ?? '')
  const reorderPlanExercisesMutation = useReorderPlanExercises(planId ?? '')
  const createExerciseMutation = useCreateExercise()
  const plan = workoutPlanQuery.data

  useEffect(() => {
    if (plan) {
      setName(plan.name)
      setFocusLabel(plan.focusLabel ?? '')
      setAccent((plan.accent ?? 'rose') as typeof accent)
    }
  }, [plan])

  return (
    <AppFrame subtitle="Compose exercises and planned sets" title="Workout Plan Editor">
      {!plan ? (
        <p>Loading workout plan...</p>
      ) : (
        <>
          <section>
            <h2>{plan.name}</h2>
            <form
              onSubmit={async (event) => {
                event.preventDefault()
                await updateWorkoutPlanMutation.mutateAsync({
                  name,
                  focusLabel: focusLabel || null,
                  accent,
                })
              }}
            >
              <label>
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label>
                Focus label
                <input value={focusLabel} onChange={(event) => setFocusLabel(event.target.value)} />
              </label>
              <label>
                Accent
                <select value={accent} onChange={(event) => setAccent(event.target.value as typeof accent)}>
                  <option value="rose">rose</option>
                  <option value="green">green</option>
                  <option value="black">black</option>
                  <option value="blue">blue</option>
                  <option value="amber">amber</option>
                  <option value="violet">violet</option>
                </select>
              </label>
              <button disabled={updateWorkoutPlanMutation.isPending} type="submit">
                Save plan
              </button>
            </form>
            {updateWorkoutPlanMutation.isError ? <p>{getErrorMessage(updateWorkoutPlanMutation.error)}</p> : null}
          </section>

          <section>
            <h2>Add exercises</h2>
            <label>
              Search
              <input value={exerciseSearch} onChange={(event) => setExerciseSearch(event.target.value)} />
            </label>
            <ul>
              {exercisesQuery.data?.items.map((exercise) => (
                <li key={exercise.id}>
                  {exercise.name} ({exercise.muscleGroup}) [{exercise.source}]
                  <button type="button" onClick={() => void addPlanExerciseMutation.mutateAsync({ exerciseId: exercise.id })}>
                    Add to plan
                  </button>
                </li>
              ))}
            </ul>

            <form
              onSubmit={async (event) => {
                event.preventDefault()
                await createExerciseMutation.mutateAsync({
                  name: exerciseSearch,
                  muscleGroup,
                })
              }}
            >
              <h3>Create custom exercise</h3>
              <label>
                Muscle group
                <select value={muscleGroup} onChange={(event) => setMuscleGroup(event.target.value as MuscleGroup)}>
                  <option value="CHEST">CHEST</option>
                  <option value="BACK">BACK</option>
                  <option value="SHOULDERS">SHOULDERS</option>
                  <option value="BICEPS">BICEPS</option>
                  <option value="TRICEPS">TRICEPS</option>
                  <option value="QUADS">QUADS</option>
                  <option value="HAMSTRINGS">HAMSTRINGS</option>
                  <option value="GLUTES">GLUTES</option>
                  <option value="CALVES">CALVES</option>
                  <option value="CORE">CORE</option>
                  <option value="FULL_BODY">FULL_BODY</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </label>
              <button disabled={createExerciseMutation.isPending || !exerciseSearch.trim()} type="submit">
                Create custom exercise
              </button>
            </form>
          </section>

          <section>
            <h2>Plan structure</h2>
            {plan.exercises.map((exercise, index) => {
              const orderedIds = plan.exercises.map((entry) => entry.id)

              return (
                <PlanExerciseEditor
                  key={exercise.id}
                  canMoveDown={index < orderedIds.length - 1}
                  canMoveUp={index > 0}
                  planExercise={exercise}
                  planId={plan.id}
                  onMoveDown={async () => {
                    if (index >= orderedIds.length - 1) {
                      return
                    }

                    const nextOrder = [...orderedIds]
                    ;[nextOrder[index], nextOrder[index + 1]] = [nextOrder[index + 1]!, nextOrder[index]!]
                    await reorderPlanExercisesMutation.mutateAsync({ orderedPlanExerciseIds: nextOrder })
                  }}
                  onMoveUp={async () => {
                    if (index === 0) {
                      return
                    }

                    const nextOrder = [...orderedIds]
                    ;[nextOrder[index - 1], nextOrder[index]] = [nextOrder[index]!, nextOrder[index - 1]!]
                    await reorderPlanExercisesMutation.mutateAsync({ orderedPlanExerciseIds: nextOrder })
                  }}
                />
              )
            })}
          </section>

          <Link to="/workout">Back to workouts</Link>
        </>
      )}
    </AppFrame>
  )
}
