'use client'

import Link from 'next/link'

// This component shows a modal when potential duplicate issues are found
// It gives the user the option to view existing issues or continue posting

type DuplicateIssue = {
  id: string
  title: string
  description: string
  vote_count: number
  comment_count: number
  city: string
  category: string
  created_at: string
}

type DuplicateWarningModalProps = {
  isOpen: boolean
  duplicates: DuplicateIssue[]
  onClose: () => void
  onContinue: () => void
}

export default function DuplicateWarningModal({
  isOpen,
  duplicates,
  onClose,
  onContinue
}: DuplicateWarningModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop - dark overlay behind the modal */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Similar Issues Found
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  We found {duplicates.length} existing {duplicates.length === 1 ? 'issue' : 'issues'} that might be related to yours. 
                  You can view {duplicates.length === 1 ? 'it' : 'them'} and add your support, or continue posting if your issue is different.
                </p>
              </div>
            </div>
          </div>

          {/* List of duplicate issues */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {duplicates.map((issue) => (
                <div 
                  key={issue.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {issue.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {issue.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
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
                        <span className="text-blue-600">
                          {issue.city}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/issue/${issue.id}`}
                      className="flex-shrink-0 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer with action buttons */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <p className="text-sm text-gray-600 mr-auto">
              Your draft has been saved automatically
            </p>
            <button
              onClick={onContinue}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Continue Posting Anyway
            </button>
          </div>
        </div>
      </div>
    </>
  )
}