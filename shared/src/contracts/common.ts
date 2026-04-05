import { z } from 'zod'

export const userRoleSchema = z.enum(['STUDENT', 'TRAINER'])
export const themePreferenceSchema = z.enum(['rose', 'green', 'black'])
export const setTypeSchema = z.enum(['WARM_UP', 'FEEDER', 'NORMAL', 'FAILURE', 'DROP_SET'])
export const muscleGroupSchema = z.enum([
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'QUADS',
  'HAMSTRINGS',
  'GLUTES',
  'CALVES',
  'CORE',
  'FULL_BODY',
  'OTHER',
])
export const planAccentSchema = z.enum(['rose', 'green', 'black', 'blue', 'amber', 'violet'])
export const uuidSchema = z.uuid()
export const isoDateTimeSchema = z.iso.datetime({ offset: true })

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const paginatedMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
})

export const userSummarySchema = z.object({
  id: uuidSchema,
  email: z.email(),
  displayName: z.string().min(2).max(80),
  role: userRoleSchema,
  theme: themePreferenceSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
})

export type UserRole = z.infer<typeof userRoleSchema>
export type ThemePreference = z.infer<typeof themePreferenceSchema>
export type SetType = z.infer<typeof setTypeSchema>
export type MuscleGroup = z.infer<typeof muscleGroupSchema>
export type PlanAccent = z.infer<typeof planAccentSchema>
export type PaginationQuery = z.infer<typeof paginationQuerySchema>
export type PaginatedMeta = z.infer<typeof paginatedMetaSchema>
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>
export type UserSummary = z.infer<typeof userSummarySchema>
