import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch, invalidateApiCache } from '../lib/api'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'motion/react'

export default function Navbar({ theme, onToggle }) {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const lastYRef = useRef(0)

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = lastYRef.current
    lastYRef.current = latest

    setIsScrolled(latest > 16)

    if (isMobileMenuOpen) {
      setIsHidden(false)
      return
    }

    if (latest > 120 && latest > prev + 6) {
      setIsHidden(true)
    } else if (latest < prev - 4 || latest <= 80) {
      setIsHidden(false)
    }
  })

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
      // Keep UI responsive
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <motion.nav
      aria-label="Main navigation"
      initial={false}
      animate={{ y: isHidden ? '-100%' : '0%' }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 w-full transition-colors duration-200 ${
        isScrolled
          ? 'bg-white/90 dark:bg-[#090a0f]/88 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08]'
          : 'bg-white/80 dark:bg-[#090a0f]/75 backdrop-blur-sm border-b border-slate-200/60 dark:border-white/[0.05]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          to={user ? '/welcome' : '/'}
          className="flex items-center shrink-0 font-bold text-lg tracking-tight cursor-pointer"
        >
          <span className="text-slate-900 dark:text-white">Dev</span>
          <span className="text-accent dark:text-accent-light ml-0.5">Nest</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/explore"
            className={`text-sm font-medium transition-colors duration-150 ${
              location.pathname === '/explore'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Explore
          </Link>

          <button
            type="button"
            onClick={onToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 pl-6 border-l border-slate-200 dark:border-white/[0.1] cursor-pointer"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {user ? (
            <div className="flex items-center gap-5 pl-6 border-l border-slate-200 dark:border-white/[0.1]">
              <Link
                to={`/${user.username}`}
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors duration-150"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/[0.14]">
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
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-white/[0.1]">
              <Link
                to="/login"
                className="btn-glass-pill text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-3d-pill text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
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
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer p-2 -mr-2 rounded-md"
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-white dark:bg-[#0c0d13] border-t border-slate-200 dark:border-white/[0.08] px-6 py-4 flex flex-col gap-4 shadow-xl absolute w-full left-0 top-14"
          >
            <Link
              to="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 block w-full py-1"
            >
              Explore
            </Link>

            <button
              type="button"
              onClick={() => {
                onToggle()
                setIsMobileMenuOpen(false)
              }}
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 block w-full text-left cursor-pointer py-1"
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} mode
            </button>

            <div className="border-t border-slate-200 dark:border-white/[0.08] pt-4 mt-1">
              {user ? (
                <div className="flex flex-col gap-4">
                  <Link
                    to={`/${user.username}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm text-slate-800 dark:text-slate-200 hover:text-white transition-colors duration-150"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/[0.14]">
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
                    className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 text-left w-full cursor-pointer disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-glass-pill text-sm text-center font-medium px-4 py-2 rounded-lg block w-full cursor-pointer"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-3d-pill text-sm text-center font-semibold px-4 py-2 rounded-lg block w-full cursor-pointer"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
