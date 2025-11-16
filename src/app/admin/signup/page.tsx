import AdminSignupForm from '@/components/admin/AdminSignupForm'
import Link from 'next/link'

export default function AdminSignupPage() {
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
            City Official Signup
          </h2>
          <p className="text-gray-600">
            Create an account to manage your city&apos;s issues
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <AdminSignupForm />

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an admin account?{' '}
            <Link href="/admin/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Log in
            </Link>
          </div>

          {/* Regular User Link */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Not a city official?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Create citizen account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}