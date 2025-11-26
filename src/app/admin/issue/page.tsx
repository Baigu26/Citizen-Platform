'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import BulkActions from '@/components/admin/BulkActions'
import { supabase } from '@/lib/supabase'

type Issue = {
  id: string
  title: string
  description: string
  status: string
  category: string
  city: string
  vote_count: number
  comment_count: number
  created_at: string
  author_name: string | null
  official_response: string | null
}

type CurrentUser = {
  user: {
    id: string
    email?: string
  }
  profile: {
    id: string
    full_name: string | null
    admin_city: string | null
    is_admin: boolean
  }
}

function AdminIssuesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterStatus = searchParams.get('status')
  const searchQuery = searchParams.get('search')
  
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [adminCity, setAdminCity] = useState<string>('')

  useEffect(() => {
    fetchCurrentUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (adminCity) {
      fetchIssues()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminCity, filterStatus, searchQuery])

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/admin/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/landing')
        return
      }

      setCurrentUser({ user, profile })
      setAdminCity(profile.admin_city || profile.city || '')
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/admin/login')
    }
  }

  const fetchIssues = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('issues')
        .select('*')
        .eq('city', adminCity)

      // Apply status filter
      if (filterStatus && filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      // Apply search filter
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setIssues(data || [])
    } catch (error) {
      console.error('Error fetching issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIssues(issues.map(issue => issue.id))
    } else {
      setSelectedIssues([])
    }
  }

  const handleSelectIssue = (issueId: string, checked: boolean) => {
    if (checked) {
      setSelectedIssues(prev => [...prev, issueId])
    } else {
      setSelectedIssues(prev => prev.filter(id => id !== issueId))
    }
  }

  const handleClearSelection = () => {
    setSelectedIssues([])
  }

  const handleRefresh = () => {
    fetchIssues()
    setSelectedIssues([])
  }

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    router.push(`/admin/issue?${params.toString()}`)
  }

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Issues</h1>
              <p className="text-gray-600 mt-2">
                Manage all issues in {adminCity}
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Search Info Banner */}
        {searchQuery && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-blue-900 font-medium">
                Showing results for &quot;{searchQuery}&quot;
              </span>
              <span className="text-blue-700">
                ({issues.length} {issues.length === 1 ? 'result' : 'results'})
              </span>
            </div>
            <button
              onClick={clearSearch}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              Clear search
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <Link
              href={`/admin/issue${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
              className={`px-6 py-3 font-medium transition-colors ${
                !filterStatus || filterStatus === 'all'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({issues.length})
            </Link>
            <Link
              href={`/admin/issue?status=Open${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
              className={`px-6 py-3 font-medium transition-colors ${
                filterStatus === 'Open'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Open ({issues.filter(i => i.status === 'Open').length})
            </Link>
            <Link
              href={`/admin/issue?status=In Progress${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
              className={`px-6 py-3 font-medium transition-colors ${
                filterStatus === 'In Progress'
                  ? 'border-b-2 border-yellow-600 text-yellow-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              In Progress ({issues.filter(i => i.status === 'In Progress').length})
            </Link>
            <Link
              href={`/admin/issue?status=Completed${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
              className={`px-6 py-3 font-medium transition-colors ${
                filterStatus === 'Completed'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({issues.filter(i => i.status === 'Completed').length})
            </Link>
          </div>
        </div>

        {/* Issues List with Checkboxes */}
        {issues.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Select All Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedIssues.length === issues.length && issues.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({selectedIssues.length} selected)
                </span>
              </div>
            </div>

            {/* Issues */}
            <div className="divide-y divide-gray-200">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`px-6 py-5 hover:bg-gray-50 transition-colors ${
                    selectedIssues.includes(issue.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIssues.includes(issue.id)}
                      onChange={(e) => handleSelectIssue(issue.id, e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Issue Content */}
                    <Link
                      href={`/admin/issue/${issue.id}`}
                      className="flex-1 block"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
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
                        {issue.description.replace(/\*\*Why it matters:\*\*\s*/gi, '')}
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
                        {issue.official_response && (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Responded
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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
              {searchQuery 
                ? `No results found for "${searchQuery}"` 
                : filterStatus 
                  ? `No ${filterStatus.toLowerCase()} issues in ${adminCity}` 
                  : `No issues yet in ${adminCity}`
              }
            </p>
          </div>
        )}
      </main>

      {/* Bulk Actions Bar */}
      <BulkActions
        selectedIssues={selectedIssues}
        onClearSelection={handleClearSelection}
        onRefresh={handleRefresh}
      />
    </div>
  )
}

export default function AdminIssuesPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AdminIssuesPage />
    </Suspense>
  )
}