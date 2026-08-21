/**
 * useTheme.js — Custom hook for class-based light/dark theme management
 *
 * Why a custom hook?
 *   Centralising theme logic here means any component can call useTheme()
 *   without duplicating localStorage reads or DOM mutations.
 *
 * Strategy:
 *   1. On mount, read localStorage for 'devnest-theme'.
 *   2. Default to 'dark' if nothing is stored (matches the design intent).
 *   3. Apply theme by adding/removing the 'dark' class on <html>.
 *      Tailwind's class-based dark mode watches for this class.
 *   4. Expose { theme, toggleTheme } so consumers can both read state
 *      and trigger a toggle.
 */

import { useState, useEffect } from 'react'

// The key we use in localStorage
const STORAGE_KEY = 'devnest-theme'

export function useTheme() {
  // Initialise from localStorage, or fall back to 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) ?? 'dark'
  })

  // Whenever 'theme' changes, sync the <html> class and persist to storage
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme }
}
