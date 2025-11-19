import LoginForm from '@/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center justify-center gap-3">
            <img 
              src="/Logo.png" 
              alt="Poeple&apos;s Voice Logo" 
              className="w-12 h-12 object-contain"
            />
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900">PEOPLE&apos;S</div>
              <div className="text-lg font-bold text-gray-900">VOICE</div>
            </div>
          </Link>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-8 py-3">
            <Link href="/" className="hover:text-gray-200 transition-colors">
              Home
            </Link>
            <Link href="/about" className="hover:text-gray-200 transition-colors">
              About
            </Link>
            <Link href="/town-selection" className="hover:text-gray-200 transition-colors">
              Towns
            </Link>
            <Link href="/trending" className="hover:text-gray-200 transition-colors">
              Trending
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Log in to your People&apos;s Voice account
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <LoginForm />
          
          {/* Signup Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}