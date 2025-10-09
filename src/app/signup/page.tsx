import SignupForm from '@/components/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-cyan-600 text-white py-6 shadow-lg">
        <div className="max-w-md mx-auto px-4">
          <Link href="/" className="text-cyan-100 hover:text-white mb-2 inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold mt-2">Create Account</h1>
          <p className="text-cyan-100 mt-1">Join your community and make your voice heard</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <SignupForm />
          
          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">
              Log in
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}