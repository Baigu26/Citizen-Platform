import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase-server'
import AdminNav from '@/components/admin/AdminNav'
import AdminAnalytics from '@/components/admin/AdminAnalytics'
import Link from 'next/link'

export default async function AdminDashboard() {
  const currentUser = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!currentUser) {
    redirect('/admin/login')
  }

  // Check if user is admin
  if (!currentUser.profile?.is_admin) {
    redirect('/landing')
  }

  const adminCity = currentUser.profile.admin_city || 'Unknown'
  const adminName = currentUser.profile.full_name || 'Admin'

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {adminName}! Here&apos;s what&apos;s happening in {adminCity}.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/admin/issue"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View All Issues</h3>
                <p className="text-sm text-gray-600">Manage community issues</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/issue?status=Open"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Open Issues</h3>
                <p className="text-sm text-gray-600">Needs attention</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/issue"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Needs Response</h3>
                <p className="text-sm text-gray-600">Awaiting official reply</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
          </div>

          {/* Analytics Component */}
          <AdminAnalytics />
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Quick Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Respond to high-vote issues first to maximize community engagement</li>
                <li>• Update issue status regularly to keep citizens informed</li>
                <li>• Use the search and filter tools to find specific issues quickly</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}