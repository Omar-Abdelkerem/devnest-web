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
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Sign in to DevNest
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-gray-900 dark:text-gray-100 transition-shadow"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-gray-900 dark:text-gray-100 transition-shadow"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div role="alert" className="text-red-600 dark:text-red-400 font-mono text-xs break-words">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password}
            className="w-full bg-accent hover:bg-accent-light text-white font-semibold text-sm px-4 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-neutral-800 pt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-accent dark:text-accent-light hover:underline font-medium">
          Register
        </Link>
      </div>
    </AuthLayout>
  )
}
