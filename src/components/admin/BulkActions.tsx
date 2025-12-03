'use client'

import { useState } from 'react'

type BulkActionsProps = {
  selectedIssues: string[]
  onClearSelection: () => void
  onRefresh: () => void
}

export default function BulkActions({ 
  selectedIssues, 
  onClearSelection,
  onRefresh 
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const selectedCount = selectedIssues.length

  if (selectedCount === 0) {
    return null
  }

  async function handleBulkStatusChange(newStatus: string) {
    setIsProcessing(true)
    setShowStatusMenu(false)

    try {
      const response = await fetch('/api/admin/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-status',
          issueIds: selectedIssues,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update issues')
      }

      alert(`Successfully updated ${data.affectedCount || selectedCount} issue(s) to "${newStatus}"`)
      onClearSelection()
      onRefresh()
    } catch (error) {
      console.error('Error updating issues:', error)
      const message = error instanceof Error ? error.message : 'Failed to update issues. Please try again.'
      alert(message)
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleBulkCategoryChange(newCategory: string) {
    setIsProcessing(true)
    setShowCategoryMenu(false)

    try {
      const response = await fetch('/api/admin/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-category',
          issueIds: selectedIssues,
          category: newCategory,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update categories')
      }

      alert(`Successfully updated ${data.affectedCount || selectedCount} issue(s) to category "${newCategory}"`)
      onClearSelection()
      onRefresh()
    } catch (error) {
      console.error('Error updating categories:', error)
      const message = error instanceof Error ? error.message : 'Failed to update categories. Please try again.'
      alert(message)
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleBulkDelete() {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/admin/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          issueIds: selectedIssues,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete issues')
      }

      alert(`Successfully deleted ${data.affectedCount || selectedCount} issue(s)`)
      onClearSelection()
      onRefresh()
    } catch (error) {
      console.error('Error deleting issues:', error)
      const message = error instanceof Error ? error.message : 'Failed to delete issues. Please try again.'
      alert(message)
    } finally {
      setIsProcessing(false)
      setShowDeleteConfirm(false)
    }
  }

  async function handleExportSelected() {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/admin/export-issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueIds: selectedIssues,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to export issues')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `issues-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert(`Successfully exported ${selectedCount} issue(s)`)
    } catch (error) {
      console.error('Error exporting issues:', error)
      alert('Failed to export issues. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center gap-6">
            {/* Selection Count */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                {selectedCount}
              </div>
              <span className="font-medium">
                {selectedCount} issue{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-700"></div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Change Status */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Change Status
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showStatusMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white text-gray-900 rounded-lg shadow-lg border border-gray-200 min-w-[200px] overflow-hidden">
                    {['Open', 'Under Review', 'In Progress', 'Completed', 'Closed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleBulkStatusChange(status)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Change Category */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Change Category
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showCategoryMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white text-gray-900 rounded-lg shadow-lg border border-gray-200 min-w-[250px] overflow-hidden max-h-64 overflow-y-auto">
                    {[
                      'Environment & Sustainability',
                      'Housing & Zoning',
                      'Transportation & Infrastructure',
                      'Public Safety',
                      'Health & Human Services',
                      'Education & Youth',
                      'Governance & Transparency',
                      'Economic Development'
                    ].map((category) => (
                      <button
                        key={category}
                        onClick={() => handleBulkCategoryChange(category)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-sm"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Export */}
              <button
                onClick={handleExportSelected}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>

              {/* Delete */}
              {!showDeleteConfirm ? (
                <button
                  onClick={handleBulkDelete}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-400 mr-2">Confirm delete?</span>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isProcessing}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 text-sm font-semibold"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isProcessing}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-700"></div>

            {/* Clear Selection */}
            <button
              onClick={onClearSelection}
              disabled={isProcessing}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Clear selection"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}