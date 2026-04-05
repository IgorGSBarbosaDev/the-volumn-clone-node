import { config } from 'dotenv'
import { z } from 'zod'

config({ path: '.env' })

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/the_volumn?schema=public'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  JWT_ACCESS_SECRET: z.string().min(16).default('development-access-secret'),
  JWT_REFRESH_SECRET: z.string().min(16).default('development-refresh-secret'),
})

export const env = envSchema.parse(process.env)

const disallowedProductionSecrets = new Set([
  'development-access-secret',
  'development-refresh-secret',
  'change-me-access',
  'change-me-refresh',
])

if (env.NODE_ENV === 'production') {
  if (disallowedProductionSecrets.has(env.JWT_ACCESS_SECRET)) {
    throw new Error('JWT_ACCESS_SECRET must be set to a non-default value in production')
  }

  if (disallowedProductionSecrets.has(env.JWT_REFRESH_SECRET)) {
    throw new Error('JWT_REFRESH_SECRET must be set to a non-default value in production')
  }
}
