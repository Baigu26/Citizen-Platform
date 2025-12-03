'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CommentForm from './CommentForm'

type CommentData = {
  id: string
  content: string
  author_name: string
  created_at: string
  user_id: string
  parent_comment_id: string | null
  replies?: CommentData[]
}

type CommentProps = {
  comment: CommentData
  currentUserId: string | null
  issueId: string
  isReply?: boolean
}

export default function Comment({ comment, currentUserId, issueId, isReply = false }: CommentProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)

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

      router.refresh()

    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment. Please try again.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Format date consistently to avoid hydration mismatch
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 || 12
  
    return `${month} ${day}, ${year} at ${hour12}:${minutes} ${ampm}`
}

const formattedDate = formatDate(comment.created_at)

  return (
    <div className={`${isReply ? 'ml-6 sm:ml-10 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{comment.author_name}</span>
            {isReply && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                Reply
              </span>
            )}
            <span className="text-sm text-gray-500">{formattedDate}</span>
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
        <p className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>

        {/* Reply Button - Only for top-level comments or when user is logged in */}
        {currentUserId && !isReply && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            {showReplyForm ? 'Cancel' : 'Reply'}
          </button>
        )}

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <CommentForm
              issueId={issueId}
              userId={currentUserId}
              parentCommentId={comment.id}
              onSuccess={() => setShowReplyForm(false)}
              placeholder={`Reply to ${comment.author_name}...`}
              buttonText="Post Reply"
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              issueId={issueId}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}