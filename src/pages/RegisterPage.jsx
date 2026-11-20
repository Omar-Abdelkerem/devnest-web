import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
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
      <div className="glass-panel rounded-xl p-8">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Create your account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3.5 py-2 glass-input rounded-lg text-sm"
              placeholder="e.g. omar-dev"
              required
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3.5 py-2 glass-input rounded-lg text-sm"
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
            className="btn-3d-pill w-full font-semibold text-sm px-4 py-2.5 rounded-lg mt-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-accent dark:text-accent-light hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  )
}
