/**
 * Navbar.jsx — Top navigation bar
 */

import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ theme, onToggle }) {
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      await fetch(`${baseUrl}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#111111] border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">

        {/* ── Logo ────────────────────────────────────────────────── */}
        <Link to={user ? "/welcome" : "/"} className="flex items-center shrink-0 font-semibold text-lg cursor-pointer">
          <span className="text-white">Dev</span>
          <span className="text-accent ml-1">Nest</span>
        </Link>

        {/* ── Right side controls ─────────────────────────────────── */}
        <div className="ml-auto flex items-center gap-6">

          {/* Theme toggle */}
          <button
            onClick={onToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="
              text-sm text-gray-400 hover:text-white
              transition-colors duration-150
              cursor-pointer
            "
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {/* Auth / User Section */}
          {user ? (
            <div className="flex items-center gap-6 pl-6 border-l border-white/10">
              <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-150">
                <div className="w-6 h-6 rounded bg-emerald-900 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {user.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <span className="font-medium">{user.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-150 cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6 pl-6 border-l border-white/10">
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
          )}

        </div>
      </div>
    </nav>
  )
}