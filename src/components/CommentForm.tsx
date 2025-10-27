'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CommentFormProps = {
  issueId: string
  userId: string | null
  parentCommentId?: string | null
  onSuccess?: () => void
  placeholder?: string
  buttonText?: string
}

export default function CommentForm({ 
  issueId, 
  userId, 
  parentCommentId = null,
  onSuccess,
  placeholder = "Share your thoughts...",
  buttonText = "Post Comment"
}: CommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Check if user is logged in
    if (!userId) {
      alert('Please log in to comment')
      router.push('/login')
      return
    }

    // Validate content
    if (!content.trim()) {
      setError('Comment cannot be empty')
      return
    }

    if (content.trim().length > 2000) {
      setError('Comment must be less than 2000 characters')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueId,
          content: content.trim(),
          parentCommentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment')
      }

      // Clear form
      setContent('')
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Refresh page to show new comment
      router.refresh()

    } catch (error: any) {
      console.error('Error posting comment:', error)
      setError(error.message || 'Failed to post comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If not logged in, show login prompt
  if (!userId) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-blue-800 mb-3">
          You need to be logged in to post comments
        </p>
        <button
          onClick={() => router.push('/login')}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Log In to Comment
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={2000}
        disabled={isSubmitting}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {content.length} / 2000 characters
        </span>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : buttonText}
        </button>
      </div>
    </form>
  )
}