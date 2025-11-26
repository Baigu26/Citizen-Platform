'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import AdminSearchBar from '@/components/admin/AdminSearchBar'
import { supabase } from '@/lib/supabase'

type Issue = {
  id: string
  title: string
  description: string
  status: string
  city: string
  vote_count: number
  comment_count: number
  created_at: string
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

export default function AdminDashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [adminCity, setAdminCity] = useState<string>('')
  const [loading, setLoading] = useState(true)
  
  // Stats
  const [allIssues, setAllIssues] = useState<Issue[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [totalComments, setTotalComments] = useState(0)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (adminCity) {
      fetchStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminCity])

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/admin/login')
        return
      }

      const { data: profile } = await supabase
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

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Fetch all issues for this city
      const { data: issues } = await supabase
        .from('issues')
        .select('*')
        .eq('city', adminCity)

      if (issues) {
        setAllIssues(issues)
        setOpenCount(issues.filter(i => i.status === 'Open').length)
        setInProgressCount(issues.filter(i => i.status === 'In Progress').length)
        setCompletedCount(issues.filter(i => i.status === 'Completed').length)
        setTotalVotes(issues.reduce((sum, issue) => sum + (issue.vote_count || 0), 0))
        setTotalComments(issues.reduce((sum, issue) => sum + (issue.comment_count || 0), 0))
      }

      // Fetch recent issues
      const { data: recent } = await supabase
        .from('issues')
        .select('*')
        .eq('city', adminCity)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recent) {
        setRecentIssues(recent)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Managing issues for <span className="font-semibold">{adminCity}</span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <AdminSearchBar adminCity={adminCity} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Issues */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {allIssues.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Open Issues */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {openCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {inProgressCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {completedCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Votes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Engagement</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Votes</span>
                <span className="text-2xl font-bold text-blue-600">{totalVotes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Comments</span>
                <span className="text-2xl font-bold text-blue-600">{totalComments}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/admin/issue"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold text-center transition-colors"
              >
                View All Issues
              </Link>
              <Link
                href="/admin/issue?status=Open"
                className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold text-center transition-colors"
              >
                Review Open Issues
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Issues</h3>
              <Link
                href="/admin/issue"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All →
              </Link>
            </div>
          </div>

          {recentIssues.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/admin/issue/${issue.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {issue.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {issue.description.replace(/\*\*Why it matters:\*\*\s*/gi, '')}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{issue.vote_count} votes</span>
                        <span>•</span>
                        <span>{issue.comment_count} comments</span>
                        <span>•</span>
                        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 flex-shrink-0 ${
                      issue.status === 'Open' ? 'bg-green-100 text-green-700' :
                      issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                      issue.status === 'Completed' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <p>No issues yet in {adminCity}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}