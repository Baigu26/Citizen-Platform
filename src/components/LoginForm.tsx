'use client'

import { useState } from 'react'
import { login } from '@/app/login/actions'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
    // If successful, the server action will redirect
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Logging In...' : 'Log In'}
      </button>

      {/* Forgot Password Link */}
      <div className="text-center">
        <button
          type="button"
          className="text-sm text-cyan-600 hover:text-cyan-700"
          onClick={() => alert('Password reset feature coming soon!')}
        >
          Forgot your password?
        </button>
      </div>
    </form>
  )
}