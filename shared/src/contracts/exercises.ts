import { z } from 'zod'
import {
  isoDateTimeSchema,
  muscleGroupSchema,
  paginatedMetaSchema,
  uuidSchema,
} from './common.js'

export const exerciseSourceSchema = z.enum(['DEFAULT', 'CUSTOM'])

export const exerciseSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(120),
  muscleGroup: muscleGroupSchema,
  source: exerciseSourceSchema,
  ownerUserId: uuidSchema.nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
})

export const exercisesQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  muscleGroup: muscleGroupSchema.optional(),
  source: exerciseSourceSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const createExerciseRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  muscleGroup: muscleGroupSchema,
})

export const exerciseHistoryEntrySchema = z.object({
  sessionId: uuidSchema,
  sessionCompletedAt: isoDateTimeSchema,
  setId: uuidSchema,
  setType: z.enum(['NORMAL', 'FAILURE', 'DROP_SET']),
  weightKg: z.number().nonnegative(),
  reps: z.number().int().positive(),
  volume: z.number().nonnegative(),
  isPR: z.boolean(),
  notes: z.string().max(500).nullable(),
})

export const exercisesListResponseSchema = z.object({
  items: z.array(exerciseSchema),
  meta: paginatedMetaSchema,
})

export const exerciseHistoryResponseSchema = z.object({
  exercise: exerciseSchema,
  items: z.array(exerciseHistoryEntrySchema),
  meta: paginatedMetaSchema,
})

export type ExerciseSource = z.infer<typeof exerciseSourceSchema>
export type Exercise = z.infer<typeof exerciseSchema>
export type ExercisesQuery = z.infer<typeof exercisesQuerySchema>
export type CreateExerciseRequest = z.infer<typeof createExerciseRequestSchema>
export type ExerciseHistoryEntry = z.infer<typeof exerciseHistoryEntrySchema>
export type ExercisesListResponse = z.infer<typeof exercisesListResponseSchema>
export type ExerciseHistoryResponse = z.infer<typeof exerciseHistoryResponseSchema>
