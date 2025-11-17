'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Issue } from '@/lib/supabase'

type AdminIssueActionsProps = {
  issue: Issue
  adminName: string
}

export default function AdminIssueActions({ issue, adminName }: AdminIssueActionsProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [status, setStatus] = useState(issue.status)
  const [officialResponse, setOfficialResponse] = useState(issue.official_response || '')

  const handleUpdate = async () => {
    setIsUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/update-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueId: issue.id,
          status,
          officialResponse: officialResponse.trim() || null,
          respondedBy: officialResponse.trim() ? adminName : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update issue')
      }

      setSuccess('Issue updated successfully!')
      
      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh()
      }, 1000)

    } catch (err) {
      console.error('Error updating issue:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update issue'
      setError(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {/* Status Update */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Update Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="Open">Open</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Official Response */}
        <div>
          <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
            Official Response
          </label>
          <textarea
            id="response"
            value={officialResponse}
            onChange={(e) => setOfficialResponse(e.target.value)}
            rows={6}
            placeholder="Provide an official response to this issue..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be visible to all citizens
          </p>
        </div>

        {/* Update Button */}
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {isUpdating ? 'Updating...' : 'Update Issue'}
        </button>

        {/* Quick Info */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Votes:</span>
              <span className="font-medium text-gray-900">{issue.vote_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Comments:</span>
              <span className="font-medium text-gray-900">{issue.comment_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium text-gray-900">{issue.category}</span>
            </div>
          </div>
        </div>

        {/* View Public Link */}
        <div className="pt-4 border-t border-gray-200">
          
            href={`/issue/${issue.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          <a>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Public Page
          </a>
        </div>
      </div>
    </div>
  )
}