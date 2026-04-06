import { Link, useNavigate } from 'react-router-dom'
import { AppFrame } from '../components/app-frame'
import { useAuth } from '../features/auth/use-auth'
import { useLogout } from '../features/auth/use-logout'
import { useCurrentUserStats } from '../features/users/use-current-user-stats'

export function ProfilePage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const statsQuery = useCurrentUserStats()
  const logoutMutation = useLogout()

  return (
    <AppFrame subtitle={currentUser?.email} title={currentUser?.displayName ?? 'Profile'}>
      <section>
        <h2>Account</h2>
        <p>Role: {currentUser?.role}</p>
        <p>Theme: {currentUser?.theme}</p>
        <Link to="/profile/edit">Edit display name and theme</Link>
      </section>

      <section>
        <h2>Stats</h2>
        <p>Total completed sessions: {statsQuery.data?.totalSessions ?? 0}</p>
        <p>PR count: {statsQuery.data?.prCount ?? 0}</p>
      </section>

      <section>
        <h2>Settings</h2>
        <p>Connected apps, exports, avatar editing, and advanced analytics remain out of scope in V0.1.</p>
      </section>

      <button
        disabled={logoutMutation.isPending}
        type="button"
        onClick={async () => {
          await logoutMutation.mutateAsync()
          navigate('/login', { replace: true })
        }}
      >
        {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
      </button>
    </AppFrame>
  )
}
