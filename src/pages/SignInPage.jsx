import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import GlassIconTile from '../components/GlassIconTile'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, parseApiError } from '../lib/api'

export default function SignInPage() {
  useDocumentTitle('Sign In', 'Sign in to your DevNest developer portfolio account.')
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return
    setError('')
    setIsLoading(true)

    try {
      const response = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (response.ok) {
        const data = await response.json()
        const loggedInUser = data.user || data.data?.user || data
        setUser(loggedInUser)
        navigate(loggedInUser?.username ? `/${loggedInUser.username}` : '/', { replace: true })
      } else {
        const fallback =
          response.status === 401
            ? 'Invalid email or password.'
            : `Sign in failed (HTTP ${response.status}).`
        const { message } = await parseApiError(response, fallback)
        setError(message)
      }
    } catch {
      setError('Could not connect to the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent-light/65 to-transparent"
        />

        <div className="flex flex-col items-center text-center mb-8">
          <GlassIconTile size="lg" accent={true} className="mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </GlassIconTile>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign in to DevNest
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
            Access your engineering portfolio workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3.5 py-2.5 glass-input rounded-xl text-sm"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3.5 py-2.5 glass-input rounded-xl text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div role="alert" className="text-rose-500 font-mono text-xs break-words">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password}
            className="btn-3d-pill w-full font-bold text-sm px-4 py-3 rounded-full mt-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-accent dark:text-accent-light hover:underline font-semibold">
          Claim your profile
        </Link>
      </div>
    </AuthLayout>
  )
}
