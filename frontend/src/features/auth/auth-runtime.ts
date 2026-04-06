import { refreshSession } from '../../services/auth-service'
import { clearAuthSession, markAuthBootstrapping, setAuthSession } from './auth-store'

let bootstrapPromise: Promise<void> | null = null

export async function bootstrapAuth() {
  if (bootstrapPromise) {
    return bootstrapPromise
  }

  markAuthBootstrapping()

  bootstrapPromise = (async () => {
    try {
      const session = await refreshSession()
      setAuthSession(session)
    } catch {
      clearAuthSession()
    }
  })().finally(() => {
    bootstrapPromise = null
  })

  return bootstrapPromise
}
