import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
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
      <div className="glass-panel rounded-xl p-8">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sign in to DevNest
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3.5 py-2 glass-input rounded-lg text-sm"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3.5 py-2 glass-input rounded-lg text-sm"
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
            className="btn-3d-pill w-full font-semibold text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-accent dark:text-accent-light hover:underline font-medium">
          Register
        </Link>
      </div>
    </AuthLayout>
  )
}
