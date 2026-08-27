/**
 * Footer.jsx — Site footer
 *
 * Structure:
 *   <footer>
 *     ├── Logo: "Dev" (accent) + "Nest" (white)
 *     │     Note: in the footer the logo colouring FLIPS vs the navbar —
 *     │     "Dev" is accent and "Nest" is white. This matches the screenshot.
 *     ├── Nav links: About, API Docs, Privacy, Terms
 *     └── Copyright: "© 2026 DevNest"
 *
 * Removed: Blog and Changelog — no content exists yet.
 * The footer stays dark in both themes (same reason as the Navbar and Stats
 * band — the dark footer anchors the page bottom visually).
 *
 * Layout:
 *   Single row on desktop (logo left · links centre · copyright right).
 *   Stacked on mobile (flex-col, items-center).
 */

import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  { label: 'About',    to: '/about'    },
  { label: 'API Docs', to: '/api-docs' },
  { label: 'Privacy',  to: '/privacy'  },
  { label: 'Terms',    to: '/terms'    },
]

export default function Footer() {
  return (
    <footer
      className="
        bg-[#111111] border-t border-white/5
      "
    >
      <div
        className="
          max-w-6xl mx-auto px-6 py-8
          flex flex-col md:flex-row items-center
          gap-6 md:gap-0
        "
      >
        {/* ── Logo ────────────────────────────────────────────────── */}
        {/*
          In the footer the colour scheme flips: "Dev" is accent teal,
          "Nest" is white — this is intentional in the Figma design.
        */}
        <Link to="/" className="flex items-center font-bold text-base shrink-0">
          <span className="text-accent">Dev</span>
          <span className="text-white">Nest</span>
        </Link>

        {/* ── Nav links ────────────────────────────────────────────── */}
        <nav
          aria-label="Footer navigation"
          className="
            md:mx-auto
            flex flex-wrap justify-center gap-x-6 gap-y-2
          "
        >
          {FOOTER_LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="
                text-sm text-gray-500
                hover:text-gray-300
                transition-colors duration-150
              "
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Copyright ────────────────────────────────────────────── */}
        <p className="text-xs text-gray-600 shrink-0">
          © 2026 DevNest
        </p>

      </div>
    </footer>
  )
}
