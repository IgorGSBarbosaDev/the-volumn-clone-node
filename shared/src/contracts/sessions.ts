import { z } from 'zod'
import {
  isoDateTimeSchema,
  muscleGroupSchema,
  paginatedMetaSchema,
  setTypeSchema,
  uuidSchema,
} from './common.js'
import { workoutPlanDetailSchema } from './workout-plans.js'

export const sessionStatusSchema = z.enum(['ACTIVE', 'COMPLETED'])
export const sessionPlanSnapshotSchema = workoutPlanDetailSchema

export const sessionSetSchema = z.object({
  id: uuidSchema,
  exerciseId: uuidSchema,
  exerciseName: z.string().min(1).max(120),
  muscleGroup: muscleGroupSchema,
  setType: setTypeSchema,
  weightKg: z.number().nonnegative().max(1000),
  reps: z.number().int().positive().max(100),
  notes: z.string().max(500).nullable(),
  isPR: z.boolean(),
  createdAt: isoDateTimeSchema,
})

export const workoutSessionSummarySchema = z.object({
  id: uuidSchema,
  workoutPlanId: uuidSchema,
  workoutPlanName: z.string().min(1),
  status: sessionStatusSchema,
  startedAt: isoDateTimeSchema,
  completedAt: isoDateTimeSchema.nullable(),
  durationSeconds: z.number().int().nonnegative().nullable(),
  totalSets: z.number().int().nonnegative(),
  exerciseCount: z.number().int().nonnegative(),
  totalVolumeKg: z.number().nonnegative(),
})

export const workoutSessionDetailSchema = workoutSessionSummarySchema.extend({
  planSnapshot: sessionPlanSnapshotSchema,
  sets: z.array(sessionSetSchema),
})

export const activeSessionResponseSchema = workoutSessionDetailSchema.nullable()

export const startSessionRequestSchema = z.object({
  workoutPlanId: uuidSchema,
})

export const createSessionSetRequestSchema = z.object({
  exerciseId: uuidSchema,
  setType: setTypeSchema,
  weightKg: z.number().nonnegative().max(1000),
  reps: z.number().int().positive().max(100),
  notes: z.string().max(500).nullable().optional(),
})

export const completeSessionRequestSchema = z.object({
  completedAt: isoDateTimeSchema.optional(),
})

export const sessionsListResponseSchema = z.object({
  items: z.array(workoutSessionSummarySchema),
  meta: paginatedMetaSchema,
})

export type SessionStatus = z.infer<typeof sessionStatusSchema>
export type SessionPlanSnapshot = z.infer<typeof sessionPlanSnapshotSchema>
export type SessionSet = z.infer<typeof sessionSetSchema>
export type WorkoutSessionSummary = z.infer<typeof workoutSessionSummarySchema>
export type WorkoutSessionDetail = z.infer<typeof workoutSessionDetailSchema>
export type ActiveSessionResponse = z.infer<typeof activeSessionResponseSchema>
export type StartSessionRequest = z.infer<typeof startSessionRequestSchema>
export type CreateSessionSetRequest = z.infer<typeof createSessionSetRequestSchema>
export type CompleteSessionRequest = z.infer<typeof completeSessionRequestSchema>
export type SessionsListResponse = z.infer<typeof sessionsListResponseSchema>
