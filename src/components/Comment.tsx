'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CommentData = {
  id: string
  content: string
  author_name: string
  created_at: string
  user_id: string
}

type CommentProps = {
  comment: CommentData
  currentUserId: string | null
  issueId: string
}

export default function Comment({ comment, currentUserId, issueId }: CommentProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isAuthor = currentUserId === comment.user_id

  async function handleDelete() {
    setIsDeleting(true)

    try {
      const response = await fetch('/api/comment', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: comment.id,
          issueId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete comment')
      }

      // Refresh page to show updated comments
      router.refresh()

    } catch (error: any) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment. Please try again.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Format the date nicely
  const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Comment Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-medium text-gray-900">{comment.author_name}</span>
          <span className="text-sm text-gray-500 ml-2">{formattedDate}</span>
        </div>
        
        {/* Delete button - only show to comment author */}
        {isAuthor && (
          <div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sure?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="text-gray-600 hover:text-gray-700 text-sm font-medium disabled:opacity-50"
                >
                  No
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment Content */}
      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
    </div>
  )
}