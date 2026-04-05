import type { UpdateCurrentUserRequest } from '@the-volumn/shared'
import { db } from '../../../config/db.js'

export async function findCurrentUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
  })
}

export async function updateCurrentUserProfile(userId: string, payload: UpdateCurrentUserRequest) {
  return db.user.update({
    where: { id: userId },
    data: {
      ...(typeof payload.displayName !== 'undefined' ? { displayName: payload.displayName } : {}),
      ...(typeof payload.theme !== 'undefined' ? { theme: payload.theme } : {}),
    },
  })
}
