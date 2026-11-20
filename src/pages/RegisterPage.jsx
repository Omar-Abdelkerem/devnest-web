import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import GlassIconTile from '../components/GlassIconTile'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, parseApiError } from '../lib/api'

export default function RegisterPage() {
  useDocumentTitle('Create Account', 'Create your free DevNest developer portfolio.')
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
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
      const response = await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newUser = data.user || data.data?.user || data
        setUser(newUser)
        navigate(newUser?.username ? `/${newUser.username}` : '/', { replace: true })
      } else {
        const { message } = await parseApiError(response, 'Registration failed. Please check your details.')
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </GlassIconTile>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Claim your DevNest profile
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
            Showcase projects, live links, and your core stack
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3.5 py-2.5 glass-input rounded-xl text-sm"
              placeholder="e.g. omar-dev"
              required
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3.5 py-2.5 glass-input rounded-xl text-sm"
              placeholder="6 to 20 characters"
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
            disabled={isLoading || !username.trim() || !email.trim() || !password}
            className="btn-3d-pill w-full font-bold text-sm px-4 py-3 rounded-full mt-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-accent dark:text-accent-light hover:underline font-semibold">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  )
}
