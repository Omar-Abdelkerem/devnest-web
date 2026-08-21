/**
 * App.jsx — Root application component for DevNest
 *
 * Responsibilities:
 *   1. Call useTheme() to get the current theme and a toggle function.
 *      This hook manages localStorage persistence and the <html> dark class.
 *
 *   2. Compose the full page layout by assembling our named components
 *      in the correct order: Navbar → Hero → HowItWorks → Stats → Footer.
 *
 *   3. Pass { theme, onToggle } down to Navbar — the only component that
 *      needs to DISPLAY the toggle button and therefore needs both values.
 *      All other components respond to the <html> dark class automatically
 *      via Tailwind's dark: variants.
 *
 * Why doesn't App manage page-level theming classes directly?
 *   The <html> class is managed inside useTheme via useEffect, keeping the
 *   DOM mutation co-located with the state that drives it. App just consumes
 *   the hook's output — separation of concerns.
 *
 * Font note:
 *   `font-sans` applies Inter (defined in tailwind.config.js) to the whole
 *   app via the wrapping <div>. Individual components can override with
 *   `font-mono` where needed (tags, stats numbers, eyebrows).
 */

import { useTheme } from './hooks/useTheme'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar      from './components/Navbar'
import Hero        from './components/Hero'
import HowItWorks  from './components/HowItWorks'
import Stats       from './components/Stats'
import Footer      from './components/Footer'
import ProfilePage from './components/ProfilePage'
import ProfileEmptyPage from './components/ProfileEmptyPage'
import SignInPage  from './components/SignInPage'
import RegisterPage from './components/RegisterPage'

export default function App() {
  // theme = 'dark' | 'light'
  // toggleTheme = () => void — flips and persists the theme
  const { theme, toggleTheme } = useTheme()

  return (
    <BrowserRouter>
    {/*
     * The outer div has `font-sans` so Inter applies everywhere by default.
     * `antialiased` enables subpixel font rendering for crisp text on most
     * screens — standard practice for dark UI designs.
     * `min-h-screen` ensures the dark/light background fills the viewport
     * even on short pages.
     */}
    <div className="font-sans antialiased min-h-screen flex flex-col bg-white dark:bg-[#161616]">

      {/* ── Navigation ────────────────────────────────────────────── */}
      {/*
        Navbar receives theme so it can label the toggle correctly
        ("Light" when in dark mode, "dark" when in light mode),
        and onToggle to call back up to the hook.
      */}
      <Navbar theme={theme} onToggle={toggleTheme} />

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <HowItWorks />
              <Stats />
            </>
          } />
          <Route path="/login" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile-demo" element={<ProfilePage />} />
          <Route path="/profile-empty-demo" element={<ProfileEmptyPage />} />
        </Routes>
      </main>

      {/* ── Site footer ───────────────────────────────────────────── */}
      <Footer />
    </div>
    </BrowserRouter>
  )
}
