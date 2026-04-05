import {
  createExerciseRequestSchema,
  createWorkoutPlanRequestSchema,
  loginRequestSchema,
  registerRequestSchema,
  startSessionRequestSchema,
} from '@the-volumn/shared'
import { describe, expect, it } from 'vitest'

describe('shared contracts', () => {
  it('accepts baseline auth payloads', () => {
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

  it('accepts baseline workout payloads', () => {
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
      createExerciseRequestSchema.parse({
        name: '  Cable Fly  ',
        muscleGroup: 'CHEST',
      }),
    ).toMatchObject({
      name: 'Cable Fly',
      muscleGroup: 'CHEST',
    })
  })
})
