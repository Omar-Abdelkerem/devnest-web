/**
 * RegisterPage.jsx
 *
 * Centered form for user registration with clean error handling.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { apiFetch } from '../lib/api'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      })

      if (response.ok) {
        window.location.href = '/'
      } else {
        let errorMessage = 'Registration failed.'
        try {
          const rawText = await response.text()
          if (rawText) {
            try {
              const data = JSON.parse(rawText)
              errorMessage = data.message || data.error?.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data))
            } catch {
              errorMessage = rawText
            }
          } else {
            errorMessage = response.statusText || `HTTP ${response.status}`
          }
        } catch {
          errorMessage = `Connection error (HTTP ${response.status})`
        }

        if (!errorMessage || errorMessage === 'null' || errorMessage === '{}') {
          errorMessage = `Registration rejected by server (HTTP ${response.status})`
        }

        // Removed the "Backend says:" debugging prefix!
        setError(errorMessage)
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Could not connect to the server. Check if your backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text" id="username" name="username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-gray-900 dark:text-gray-100 transition-shadow"
              placeholder="e.g. maren-k"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email address</label>
            <input
              type="email" id="email" name="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-gray-900 dark:text-gray-100 transition-shadow"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password" id="password" name="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-gray-900 dark:text-gray-100 transition-shadow"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="min-h-6 text-sm text-red-600 dark:text-red-400 empty:hidden font-mono text-xs break-words">
            {error}
          </div>

          <button
            type="submit" disabled={isLoading}
            className="w-full bg-accent hover:bg-accent-light text-white font-semibold text-sm px-4 py-2.5 rounded-md transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 border border-transparent border-t-gray-200 dark:border-t-neutral-800 pt-6">
        Already have an account? <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
      </div>
    </AuthLayout>
  )
}