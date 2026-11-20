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
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/85 dark:bg-[#07070b]/82 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)]'
          : 'bg-white/70 dark:bg-[#07070b]/65 backdrop-blur-md border-b border-slate-200/60 dark:border-white/[0.05]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-15 flex items-center justify-between">
        {/* Brand Logo with Glowing Core */}
        <Link
          to={user ? '/welcome' : '/'}
          className="group flex items-center gap-2.5 shrink-0 font-extrabold text-lg tracking-tight cursor-pointer"
        >
          <span className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-b from-accent-light/25 to-accent/10 border border-accent-light/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_0_16px_-3px_rgba(60,210,191,0.5)]">
            <span className="w-2 h-2 rounded-full bg-accent-light shadow-[0_0_8px_#3cd2bf]" />
          </span>
          <span className="flex items-center">
            <span className="text-slate-900 dark:text-white">Dev</span>
            <span className="text-accent dark:text-accent-light ml-0.5">Nest</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/explore"
            className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors duration-150 ${
              location.pathname === '/explore'
                ? 'text-accent dark:text-accent-light bg-accent/10 border border-accent/25'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Explore
          </Link>

          <Link
            to="/about"
            className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors duration-150 ${
              location.pathname === '/about'
                ? 'text-accent dark:text-accent-light bg-accent/10 border border-accent/25'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            About
          </Link>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/[0.1] bg-slate-100/70 dark:bg-white/[0.04] hover:border-accent/40 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
                <span>Dark</span>
              </>
            )}
          </motion.button>

          {user ? (
            <div className="flex items-center gap-4 pl-5 border-l border-slate-200 dark:border-white/[0.1]">
              <Link
                to={`/${user.username}`}
                className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.09] hover:border-accent/40 transition-colors duration-150"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center text-xs font-bold text-accent dark:text-accent-light border border-accent/40">
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
                <span className="font-semibold pr-1">{user.username}</span>
              </Link>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-5 border-l border-slate-200 dark:border-white/[0.1]">
              <Link
                to="/login"
                className="btn-glass-pill text-xs font-semibold px-4 py-1.5 rounded-full cursor-pointer"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-3d-pill text-xs font-bold px-4 py-1.5 rounded-full cursor-pointer"
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
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer p-2 -mr-2 rounded-lg"
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-white/95 dark:bg-[#0a0b10]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/[0.08] px-6 py-5 flex flex-col gap-4 shadow-2xl absolute w-full left-0 top-15"
          >
            <Link
              to="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-accent dark:hover:text-accent-light transition-colors duration-150 block w-full py-1"
            >
              Explore
            </Link>

            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-accent dark:hover:text-accent-light transition-colors duration-150 block w-full py-1"
            >
              About
            </Link>

            <button
              type="button"
              onClick={() => {
                onToggle()
                setIsMobileMenuOpen(false)
              }}
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-accent dark:hover:text-accent-light transition-colors duration-150 block w-full text-left cursor-pointer py-1"
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
                    className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 text-left w-full cursor-pointer disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-glass-pill text-sm text-center font-medium px-4 py-2.5 rounded-full block w-full cursor-pointer"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-3d-pill text-sm text-center font-bold px-4 py-2.5 rounded-full block w-full cursor-pointer"
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
