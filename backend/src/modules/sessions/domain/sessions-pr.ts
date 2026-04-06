import type { SetType } from '@the-volumn/shared'
import { SESSION_PR_ELIGIBLE_SET_TYPES } from './sessions.constants.js'

export function isPrEligibleSetType(setType: SetType): setType is (typeof SESSION_PR_ELIGIBLE_SET_TYPES)[number] {
  return SESSION_PR_ELIGIBLE_SET_TYPES.includes(setType as (typeof SESSION_PR_ELIGIBLE_SET_TYPES)[number])
}

export function getPerformanceScore(weightKg: number, reps: number) {
  return Math.round(weightKg * 100) * reps
}
