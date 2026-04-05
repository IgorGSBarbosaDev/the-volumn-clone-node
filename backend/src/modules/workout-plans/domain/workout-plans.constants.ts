export const WORKOUT_PLAN_ERRORS = {
  invalidExerciseOrder: {
    code: 'INVALID_PLAN_EXERCISE_ORDER',
    message: 'Plan exercise order payload must match the current plan exercises exactly',
  },
  limitReached: {
    code: 'WORKOUT_PLAN_LIMIT_REACHED',
    message: 'Student users may create at most five workout plans',
  },
  planExerciseNotFound: {
    code: 'PLAN_EXERCISE_NOT_FOUND',
    message: 'Plan exercise not found',
  },
  planNotFound: {
    code: 'WORKOUT_PLAN_NOT_FOUND',
    message: 'Workout plan not found',
  },
  planSetNotFound: {
    code: 'PLAN_SET_NOT_FOUND',
    message: 'Plan set not found',
  },
  userNotFound: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
  },
} as const

export const STUDENT_WORKOUT_PLAN_LIMIT = 5
