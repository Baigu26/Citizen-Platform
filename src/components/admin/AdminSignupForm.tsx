'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminSignup } from '@/app/actions/admin-actions'

const MA_CITIES = [
  'Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton',
  'Quincy', 'Lynn', 'New Bedford', 'Fall River', 'Newton', 'Somerville',
  'Framingham', 'Lawrence', 'Waltham', 'Haverhill', 'Malden', 'Brookline',
  'Plymouth', 'Medford', 'Taunton', 'Chicopee', 'Weymouth', 'Revere',
  'Peabody', 'Methuen', 'Barnstable', 'Pittsfield', 'Attleboro', 'Arlington',
  'Everett', 'Salem', 'Westfield', 'Leominster', 'Fitchburg', 'Beverly',
  'Holyoke', 'Marlborough', 'Woburn', 'Chelsea', 'Amherst', 'Braintree',
  'Shrewsbury', 'Dartmouth', 'Billerica', 'Randolph', 'Tewksbury', 'Natick',
  'Northampton', 'Gloucester', 'Franklin', 'Watertown', 'Needham', 'Chelmsford',
].sort()

export default function AdminSignupForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    admin_city: '',
    title: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validation
    if (!formData.email.trim() || !formData.password || !formData.full_name.trim() || !formData.admin_city) {
      setError('All required fields must be filled')
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsSubmitting(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    try {
      const result = await adminSignup({
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        admin_city: formData.admin_city,
        title: formData.title.trim(),
      })

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Success! Redirect to dashboard
      router.push('/admin/dashboard')
      router.refresh()

    } catch (err) {
      console.error('Error:', err)
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
          Official Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="official@cityname.gov"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="John Smith"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title/Position
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="City Council Member, Mayor, etc."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* City */}
      <div>
        <label htmlFor="admin_city" className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-red-500">*</span>
        </label>
        <select
          id="admin_city"
          name="admin_city"
          value={formData.admin_city}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="">Select your city</option>
          {MA_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
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
          placeholder="At least 8 characters"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating Account...' : 'Create Admin Account'}
      </button>

      {/* Notice */}
      <p className="text-xs text-gray-500 text-center">
        By creating an admin account, you confirm you are an authorized city official.
      </p>
    </form>
  )
}