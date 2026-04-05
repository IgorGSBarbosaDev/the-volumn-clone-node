import type { SetType } from '@the-volumn/shared'

export const SESSION_ERRORS = {
  activeSessionExists: {
    code: 'ACTIVE_SESSION_EXISTS',
    message: 'User already has an active workout session',
  },
  exerciseNotInSessionPlan: {
    code: 'EXERCISE_NOT_IN_SESSION_PLAN',
    message: 'Exercise is not part of the session plan snapshot',
  },
  invalidCompletionTime: {
    code: 'INVALID_SESSION_COMPLETION_TIME',
    message: 'Session completion time must not be before the session start time',
  },
  sessionNotActive: {
    code: 'SESSION_NOT_ACTIVE',
    message: 'Workout session is not active',
  },
  sessionNotFound: {
    code: 'WORKOUT_SESSION_NOT_FOUND',
    message: 'Workout session not found',
  },
} as const

export const SESSION_PR_ELIGIBLE_SET_TYPES = ['NORMAL', 'FAILURE', 'DROP_SET'] as const satisfies readonly SetType[]
export const SESSION_PR_INELIGIBLE_SET_TYPES = ['WARM_UP', 'FEEDER'] as const satisfies readonly SetType[]
