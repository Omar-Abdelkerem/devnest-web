import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { useState } from 'react'

export default function Navbar({ theme, onToggle }) {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await apiFetch('/api/v1/auth/logout', { method: 'POST' })
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#111111] border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        
        <Link to={user ? "/welcome" : "/"} className="flex items-center shrink-0 font-bold text-lg tracking-tight cursor-pointer">
          <span className="text-white">Dev</span>
          <span className="text-accent ml-1">Nest</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/explore" className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-150">
            Find
          </Link>

          <button onClick={onToggle} className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-150 pl-6 border-l border-white/10 cursor-pointer">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {user ? (
            <div className="flex items-center gap-5 pl-6 border-l border-white/10">
              <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-150">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center text-xs font-bold text-accent border border-accent/30">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.username ? user.username.substring(0, 2).toUpperCase() : 'U'
                  )}
                </div>
                <span className="font-semibold">{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors duration-150 cursor-pointer">
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <Link to="/login" className="text-sm text-white font-medium px-4 py-1.5 rounded-md border border-white/20 hover:border-white/40 transition-colors duration-150 cursor-pointer">Sign in</Link>
              <Link to="/register" className="text-sm text-white font-bold px-4 py-1.5 rounded-md bg-accent hover:bg-accent-light transition-colors duration-150 cursor-pointer">Get started</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-400 hover:text-white focus:outline-none cursor-pointer p-2 -mr-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden bg-[#111111] border-t border-white/5 px-6 py-4 flex flex-col gap-4 shadow-lg absolute w-full left-0 top-14">
          <Link to="/explore" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-150 block w-full">
            Find
          </Link>
          
          <button onClick={() => { onToggle(); setIsMobileMenuOpen(false); }} className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-150 block w-full text-left cursor-pointer">
            Theme: {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          
          <div className="border-t border-white/10 pt-4 mt-2">
            {user ? (
              <div className="flex flex-col gap-4">
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors duration-150">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center text-sm font-bold text-accent border border-accent/30">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.username ? user.username.substring(0, 2).toUpperCase() : 'U'
                    )}
                  </div>
                  <span className="font-semibold">{user.username}</span>
                </Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors duration-150 text-left w-full cursor-pointer">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-center text-white font-medium px-4 py-2 rounded-md border border-white/20 hover:border-white/40 transition-colors duration-150 block w-full cursor-pointer">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-center text-white font-bold px-4 py-2 rounded-md bg-accent hover:bg-accent-light transition-colors duration-150 block w-full cursor-pointer">
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