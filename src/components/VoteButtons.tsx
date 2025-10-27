'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type VoteButtonsProps = {
  issueId: string
  initialVoteCount: number
  userId: string | null
  currentUserVote: 'up' | 'down' | null
}

export default function VoteButtons({ 
  issueId, 
  initialVoteCount, 
  userId,
  currentUserVote 
}: VoteButtonsProps) {
  const router = useRouter()
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(currentUserVote)
  const [isVoting, setIsVoting] = useState(false)

  // Update local state when props change
  useEffect(() => {
    setVoteCount(initialVoteCount)
    setUserVote(currentUserVote)
  }, [initialVoteCount, currentUserVote])

  async function handleVote(voteType: 'up' | 'down') { 
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
      // Calculate optimistic vote count (update UI immediately)
      let newVoteCount = voteCount
      let newUserVote: 'up' | 'down' | null = voteType

      if (userVote === null) {
        // No previous vote - add new vote
        newVoteCount = voteType === 'up' ? voteCount + 1 : voteCount - 1
      } else if (userVote === voteType) {
        // Clicking same button - remove vote
        newVoteCount = voteType === 'up' ? voteCount - 1 : voteCount + 1
        newUserVote = null
      } else {
        // Switching vote (e.g., from down to up)
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
          voteType: newUserVote, // null means remove vote
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
      // Revert to original state on error
      setVoteCount(initialVoteCount)
      setUserVote(currentUserVote)
      alert('Failed to vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  return (
  <div className="flex flex-col items-center">
    {/* Upvote Button */}
    <button
      onClick={() => handleVote('up')}
      disabled={isVoting}
      className={`transition-colors disabled:opacity-50 ${
        userVote === 'up'
          ? 'text-green-600'
          : 'text-gray-400 hover:text-green-600'
      }`}
      title="Upvote"
    >
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>

    {/* Vote Count */}
    <span className="text-3xl font-bold text-gray-700 my-2">
      {voteCount}
    </span>

    {/* Downvote Button */}
    <button
      onClick={() => handleVote('down')}
      disabled={isVoting}
      className={`transition-colors disabled:opacity-50 ${
        userVote === 'down'
          ? 'text-red-600'
          : 'text-gray-400 hover:text-red-600'
      }`}
      title="Downvote"
    >
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>
)
}