import LoginForm from '@/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
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
          <h1 className="text-3xl font-bold mt-2">Welcome Back</h1>
          <p className="text-cyan-100 mt-1">Log in to your People's Voice account</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <LoginForm />
          
          {/* Signup Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-cyan-600 hover:text-cyan-700 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}