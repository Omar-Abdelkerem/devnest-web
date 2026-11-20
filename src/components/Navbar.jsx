import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch, invalidateApiCache } from '../lib/api'
import { useState, useEffect } from 'react'

export default function Navbar({ theme, onToggle }) {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMobileMenuOpen])

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await apiFetch('/api/v1/auth/logout', { method: 'POST' })
      invalidateApiCache()
      setUser(null)
      setIsMobileMenuOpen(false)
      navigate('/', { replace: true })
    } catch {
      // Keep UI responsive even if network drops
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full bg-[#111111]/95 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          to={user ? '/welcome' : '/'}
          className="flex items-center shrink-0 font-bold text-lg tracking-tight cursor-pointer group"
        >
          <span className="text-white transition-transform duration-200 group-hover:-translate-y-0.5">
            Dev
          </span>
          <span className="text-accent-light ml-0.5 transition-transform duration-200 group-hover:translate-y-0.5">
            Nest
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/explore"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-150"
          >
            Explore
          </Link>

          <button
            type="button"
            onClick={onToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-150 pl-6 border-l border-white/15 cursor-pointer"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {user ? (
            <div className="flex items-center gap-5 pl-6 border-l border-white/15">
              <Link
                to={`/${user.username}`}
                className="flex items-center gap-2 text-sm text-gray-200 hover:text-white transition-colors duration-150"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center text-xs font-bold text-accent-light border border-accent/40">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.username} avatar`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.username ? user.username.substring(0, 2).toUpperCase() : 'U'
                  )}
                </div>
                <span className="font-semibold">{user.username}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-150 cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 pl-6 border-l border-white/15">
              <Link
                to="/login"
                className="text-sm text-white font-medium px-4 py-1.5 rounded-md border border-white/25 hover:border-white/50 transition-colors duration-150 cursor-pointer"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm text-white font-bold px-4 py-1.5 rounded-md bg-accent hover:bg-accent-light transition-colors duration-150 cursor-pointer"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            className="text-gray-300 hover:text-white cursor-pointer p-2 -mr-2 rounded-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#111111] border-t border-white/10 px-6 py-4 flex flex-col gap-4 shadow-xl absolute w-full left-0 top-14">
          <Link
            to="/explore"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-medium text-gray-200 hover:text-white transition-colors duration-150 block w-full py-1"
          >
            Explore
          </Link>

          <button
            type="button"
            onClick={() => {
              onToggle()
              setIsMobileMenuOpen(false)
            }}
            className="text-sm font-medium text-gray-200 hover:text-white transition-colors duration-150 block w-full text-left cursor-pointer py-1"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} mode
          </button>

          <div className="border-t border-white/10 pt-4 mt-1">
            {user ? (
              <div className="flex flex-col gap-4">
                <Link
                  to={`/${user.username}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm text-gray-200 hover:text-white transition-colors duration-150"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center text-sm font-bold text-accent-light border border-accent/40">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={`${user.username} avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.username ? user.username.substring(0, 2).toUpperCase() : 'U'
                    )}
                  </div>
                  <span className="font-semibold">{user.username}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-150 text-left w-full cursor-pointer disabled:opacity-50"
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-center text-white font-medium px-4 py-2 rounded-md border border-white/25 hover:border-white/50 transition-colors duration-150 block w-full cursor-pointer"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-center text-white font-bold px-4 py-2 rounded-md bg-accent hover:bg-accent-light transition-colors duration-150 block w-full cursor-pointer"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
