import { describe, expect, it } from 'vitest'
import {
  createWorkoutPlanRequestSchema,
  errorEnvelopeSchema,
  loginRequestSchema,
  updateCurrentUserRequestSchema,
  registerRequestSchema,
  startSessionRequestSchema,
} from '../index.js'

describe('shared contracts', () => {
  it('parses baseline auth payloads', () => {
    expect(
      registerRequestSchema.parse({
        email: 'alex@example.com',
        password: 'password123',
        displayName: 'Alex',
        role: 'STUDENT',
        theme: 'rose',
      }),
    ).toBeDefined()

    expect(
      loginRequestSchema.parse({
        email: 'alex@example.com',
        password: 'password123',
      }),
    ).toBeDefined()
  })

  it('parses core workout payloads and errors', () => {
    expect(
      createWorkoutPlanRequestSchema.parse({
        name: 'Push Day',
        accent: 'rose',
      }),
    ).toBeDefined()

    expect(
      startSessionRequestSchema.parse({
        workoutPlanId: '550e8400-e29b-41d4-a716-446655440001',
      }),
    ).toBeDefined()

    expect(
      errorEnvelopeSchema.parse({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
        },
      }),
    ).toBeDefined()
  })

  it('requires at least one current-user field for profile updates', () => {
    expect(
      updateCurrentUserRequestSchema.parse({
        theme: 'green',
      }),
    ).toBeDefined()

    expect(() => updateCurrentUserRequestSchema.parse({})).toThrowError('At least one field must be provided')
  })
})
