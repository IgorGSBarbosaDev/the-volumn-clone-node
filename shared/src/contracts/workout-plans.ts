import { z } from 'zod'
import {
  isoDateTimeSchema,
  muscleGroupSchema,
  paginatedMetaSchema,
  planAccentSchema,
  setTypeSchema,
  uuidSchema,
} from './common.js'

export const planSetSchema = z.object({
  id: uuidSchema,
  order: z.number().int().nonnegative(),
  setType: setTypeSchema,
  targetReps: z.number().int().positive().max(100).nullable(),
  targetLoadKg: z.number().nonnegative().max(1000).nullable(),
  notes: z.string().max(500).nullable(),
})

export const planExerciseSchema = z.object({
  id: uuidSchema,
  order: z.number().int().nonnegative(),
  exerciseId: uuidSchema,
  exerciseName: z.string().min(1),
  muscleGroup: muscleGroupSchema,
  sets: z.array(planSetSchema),
})

export const workoutPlanSummarySchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(80),
  accent: planAccentSchema.nullable(),
  focusLabel: z.string().max(80).nullable(),
  exerciseCount: z.number().int().nonnegative(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
})

export const workoutPlanDetailSchema = workoutPlanSummarySchema.extend({
  exercises: z.array(planExerciseSchema),
})

export const createWorkoutPlanRequestSchema = z.object({
  name: z.string().min(1).max(80),
  accent: planAccentSchema.nullable().optional(),
  focusLabel: z.string().max(80).nullable().optional(),
})

export const updateWorkoutPlanRequestSchema = createWorkoutPlanRequestSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
)

export const addPlanExerciseRequestSchema = z.object({
  exerciseId: uuidSchema,
})

export const reorderPlanExercisesRequestSchema = z.object({
  orderedPlanExerciseIds: z.array(uuidSchema).min(1),
})

export const createPlanSetRequestSchema = z.object({
  setType: setTypeSchema,
  targetReps: z.number().int().positive().max(100).nullable().optional(),
  targetLoadKg: z.number().nonnegative().max(1000).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

export const updatePlanSetRequestSchema = createPlanSetRequestSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
)

export const workoutPlanListResponseSchema = z.object({
  items: z.array(workoutPlanSummarySchema),
  meta: paginatedMetaSchema,
})

export type PlanSet = z.infer<typeof planSetSchema>
export type PlanExercise = z.infer<typeof planExerciseSchema>
export type WorkoutPlanSummary = z.infer<typeof workoutPlanSummarySchema>
export type WorkoutPlanDetail = z.infer<typeof workoutPlanDetailSchema>
export type CreateWorkoutPlanRequest = z.infer<typeof createWorkoutPlanRequestSchema>
export type UpdateWorkoutPlanRequest = z.infer<typeof updateWorkoutPlanRequestSchema>
export type AddPlanExerciseRequest = z.infer<typeof addPlanExerciseRequestSchema>
export type ReorderPlanExercisesRequest = z.infer<typeof reorderPlanExercisesRequestSchema>
export type CreatePlanSetRequest = z.infer<typeof createPlanSetRequestSchema>
export type UpdatePlanSetRequest = z.infer<typeof updatePlanSetRequestSchema>
export type WorkoutPlanListResponse = z.infer<typeof workoutPlanListResponseSchema>
