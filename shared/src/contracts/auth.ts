import { z } from 'zod'
import { isoDateTimeSchema, themePreferenceSchema, userRoleSchema, userSummarySchema } from './common.js'

export const registerRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
  displayName: z.string().min(2).max(80),
  role: userRoleSchema,
  theme: themePreferenceSchema.default('rose'),
})

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
})

export const authSessionSchema = z.object({
  user: userSummarySchema,
  accessToken: z.string().min(1),
  accessTokenExpiresAt: isoDateTimeSchema,
})

export type RegisterRequest = z.infer<typeof registerRequestSchema>
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type AuthSession = z.infer<typeof authSessionSchema>
