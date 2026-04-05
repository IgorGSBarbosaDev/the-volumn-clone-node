import { useEffect, useMemo } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HistoryPage } from '../pages/history-page'
import { HomePage } from '../pages/home-page'
import { LandingPage } from '../pages/landing-page'
import { LoginPage } from '../pages/login-page'
import { ProfilePage } from '../pages/profile-page'
import { WorkoutPage } from '../pages/workout-page'
import { useThemeStore } from '../store/theme-store'
import { AppProviders } from './app-providers'

export function AppRoot() {
  const theme = useThemeStore((state) => state.theme)
  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          element: <LandingPage />,
          path: '/',
        },
        {
          element: <HomePage />,
          path: '/home',
        },
        {
          element: <HistoryPage />,
          path: '/history',
        },
        {
          element: <LoginPage />,
          path: '/login',
        },
        {
          element: <WorkoutPage />,
          path: '/workout',
        },
        {
          element: <ProfilePage />,
          path: '/profile',
        },
      ]),
    [],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
