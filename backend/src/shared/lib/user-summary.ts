import type { ThemePreference, UserRole, UserSummary } from '@the-volumn/shared'

type UserSummarySource = {
  createdAt: Date
  displayName: string
  email: string
  id: string
  role: UserRole
  theme: ThemePreference
  updatedAt: Date
}

export function mapUserSummary(user: UserSummarySource): UserSummary {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    theme: user.theme,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
