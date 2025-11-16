'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type AnalyticsData = {
  totalIssues: number
  openIssues: number
  underReviewIssues: number
  inProgressIssues: number
  completedIssues: number
  closedIssues: number
  totalVotes: number
  totalComments: number
  avgVotesPerIssue: number
  avgCommentsPerIssue: number
  topCategories: { category: string; count: number }[]
  topCities: { city: string; count: number }[]
  recentActivity: {
    newIssuesThisWeek: number
    newIssuesThisMonth: number
    resolvedThisWeek: number
    resolvedThisMonth: number
  }
  issuesByStatus: { status: string; count: number }[]
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      // Fetch all issues
      const { data: issues } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false })

      if (!issues) {
        setLoading(false)
        return
      }

      // Calculate date ranges
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Basic counts
      const totalIssues = issues.length
      const openIssues = issues.filter(i => i.status === 'Open').length
      const underReviewIssues = issues.filter(i => i.status === 'Under Review').length
      const inProgressIssues = issues.filter(i => i.status === 'In Progress').length
      const completedIssues = issues.filter(i => i.status === 'Completed').length
      const closedIssues = issues.filter(i => i.status === 'Closed').length

      // Vote and comment totals
      const totalVotes = issues.reduce((sum, i) => sum + (i.vote_count || 0), 0)
      const totalComments = issues.reduce((sum, i) => sum + (i.comment_count || 0), 0)

      // Averages
      const avgVotesPerIssue = totalIssues > 0 ? Math.round(totalVotes / totalIssues) : 0
      const avgCommentsPerIssue = totalIssues > 0 ? Math.round(totalComments / totalIssues) : 0

      // Top categories
      const categoryCounts: Record<string, number> = {}
      issues.forEach(issue => {
        const cat = issue.category || 'Uncategorized'
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      })
      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Top cities
      const cityCounts: Record<string, number> = {}
      issues.forEach(issue => {
        cityCounts[issue.city] = (cityCounts[issue.city] || 0) + 1
      })
      const topCities = Object.entries(cityCounts)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Recent activity
      const newIssuesThisWeek = issues.filter(
        i => new Date(i.created_at) >= oneWeekAgo
      ).length
      const newIssuesThisMonth = issues.filter(
        i => new Date(i.created_at) >= oneMonthAgo
      ).length

      const resolvedThisWeek = issues.filter(
        i => (i.status === 'Completed' || i.status === 'Closed') && 
             new Date(i.updated_at || i.created_at) >= oneWeekAgo
      ).length
      const resolvedThisMonth = issues.filter(
        i => (i.status === 'Completed' || i.status === 'Closed') && 
             new Date(i.updated_at || i.created_at) >= oneMonthAgo
      ).length

      // Issues by status for chart
      const issuesByStatus = [
        { status: 'Open', count: openIssues },
        { status: 'Under Review', count: underReviewIssues },
        { status: 'In Progress', count: inProgressIssues },
        { status: 'Completed', count: completedIssues },
        { status: 'Closed', count: closedIssues },
      ].filter(s => s.count > 0)

      setAnalytics({
        totalIssues,
        openIssues,
        underReviewIssues,
        inProgressIssues,
        completedIssues,
        closedIssues,
        totalVotes,
        totalComments,
        avgVotesPerIssue,
        avgCommentsPerIssue,
        topCategories,
        topCities,
        recentActivity: {
          newIssuesThisWeek,
          newIssuesThisMonth,
          resolvedThisWeek,
          resolvedThisMonth,
        },
        issuesByStatus,
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-gray-500">
        Unable to load analytics data
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Issues */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Issues</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalIssues}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Open Issues */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Issues</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{analytics.openIssues}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Votes */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{analytics.totalVotes}</p>
              <p className="text-sm text-gray-500 mt-1">Avg: {analytics.avgVotesPerIssue}/issue</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Comments */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Comments</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{analytics.totalComments}</p>
              <p className="text-sm text-gray-500 mt-1">Avg: {analytics.avgCommentsPerIssue}/issue</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Status</h3>
        <div className="space-y-3">
          {analytics.issuesByStatus.map((item) => {
            const percentage = ((item.count / analytics.totalIssues) * 100).toFixed(1)
            const colors: Record<string, string> = {
              'Open': 'bg-green-500',
              'Under Review': 'bg-yellow-500',
              'In Progress': 'bg-blue-500',
              'Completed': 'bg-purple-500',
              'Closed': 'bg-gray-500',
            }
            
            return (
              <div key={item.status}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.status}</span>
                  <span className="text-sm text-gray-600">{item.count} ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${colors[item.status]} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {analytics.topCategories.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                </div>
                <span className="text-sm text-gray-600 font-semibold">{item.count} issues</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Cities</h3>
          <div className="space-y-3">
            {analytics.topCities.map((item, index) => (
              <div key={item.city} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{item.city}</span>
                </div>
                <span className="text-sm text-gray-600 font-semibold">{item.count} issues</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">New This Week</p>
            <p className="text-2xl font-bold text-blue-600">{analytics.recentActivity.newIssuesThisWeek}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">New This Month</p>
            <p className="text-2xl font-bold text-blue-600">{analytics.recentActivity.newIssuesThisMonth}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Resolved This Week</p>
            <p className="text-2xl font-bold text-green-600">{analytics.recentActivity.resolvedThisWeek}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Resolved This Month</p>
            <p className="text-2xl font-bold text-green-600">{analytics.recentActivity.resolvedThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>
    </div>
  )
}