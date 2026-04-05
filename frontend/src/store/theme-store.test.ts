import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useThemeStore } from './theme-store'

describe('theme store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useThemeStore.setState({ theme: 'rose' })
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('cycles through the supported v0.1 themes', () => {
    act(() => {
      useThemeStore.getState().cycleTheme()
    })
    expect(useThemeStore.getState().theme).toBe('green')

    act(() => {
      useThemeStore.getState().cycleTheme()
    })
    expect(useThemeStore.getState().theme).toBe('black')

    act(() => {
      useThemeStore.getState().cycleTheme()
    })
    expect(useThemeStore.getState().theme).toBe('rose')
  })

  it('persists explicit theme updates', () => {
    act(() => {
      useThemeStore.getState().setTheme('black')
    })

    expect(window.localStorage.getItem('the-volumn-theme')).toBe('black')
  })
})

