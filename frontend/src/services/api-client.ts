import type { AuthSession } from '@the-volumn/shared'
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearAuthSession, getAccessToken, setAuthSession } from '../features/auth/auth-store'

const baseConfig = {
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
} as const

export const publicApiClient = axios.create(baseConfig)

export const apiClient = axios.create(baseConfig)

let refreshRequest: Promise<string> | null = null

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const requestConfig = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (!requestConfig || error.response?.status !== 401 || requestConfig._retry || requestConfig.url?.startsWith('/auth/')) {
      throw error
    }

    requestConfig._retry = true

    try {
      if (!refreshRequest) {
        refreshRequest = publicApiClient
          .post<AuthSession>('/auth/refresh')
          .then((response) => {
            setAuthSession(response.data)
            return response.data.accessToken
          })
          .finally(() => {
            refreshRequest = null
          })
      }

      const accessToken = await refreshRequest
      requestConfig.headers.set('Authorization', `Bearer ${accessToken}`)

      return apiClient.request(requestConfig)
    } catch (refreshError) {
      clearAuthSession()
      throw refreshError
    }
  },
)
