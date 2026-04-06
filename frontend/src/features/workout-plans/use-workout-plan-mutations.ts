import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  AddPlanExerciseRequest,
  CreatePlanSetRequest,
  CreateWorkoutPlanRequest,
  ReorderPlanExercisesRequest,
  UpdatePlanSetRequest,
  UpdateWorkoutPlanRequest,
} from '@the-volumn/shared'
import {
  addPlanExercise,
  createPlanSet,
  createWorkoutPlan,
  deletePlanSet,
  deleteWorkoutPlan,
  removePlanExercise,
  reorderPlanExercises,
  updatePlanSet,
  updateWorkoutPlan,
} from '../../services/workout-plans-service'

function invalidateWorkoutPlanQueries(queryClient: ReturnType<typeof useQueryClient>, planId?: string) {
  void queryClient.invalidateQueries({ queryKey: ['workout-plans'] })

  if (planId) {
    void queryClient.invalidateQueries({ queryKey: ['workout-plan', planId] })
  }
}

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateWorkoutPlanRequest) => createWorkoutPlan(payload),
    onSuccess: (plan) => {
      invalidateWorkoutPlanQueries(queryClient, plan.id)
    },
  })
}

export function useUpdateWorkoutPlan(planId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateWorkoutPlanRequest) => updateWorkoutPlan(planId, payload),
    onSuccess: () => {
      invalidateWorkoutPlanQueries(queryClient, planId)
    },
  })
}

export function useDeleteWorkoutPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => deleteWorkoutPlan(planId),
    onSuccess: () => {
      invalidateWorkoutPlanQueries(queryClient)
    },
  })
}

export function useAddPlanExercise(planId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddPlanExerciseRequest) => addPlanExercise(planId, payload),
    onSuccess: () => {
      invalidateWorkoutPlanQueries(queryClient, planId)
    },
  })
}

export function useRemovePlanExercise(planId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planExerciseId: string) => removePlanExercise(planId, planExerciseId),
    onSuccess: () => {
      invalidateWorkoutPlanQueries(queryClient, planId)
    },
  })
}

export function useReorderPlanExercises(planId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReorderPlanExercisesRequest) => reorderPlanExercises(planId, payload),
    onSuccess: () => {
      invalidateWorkoutPlanQueries(queryClient, planId)
    },
  })
}

export function useCreatePlanSet(planId: string, planExerciseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePlanSetRequest) => createPlanSet(planId, planExerciseId, payload),
    onSuccess: () => {
      invalidateWorkoutPlanQueries(queryClient, planId)
    },
  })
}

export function useUpdatePlanSet(planId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ payload, setId }: { payload: UpdatePlanSetRequest; setId: string }) => updatePlanSet(setId, payload),
    onSuccess: () => {
      invalidateWorkoutPlanQueries(queryClient, planId)
    },
  })
}

export function useDeletePlanSet(planId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (setId: string) => deletePlanSet(setId),
    onSuccess: () => {
      invalidateWorkoutPlanQueries(queryClient, planId)
    },
  })
}
