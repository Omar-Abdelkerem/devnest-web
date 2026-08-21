/**
 * SignInPage.jsx
 *
 * Centered form for user login. Features standard DevNest styling,
 * utilizing the AuthLayout for positioning.
 */

import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'

export default function SignInPage() {
  return (
    <AuthLayout>
      {/* ── Form Card ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Sign in to DevNest
          </h1>
        </div>

        <form className="flex flex-col gap-5">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label 
              htmlFor="email" 
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-gray-900 dark:text-gray-100 transition-shadow"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="password" 
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <a href="#" className="text-xs font-medium text-accent hover:underline">
                Forgot password?
              </a>
            </div>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-gray-900 dark:text-gray-100 transition-shadow"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Error message placeholder */}
          <div className="h-6 -my-1 text-sm text-red-600 dark:text-red-400 empty:hidden">
            {/* "Invalid email or password" would go here */}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent-light text-white font-semibold text-sm px-4 py-2.5 rounded-md transition-colors"
          >
            Sign in
          </button>
        </form>

      </div>

      {/* ── Footer Link ────────────────────────────────────────── */}
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 border border-transparent border-t-gray-200 dark:border-t-neutral-800 pt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent hover:underline font-medium">
          Register
        </Link>
      </div>
    </AuthLayout>
  )
}
