'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type CardVoteButtonsProps = {
  issueId: string
  initialVoteCount: number
  userId: string | null
  currentUserVote: 'up' | 'down' | null
}

export default function CardVoteButtons({ 
  issueId, 
  initialVoteCount, 
  userId,
  currentUserVote 
}: CardVoteButtonsProps) {
  const router = useRouter()
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(currentUserVote)
  const [isVoting, setIsVoting] = useState(false)

  // Update local state when props change
  useEffect(() => {
    setVoteCount(initialVoteCount)
    setUserVote(currentUserVote)
  }, [initialVoteCount, currentUserVote])

  async function handleVote(e: React.MouseEvent, voteType: 'up' | 'down') {
    // Stop the click from navigating to the issue page
    e.preventDefault()
    e.stopPropagation()

    // Check if user is logged in
    if (!userId) {
      alert('Please log in to vote')
      router.push('/login')
      return
    }

    // Prevent multiple clicks
    if (isVoting) return
    setIsVoting(true)

    try {
      // Calculate optimistic vote count
      let newVoteCount = voteCount
      let newUserVote: 'up' | 'down' | null = voteType

      if (userVote === null) {
        newVoteCount = voteType === 'up' ? voteCount + 1 : voteCount - 1
      } else if (userVote === voteType) {
        newVoteCount = voteType === 'up' ? voteCount - 1 : voteCount + 1
        newUserVote = null
      } else {
        newVoteCount = voteType === 'up' ? voteCount + 2 : voteCount - 2
      }

      // Update UI optimistically
      setVoteCount(newVoteCount)
      setUserVote(newUserVote)

      // Send vote to server
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueId,
          voteType: newUserVote,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote')
      }

      // Update with actual vote count from server
      setVoteCount(data.voteCount)
      
      // Refresh the page data
      router.refresh()

    } catch (error) {
      console.error('Error voting:', error)
      setVoteCount(initialVoteCount)
      setUserVote(currentUserVote)
      alert('Failed to vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Upvote Button */}
      <button
        onClick={(e) => handleVote(e, 'up')}
        disabled={isVoting}
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors disabled:opacity-50 ${
          userVote === 'up'
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
        }`}
        title="Upvote"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
        <span className="font-semibold text-sm">{voteCount}</span>
      </button>

      {/* Downvote Button */}
      <button
        onClick={(e) => handleVote(e, 'down')}
        disabled={isVoting}
        className={`p-1 rounded-md transition-colors disabled:opacity-50 ${
          userVote === 'down'
            ? 'bg-red-100 text-red-600'
            : 'text-gray-400 hover:bg-gray-100 hover:text-red-600'
        }`}
        title="Downvote"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
        </svg>
      </button>
    </div>
  )
}