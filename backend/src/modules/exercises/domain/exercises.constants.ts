export const EXERCISE_ERRORS = {
  exerciseNotFound: {
    code: 'EXERCISE_NOT_FOUND',
    message: 'Exercise not found',
  },
} as const

export const EXERCISE_HISTORY_SET_TYPES = ['NORMAL', 'FAILURE', 'DROP_SET'] as const
