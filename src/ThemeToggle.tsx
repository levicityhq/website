import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const storageKey = 'levicity-theme'

function savedTheme(): Theme {
  return localStorage.getItem(storageKey) === 'light' ? 'light' : 'dark'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(savedTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(storageKey, theme)
  }, [theme])

  const light = theme === 'light'
  function toggleTheme() {
    const next = light ? 'dark' : 'light'
    document.documentElement.dataset.theme = next
    localStorage.setItem(storageKey, next)
    setTheme(next)
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={light}
      aria-label={`Switch to ${light ? 'dark' : 'light'} theme`}
      className="flex items-center gap-2 font-mono text-[10px] text-muted"
      onClick={toggleTheme}
    >
      <span aria-hidden="true">{light ? '☼' : '◐'}</span>
      <span
        className={`relative h-5 w-9 rounded-full border transition-colors before:absolute before:top-1/2 before:left-0.5 before:size-3.5 before:-translate-y-1/2 before:rounded-full before:transition-transform ${light ? 'border-accent bg-accent before:translate-x-4 before:bg-ink' : 'border-divider bg-surface before:bg-muted'}`}
        aria-hidden="true"
      />
      <span>{light ? 'Light' : 'Dark'}</span>
    </button>
  )
}
