import { describe, expect, it } from 'vitest'
import {
  createWorkoutPlanRequestSchema,
  currentUserStatsResponseSchema,
  errorEnvelopeSchema,
  loginRequestSchema,
  registerRequestSchema,
  sessionDetailResponseSchema,
  startSessionRequestSchema,
  workoutPlanSummarySchema,
  workoutSessionSummarySchema,
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

  it('parses the approved read models', () => {
    expect(
      currentUserStatsResponseSchema.parse({
        totalSessions: 4,
        prCount: 2,
      }),
    ).toBeDefined()

    expect(
      workoutPlanSummarySchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Push Day',
        accent: 'rose',
        focusLabel: 'Chest',
        exerciseCount: 3,
        muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
        totalPlannedSets: 10,
        createdAt: '2026-04-06T12:00:00.000Z',
        updatedAt: '2026-04-06T12:00:00.000Z',
      }),
    ).toBeDefined()

    expect(
      workoutSessionSummarySchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440011',
        workoutPlanId: '550e8400-e29b-41d4-a716-446655440012',
        workoutPlanName: 'Push Day',
        status: 'COMPLETED',
        startedAt: '2026-04-06T12:00:00.000Z',
        completedAt: '2026-04-06T13:00:00.000Z',
        durationSeconds: 3600,
        totalSets: 8,
        exerciseCount: 3,
        totalVolumeKg: 2420,
      }),
    ).toBeDefined()

    expect(
      sessionDetailResponseSchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440011',
        workoutPlanId: '550e8400-e29b-41d4-a716-446655440012',
        workoutPlanName: 'Push Day',
        status: 'ACTIVE',
        startedAt: '2026-04-06T12:00:00.000Z',
        completedAt: null,
        durationSeconds: null,
        totalSets: 1,
        exerciseCount: 1,
        totalVolumeKg: 800,
        sets: [
          {
            id: '550e8400-e29b-41d4-a716-446655440013',
            exerciseId: '550e8400-e29b-41d4-a716-446655440014',
            exerciseName: 'Barbell Bench Press',
            muscleGroup: 'CHEST',
            setType: 'NORMAL',
            weightKg: 100,
            reps: 8,
            notes: null,
            isPR: false,
            createdAt: '2026-04-06T12:05:00.000Z',
          },
        ],
      }),
    ).toBeDefined()
  })
})
