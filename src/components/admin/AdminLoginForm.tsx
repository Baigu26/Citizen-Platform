'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin } from '@/app/actions/admin-actions'

export default function AdminLoginForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      console.log('🔐 Admin login form: Starting login...')
      
      const result = await adminLogin(formData.email.trim(), formData.password)

      console.log('🔐 Admin login form: Result:', result)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      console.log('✅ Admin login form: Success! Redirecting...')
      
      // Wait a tiny bit for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Force a hard refresh to the dashboard to pick up the new session
      window.location.href = '/admin/dashboard'

    } catch (err) {
      console.error('❌ Admin login form: Error:', err)
      setError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="official@cityname.gov"
          required
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}