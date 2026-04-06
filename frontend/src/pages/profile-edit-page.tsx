import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppFrame } from '../components/app-frame'
import { useAuth } from '../features/auth/use-auth'
import { useUpdateProfile } from '../features/users/use-update-profile'
import { getErrorMessage } from '../services/http-error'

export function ProfileEditPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const updateProfileMutation = useUpdateProfile()
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? '')
  const [theme, setTheme] = useState(currentUser?.theme ?? 'rose')

  useEffect(() => {
    setDisplayName(currentUser?.displayName ?? '')
    setTheme(currentUser?.theme ?? 'rose')
  }, [currentUser])

  return (
    <AppFrame subtitle="Update your profile" title="Edit Profile">
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          await updateProfileMutation.mutateAsync({ displayName, theme })
          navigate('/profile')
        }}
      >
        <label>
          Display name
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        </label>

        <label>
          Theme
          <select value={theme} onChange={(event) => setTheme(event.target.value as 'rose' | 'green' | 'black')}>
            <option value="rose">rose</option>
            <option value="green">green</option>
            <option value="black">black</option>
          </select>
        </label>

        {updateProfileMutation.isError ? <p>{getErrorMessage(updateProfileMutation.error)}</p> : null}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button disabled={updateProfileMutation.isPending} type="submit">
            Save
          </button>
          <Link to="/profile">Cancel</Link>
        </div>
      </form>
    </AppFrame>
  )
}
