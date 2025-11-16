import AdminLoginForm from '@/components/admin/AdminLoginForm'
import Link from 'next/link'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/landing" className="flex justify-center items-center gap-3 mb-6">
            <img 
              src="/Logo.png" 
              alt="People's Voice Logo" 
              className="w-16 h-16 object-contain"
            />
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">PEOPLE&apos;S</div>
              <div className="text-2xl font-bold text-gray-900">VOICE</div>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            City Official Login
          </h2>
          <p className="text-gray-600">
            Access your admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <AdminLoginForm />

          {/* Signup Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an admin account?{' '}
            <Link href="/admin/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </div>

          {/* Regular User Link */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Not a city official?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Citizen login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}