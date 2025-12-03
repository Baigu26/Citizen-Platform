'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Report = {
  id: string
  reason: string
  description: string | null
  status: string
  admin_notes: string | null
  created_at: string
  issues: {
    id: string
    title: string
    description: string
    city: string
    user_id: string
    author_name: string | null
    status: string
  } | null
}

type ReportsListProps = {
  initialReports: Report[]
  adminId: string
  adminCity: string
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam or misleading',
  harassment: 'Harassment or bullying',
  violence: 'Violence or threats',
  misinformation: 'Misinformation',
  inappropriate: 'Inappropriate content',
  other: 'Other',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  dismissed: 'bg-gray-100 text-gray-700',
  action_taken: 'bg-green-100 text-green-700',
}

export default function ReportsList({ initialReports, adminId, adminCity }: ReportsListProps) {
  const router = useRouter()
  const [reports, setReports] = useState(initialReports)
  const [filter, setFilter] = useState<string>('all')
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.status === filter)

  const handleUpdateStatus = async (reportId: string, status: string, adminNotes?: string) => {
    setActionLoading(reportId)
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status, adminNotes }),
      })

      if (response.ok) {
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, status, admin_notes: adminNotes || r.admin_notes } : r
        ))
      }
    } catch (error) {
      console.error('Error updating report:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspendUser = async (userId: string, reason: string) => {
    if (!confirm('Are you sure you want to suspend this user? They will not be able to post or comment.')) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch('/api/admin/suspend-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason, action: 'suspend' }),
      })

      if (response.ok) {
        alert('User has been suspended')
        router.refresh()
      }
    } catch (error) {
      console.error('Error suspending user:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteIssue = async (issueId: string, reportId: string) => {
    if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return
    }

    setActionLoading(issueId)
    try {
      const response = await fetch('/api/admin/delete-issue', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId }),
      })

      if (response.ok) {
        await handleUpdateStatus(reportId, 'action_taken', 'Issue deleted')
        setReports(prev => prev.filter(r => r.issues?.id !== issueId))
      }
    } catch (error) {
      console.error('Error deleting issue:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'reviewed', 'action_taken', 'dismissed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            {status === 'pending' && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {reports.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reports */}
      {filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Report Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-red-600 font-medium">
                        {REASON_LABELS[report.reason] || report.reason}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {report.issues?.title || 'Deleted Issue'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Reported {formatDate(report.created_at)} • Posted by {report.issues?.author_name || 'Unknown'}
                    </p>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedReport === report.id ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedReport === report.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {/* Issue Content */}
                  {report.issues && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Issue Content:</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-700 text-sm line-clamp-4">
                          {report.issues.description}
                        </p>
                        <Link
                          href={`/admin/issue/${report.issues.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                        >
                          View Full Issue →
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Report Description */}
                  {report.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Reporter&apos;s Notes:</h4>
                      <p className="text-gray-600 text-sm bg-white border border-gray-200 rounded-lg p-3">
                        {report.description}
                      </p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {report.admin_notes && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Admin Notes:</h4>
                      <p className="text-gray-600 text-sm bg-blue-50 border border-blue-200 rounded-lg p-3">
                        {report.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {report.status === 'pending' && report.issues && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                        disabled={actionLoading === report.id}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        Dismiss Report
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'reviewed', 'Reviewed, monitoring')}
                        disabled={actionLoading === report.id}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        Mark as Reviewed
                      </button>
                      <button
                        onClick={() => handleDeleteIssue(report.issues!.id, report.id)}
                        disabled={actionLoading === report.issues.id}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        Delete Issue
                      </button>
                      <button
                        onClick={() => handleSuspendUser(report.issues!.user_id, `Report: ${report.reason}`)}
                        disabled={actionLoading === report.issues.user_id}
                        className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        Suspend User
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No content has been reported in your city yet.'
              : `No ${filter.replace('_', ' ')} reports.`}
          </p>
        </div>
      )}
    </div>
  )
}