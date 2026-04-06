import {
  createWorkoutPlanRequestSchema,
  currentUserStatsResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
  sessionDetailResponseSchema,
  startSessionRequestSchema,
  workoutPlanSummarySchema,
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
  })

  it('accepts the integrated read models', () => {
    expect(
      currentUserStatsResponseSchema.parse({
        totalSessions: 3,
        prCount: 1,
      }),
    ).toBeDefined()

    expect(
      workoutPlanSummarySchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440100',
        name: 'Pull',
        accent: 'green',
        focusLabel: 'Back',
        exerciseCount: 2,
        muscleGroups: ['BACK', 'BICEPS'],
        totalPlannedSets: 6,
        createdAt: '2026-04-06T12:00:00.000Z',
        updatedAt: '2026-04-06T12:00:00.000Z',
      }),
    ).toBeDefined()

    expect(
      sessionDetailResponseSchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440101',
        workoutPlanId: '550e8400-e29b-41d4-a716-446655440102',
        workoutPlanName: 'Pull',
        status: 'ACTIVE',
        startedAt: '2026-04-06T12:00:00.000Z',
        completedAt: null,
        durationSeconds: null,
        totalSets: 1,
        exerciseCount: 1,
        totalVolumeKg: 560,
        sets: [
          {
            id: '550e8400-e29b-41d4-a716-446655440103',
            exerciseId: '550e8400-e29b-41d4-a716-446655440104',
            exerciseName: 'Barbell Row',
            muscleGroup: 'BACK',
            setType: 'NORMAL',
            weightKg: 70,
            reps: 8,
            notes: null,
            isPR: true,
            createdAt: '2026-04-06T12:01:00.000Z',
          },
        ],
      }),
    ).toBeDefined()
  })
})
