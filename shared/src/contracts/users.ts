import { z } from 'zod'
import { themePreferenceSchema, userSummarySchema } from './common.js'

export const updateCurrentUserRequestSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  theme: themePreferenceSchema.optional(),
}).refine((value) => typeof value.displayName !== 'undefined' || typeof value.theme !== 'undefined', {
  message: 'At least one field must be provided',
})

export const currentUserResponseSchema = userSummarySchema

export const currentUserStatsResponseSchema = z.object({
  totalSessions: z.number().int().nonnegative(),
  prCount: z.number().int().nonnegative(),
})

export type UpdateCurrentUserRequest = z.infer<typeof updateCurrentUserRequestSchema>
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>
export type CurrentUserStatsResponse = z.infer<typeof currentUserStatsResponseSchema>
