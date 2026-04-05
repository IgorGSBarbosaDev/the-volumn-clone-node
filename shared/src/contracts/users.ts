import { z } from 'zod'
import { themePreferenceSchema, userSummarySchema } from './common.js'

export const updateCurrentUserRequestSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  theme: themePreferenceSchema.optional(),
})

export const currentUserResponseSchema = userSummarySchema

export type UpdateCurrentUserRequest = z.infer<typeof updateCurrentUserRequestSchema>
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>
