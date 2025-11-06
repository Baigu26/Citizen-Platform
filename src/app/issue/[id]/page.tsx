import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import VoteButtons from '@/components/VoteButtons'
import CommentForm from '@/components/CommentForm'
import Comment from '@/components/Comment'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function IssueDetailPage({ params }: PageProps) {
  const { id } = await params

  // Get current user
  const currentUser = await getCurrentUser()

  // Fetch the specific issue from the database
  const { data: issue, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .single()

  // If issue doesn't exist, show 404
  if (error || !issue) {
    notFound()
  }

  // Get the current user's vote for this issue (if they're logged in)
  let currentUserVote: 'up' | 'down' | null = null
  if (currentUser) {
    const { data: voteData } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('user_id', currentUser.user.id)
      .eq('issue_id', id)
      .single()
    
    if (voteData) {
      currentUserVote = voteData.vote_type as 'up' | 'down'
    }
  }

  // Get all comments for this issue
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('issue_id', id)
    .is('parent_comment_id', null) // Only get top-level comments (not replies)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-cyan-600 text-white py-6 shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-cyan-100 hover:text-white mb-2 inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Issues
          </Link>
          <h1 className="text-3xl font-bold mt-2">People&apos;s Voice</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Issue Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Issue Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start gap-6">
              {/* Vote Section - Now with functional buttons! */}
              <VoteButtons
                issueId={issue.id}
                initialVoteCount={issue.vote_count}
                userId={currentUser?.user.id || null}
                currentUserVote={currentUserVote}
              />

              {/* Issue Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {issue.title}
                </h1>

                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-medium text-cyan-600 text-base">
                    📍 {issue.city}
                  </span>

                  {issue.zip_code && (
                    <span className="text-gray-500">
                      {issue.zip_code}
                    </span>
                  )}

                  {issue.category && (
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
                      {issue.category}
                    </span>
                  )}

                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    issue.status === 'Open' ? 'bg-green-100 text-green-700' :
                    issue.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' :
                    issue.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    issue.status === 'Completed' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {issue.status}
                  </span>
                </div>

                {/* Author and Date */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  {issue.author_name && (
                    <span>
                      Posted by <span className="font-medium text-gray-700">{issue.author_name}</span>
                    </span>
                  )}
                  <span>•</span>
                  <span>
                    {new Date(issue.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {issue.description}
              </p>
            </div>

            {/* Image if exists */}
            {issue.image_url && (
              <div className="mt-6">
                <Image 
                  src={issue.image_url} 
                  alt={issue.title}
                  width={800}
                  height={600}
                  className="rounded-lg max-w-full h-auto"
                />
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Comments ({issue.comment_count})
              </h2>
            </div>

            {/* Comment Form */}
            <div className="mb-6">
              <CommentForm
                issueId={issue.id}
                userId={currentUser?.user.id || null}
              />
            </div>

            {/* Comments List */}
            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUser?.user.id || null}
                    issueId={issue.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-medium">No comments yet</p>
                <p className="text-sm mt-1">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
