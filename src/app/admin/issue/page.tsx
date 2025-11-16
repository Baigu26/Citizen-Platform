import { getCurrentUser } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import { Issue } from '@/lib/supabase'

type PageProps = {
  searchParams: Promise<{
    status?: string
  }>
}

export default async function AdminIssuesPage({ searchParams }: PageProps) {
  const currentUser = await getCurrentUser()
  const { status: filterStatus } = await searchParams

  // Check if user is logged in and is admin
  if (!currentUser) {
    redirect('/admin/login')
  }

  if (!currentUser.profile.is_admin) {
    redirect('/landing')
  }

  const adminCity = currentUser.profile.admin_city

  // Build query
  let query = supabase
    .from('issues')
    .select('*')
    .eq('city', adminCity)
    .order('created_at', { ascending: false })

  // Filter by status if provided
  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus)
  }

  const { data: issues } = await query

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Issues</h1>
          <p className="text-gray-600 mt-2">
            Manage all issues in {adminCity}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <Link
              href="/admin/issue"
              className={`px-6 py-3 font-medium transition-colors ${
                !filterStatus || filterStatus === 'all'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({issues?.length || 0})
            </Link>
            <Link
              href="/admin/issue?status=Open"
              className={`px-6 py-3 font-medium transition-colors ${
                filterStatus === 'Open'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Open ({issues?.filter(i => i.status === 'Open').length || 0})
            </Link>
            <Link
              href="/admin/issue?status=In Progress"
              className={`px-6 py-3 font-medium transition-colors ${
                filterStatus === 'In Progress'
                  ? 'border-b-2 border-yellow-600 text-yellow-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              In Progress ({issues?.filter(i => i.status === 'In Progress').length || 0})
            </Link>
            <Link
              href="/admin/issue?status=Completed"
              className={`px-6 py-3 font-medium transition-colors ${
                filterStatus === 'Completed'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({issues?.filter(i => i.status === 'Completed').length || 0})
            </Link>
          </div>
        </div>

        {/* Issues List */}
        {issues && issues.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            {issues.map((issue: Issue) => (
              <Link
                key={issue.id}
                href={`/admin/issue/${issue.id}`}
                className="block px-6 py-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {issue.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        issue.status === 'Open' ? 'bg-green-100 text-green-700' :
                        issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                        issue.status === 'Completed' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {issue.status}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {issue.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {issue.vote_count} votes
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {issue.comment_count} comments
                      </span>
                      <span>Posted {new Date(issue.created_at).toLocaleDateString()}</span>
                      {issue.author_name && <span>by {issue.author_name}</span>}
                    </div>

                    {issue.official_response && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Official response provided
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Issues Found
            </h3>
            <p className="text-gray-600">
              {filterStatus ? `No ${filterStatus.toLowerCase()} issues in ${adminCity}` : `No issues yet in ${adminCity}`}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}