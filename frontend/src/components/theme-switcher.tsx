import type { ThemeName } from '../store/theme-store'

type ThemeSwitcherProps = {
  className?: string
  onToggle: () => void
  theme: ThemeName
}

export function ThemeSwitcher({ className, onToggle, theme }: ThemeSwitcherProps) {
  return (
    <button
      aria-label={`Switch theme. Current theme: ${theme}`}
      className={['theme-switcher', className].filter(Boolean).join(' ')}
      type="button"
      onClick={onToggle}
    >
      <svg aria-hidden="true" className="theme-switcher__icon" viewBox="0 0 16 16">
        <path
          d="M8 2.2a5.8 5.8 0 1 0 5.8 5.8A5.8 5.8 0 0 0 8 2.2Zm0 9.8A4 4 0 1 1 12 8 4 4 0 0 1 8 12Zm0-7a1.1 1.1 0 1 0 1.1 1.1A1.1 1.1 0 0 0 8 5Zm0 0.4a0.7 0.7 0 1 1-.7.7.7.7 0 0 1 .7-.7Z"
          fill="currentColor"
        />
        <path
          d="M8 9.1a1.6 1.6 0 1 0 1.6 1.6A1.6 1.6 0 0 0 8 9.1Zm0 2.4a0.8 0.8 0 1 1 .8-.8.8.8 0 0 1-.8.8Z"
          fill="currentColor"
        />
      </svg>
    </button>
  )
}
