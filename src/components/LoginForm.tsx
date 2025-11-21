'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { requestOTP, verifyOTP } from '@/app/actions/auth-actions'

export default function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await requestOTP(email)

    if (result.success) {
      setStep('code')
      setResendCooldown(60)
      
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setError(result.error || 'Failed to send verification code')
    }

    setLoading(false)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await verifyOTP(email, code)

    if (result.success) {
      router.push('/')
      router.refresh()
    } else {
      setError(result.error || 'Invalid verification code')
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    
    setError('')
    setLoading(true)
    setCode('')

    const result = await requestOTP(email)

    if (result.success) {
      setResendCooldown(60)
      
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setError(result.error || 'Failed to send verification code')
    }

    setLoading(false)
  }

  const handleBackToEmail = () => {
    setStep('email')
    setCode('')
    setError('')
  }

  if (step === 'email') {
    return (
      <form onSubmit={handleRequestCode} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none text-gray-900"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {loading ? 'Sending Code...' : 'Send Verification Code'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          You'll receive a one-time verification code via email to sign in securely.
        </p>
      </form>
    )
  }

  return (
    <div>
      <button
        onClick={handleBackToEmail}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Verification Code</h3>
        <p className="text-sm text-gray-600">
          We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerifyCode} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none text-gray-900 text-center text-2xl tracking-widest font-mono"
            placeholder="000000"
            disabled={loading}
            autoComplete="one-time-code"
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify and Sign In'}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            {resendCooldown > 0 ? (
              <span className="text-gray-400">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="font-medium text-blue-900 hover:text-blue-800 disabled:opacity-50"
              >
                Resend code
              </button>
            )}
          </p>
        </div>

        <p className="text-xs text-gray-500 text-center">
          The code expires in 10 minutes. Check your spam folder if you don't see it.
        </p>
      </form>
    </div>
  )
}