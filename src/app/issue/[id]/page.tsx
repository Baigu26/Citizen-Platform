import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import VoteButtons from '@/components/VoteButtons'
import CommentForm from '@/components/CommentForm'
import Comment from '@/components/Comment'
import UserMenu from '@/components/UserMenu'

type PageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    from?: string
  }>
}

export default async function IssueDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { from } = await searchParams

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
    .is('parent_comment_id', null)
    .order('created_at', { ascending: false })

  // Determine back link based on where user came from
  const getBackLink = () => {
    if (from === 'trending') return '/trending'
    if (from === 'city') return `/city/${issue.city}`
    return '/landing' // default to homepage
  }

  const getBackText = () => {
    if (from === 'trending') return 'Back to Trending'
    if (from === 'city') return `Back to ${issue.city}`
    return 'Back to Home'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/landing" className="flex items-center gap-3">
              <img 
                src="/Logo.png" 
                alt="People's Voice Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <div className="text-xl font-bold text-gray-900">PEOPLE&apos;S</div>
                <div className="text-xl font-bold text-gray-900">VOICE</div>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Community Issues..."
                  className="w-full px-4 py-3 pl-10 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {currentUser ? (
                <>
                  <Link
                    href="/create-issue"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    New Post
                  </Link>
                  <UserMenu profile={currentUser.profile} />
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    Sign-Up
                  </Link>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-12 h-14">
            <Link href="/landing" className="hover:text-blue-200 transition-colors font-medium">
              Home
            </Link>
            <Link href="/about" className="hover:text-blue-200 transition-colors font-medium">
              About Us
            </Link>
            <Link href="/town-selection" className="hover:text-blue-200 transition-colors font-medium">
              Town Selection
            </Link>
            <Link href="/trending" className="hover:text-blue-200 transition-colors font-medium">
              Trending Posts
            </Link>
            <Link href="/settings" className="hover:text-blue-200 transition-colors font-medium">
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          href={getBackLink()} 
          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {getBackText()}
        </Link>

        {/* Issue Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Issue Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start gap-6">
              {/* Vote Section */}
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
                  <span className="font-medium text-blue-600 text-base">
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

          {/* Official Response (if exists) - NEW SECTION ADDED HERE */}
          {issue.official_response && (
            <div className="border-t border-gray-200 px-6 py-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1 a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Official Response</h3>
                    <p className="text-blue-800 leading-relaxed whitespace-pre-wrap mb-3">
                      {issue.official_response}
                    </p>
                    <div className="text-sm text-blue-700">
                      {issue.responded_by && (
                        <span className="font-medium">{issue.responded_by}</span>
                      )}
                      {issue.official_response_date && (
                        <span className="text-blue-600">
                          {' • '}
                          {new Date(issue.official_response_date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-gray-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-300">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-gray-300">
                Cookie Policy
              </Link>
              <Link href="/contact" className="hover:text-gray-300">
                Contact Us
              </Link>
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-sm">Follow Us</span>
              <Link href="#" className="hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
              <Link href="#" className="hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              <Link href="#" className="hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">
            © 2025 The Peoples Voice. All Rights Reserved. Unauthorized use or reproduction is strictly prohibited.
          </div>
        </div>
      </footer>
    </div>
  )
}