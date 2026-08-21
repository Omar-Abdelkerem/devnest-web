/**
 * Navbar.jsx — Top navigation bar
 *
 * Structure:
 *   <nav> (full width, dark background in both modes — matches the screenshot)
 *     ├── Logo: "Dev" (white) + "Nest" (accent teal)
 *     ├── Nav links: Explore, New user (muted text)
 *     ├── Theme toggle: shows current opposite mode label ("Light" / "Dark")
 *     │     The button gets a subtle border so it reads as a toggle chip,
 *     │     matching the Figma design.
 *     ├── Sign in: outlined button
 *     └── Get started: filled accent CTA button
 *
 * Props:
 *   theme      — 'dark' | 'light', used to label the toggle button correctly
 *   onToggle   — callback to flip the theme
 *
 * Why the navbar stays dark in light mode:
 *   Looking at the light-mode screenshots the top bar remains the same
 *   near-black colour (#111). This is intentional — it anchors the page
 *   and keeps the logo/CTA contrast consistent regardless of page theme.
 */

import { Link } from 'react-router-dom'

export default function Navbar({ theme, onToggle }) {
  return (
    <nav
      aria-label="Main navigation"
      className="
        sticky top-0 z-50
        w-full bg-[#111111]
        border-b border-white/5
      "
    >
      {/* Inner container: constrain width, align items in a single row */}
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">

        {/* ── Logo ────────────────────────────────────────────────── */}
        {/*
          "Dev" is white and "Nest" carries the accent teal.
          Using a plain anchor here — no router yet per requirements.
        */}
        <Link to="/" className="flex items-center shrink-0 font-semibold text-lg">
          <span className="text-white">Dev</span>
          <span className="text-accent ml-1">Nest</span>
        </Link>

        {/* ── Nav links (push to the right via ml-auto) ───────────── */}
        <div className="ml-auto flex items-center gap-6">

          {/* Primary nav links — muted colour, subtle hover */}
          <Link
            to="#"
            className="
              text-sm text-gray-400 hover:text-white
              transition-colors duration-150
            "
          >
            Explore
          </Link>
          <Link
            to="#"
            className="
              text-sm text-gray-400 hover:text-white
              transition-colors duration-150
            "
          >
            New user
          </Link>

          {/* ── Theme toggle ──────────────────────────────────────── */}
          {/*
            The button label shows the CURRENT theme name (not the target),
            matching the screenshot ("Light" visible when in dark mode,
            "dark" visible when in light mode).
            A vertical separator on the left (border-l) separates it from
            nav links, just as in the Figma design.
          */}
          <button
            onClick={onToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="
              text-sm text-gray-400 hover:text-white
              transition-colors duration-150
              pl-6 border-l border-white/10
              cursor-pointer
            "
          >
            {/* Show the CURRENT theme label so the user knows what they're in */}
            {theme === 'dark' ? 'Light' : 'dark'}
          </button>

          {/* ── Auth buttons ──────────────────────────────────────── */}
          <Link
            to="/login"
            className="
              text-sm text-white font-medium
              px-4 py-1.5 rounded
              border border-white/20
              hover:border-white/40
              transition-colors duration-150
              cursor-pointer
            "
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="
              text-sm text-white font-semibold
              px-4 py-1.5 rounded
              bg-accent hover:bg-accent-light
              transition-colors duration-150
              cursor-pointer
            "
          >
            Get started
          </Link>

        </div>
      </div>
    </nav>
  )
}
