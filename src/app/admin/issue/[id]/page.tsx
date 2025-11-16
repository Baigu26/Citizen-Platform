import { getCurrentUser } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AdminNav from '@/components/admin/AdminNav'
import AdminIssueActions from '@/components/admin/AdminIssueActions'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function AdminIssueDetailPage({ params }: PageProps) {
  const currentUser = await getCurrentUser()
  const { id } = await params

  // Check if user is logged in and is admin
  if (!currentUser) {
    redirect('/admin/login')
  }

  if (!currentUser.profile.is_admin) {
    redirect('/landing')
  }

  // Fetch the issue
  const { data: issue, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !issue) {
    notFound()
  }

  // Verify issue is from admin's city
  if (issue.city !== currentUser.profile.admin_city) {
    redirect('/admin/dashboard')
  }

  // Get comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('issue_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Link - FIXED */}
        <Link 
          href="/admin/dashboard" 
          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Issue Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 flex-1">
                  {issue.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ml-4 flex-shrink-0 ${
                  issue.status === 'Open' ? 'bg-green-100 text-green-700' :
                  issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                  issue.status === 'Completed' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {issue.status}
                </span>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {issue.city}
                </span>
                {issue.zip_code && <span>{issue.zip_code}</span>}
                {issue.category && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                    {issue.category}
                  </span>
                )}
                <span>Posted {new Date(issue.created_at).toLocaleDateString()}</span>
                {issue.author_name && <span>by {issue.author_name}</span>}
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="font-semibold text-gray-900">{issue.vote_count}</span>
                  <span className="text-gray-600">votes</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-semibold text-gray-900">{issue.comment_count}</span>
                  <span className="text-gray-600">comments</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {issue.description}
                </p>
              </div>

              {/* Image if exists */}
              {issue.image_url && (
                <div className="mb-6">
                  <Image 
                    src={issue.image_url} 
                    alt={issue.title}
                    width={800}
                    height={600}
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              )}

              {/* Official Response (if exists) */}
              {issue.official_response && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">Official Response</h3>
                      <p className="text-blue-800 text-sm mb-2 whitespace-pre-wrap">
                        {issue.official_response}
                      </p>
                      <div className="text-xs text-blue-600">
                        {issue.responded_by && <span>By {issue.responded_by}</span>}
                        {issue.official_response_date && (
                          <span> • {new Date(issue.official_response_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Comments ({comments?.length || 0})
              </h2>

              {comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author_name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              )}
            </div>
          </div>

          {/* Right Column - Admin Actions */}
          <div className="lg:col-span-1">
            <AdminIssueActions 
              issue={issue} 
              adminName={currentUser.profile.full_name || 'City Official'}
            />
          </div>
        </div>
      </main>
    </div>
  )
}